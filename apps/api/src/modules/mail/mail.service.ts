import { Injectable, Logger } from "@nestjs/common";
import * as nodemailer from "nodemailer";

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private lastError: string | null = null;

  constructor() {
    const host = process.env.SMTP_HOST?.trim();
    const user = process.env.SMTP_USER?.trim();
    const pass = process.env.SMTP_PASS?.replace(/\s/g, "");
    const port = Number(process.env.SMTP_PORT ?? 587);
    const secure = process.env.SMTP_SECURE === "true";

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        requireTLS: !secure && port === 587,
        auth: { user, pass },
        tls: { minVersion: "TLSv1.2" },
      });
      this.logger.log(`SMTP configured: ${user}@${host}:${port} (secure=${secure})`);
    } else {
      this.logger.warn("SMTP not configured — set SMTP_HOST, SMTP_USER, SMTP_PASS");
    }
  }

  getLastError() {
    return this.lastError;
  }

  async verifyConnection(): Promise<boolean> {
    if (!this.transporter) return false;
    try {
      await this.transporter.verify();
      this.lastError = null;
      return true;
    } catch (err) {
      this.lastError = (err as Error).message;
      this.logger.error(`SMTP verify failed: ${this.lastError}`);
      return false;
    }
  }

  async send(options: SendMailOptions): Promise<boolean> {
    const recipients = Array.isArray(options.to) ? options.to : [options.to];
    const from =
      process.env.SMTP_FROM_EMAIL?.trim() ??
      (process.env.SMTP_FROM?.trim()
        ? `DropMart <${process.env.SMTP_FROM.trim()}>`
        : undefined) ??
      (process.env.SMTP_USER?.trim()
        ? `DropMart <${process.env.SMTP_USER.trim()}>`
        : "noreply@dropmart.in");

    if (!this.transporter) {
      this.lastError = "SMTP not configured";
      this.logger.warn(`[DEV EMAIL] To: ${recipients.join(", ")} | Subject: ${options.subject}`);
      this.logger.warn(options.text ?? options.html.replace(/<[^>]+>/g, " "));
      return false;
    }

    try {
      await this.transporter.sendMail({
        from,
        to: recipients.join(", "),
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      this.lastError = null;
      this.logger.log(`Email sent to ${recipients.join(", ")}: ${options.subject}`);
      return true;
    } catch (err) {
      this.lastError = (err as Error).message;
      this.logger.error(`Failed to send email: ${this.lastError}`);
      return false;
    }
  }
}
