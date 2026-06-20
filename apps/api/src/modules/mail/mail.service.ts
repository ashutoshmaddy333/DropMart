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

  constructor() {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: { user, pass },
      });
    }
  }

  async send(options: SendMailOptions): Promise<boolean> {
    const recipients = Array.isArray(options.to) ? options.to : [options.to];
    const from =
      process.env.SMTP_FROM_EMAIL ??
      (process.env.SMTP_FROM ? `DropMart <${process.env.SMTP_FROM}>` : undefined) ??
      (process.env.SMTP_USER ? `DropMart <${process.env.SMTP_USER}>` : "noreply@dropmart.in");

    if (!this.transporter) {
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
      this.logger.log(`Email sent to ${recipients.join(", ")}: ${options.subject}`);
      return true;
    } catch (err) {
      this.logger.error(`Failed to send email: ${(err as Error).message}`);
      return false;
    }
  }
}
