import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { randomInt } from "crypto";
import { PrismaService } from "../../prisma/prisma.module";
import { MailService } from "../mail/mail.service";
import { registrationOtpEmail } from "../notifications/email-templates";

const OTP_TTL_SECONDS = 600;
const RATE_LIMIT_SECONDS = 60;

@Injectable()
export class EmailOtpService {
  private readonly logger = new Logger(EmailOtpService.name);

  constructor(
    private prisma: PrismaService,
    private mail: MailService,
  ) {}

  normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  assertValidEmail(email: string) {
    const normalized = this.normalizeEmail(email);
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!pattern.test(normalized)) {
      throw new BadRequestException("Enter a valid email address");
    }
    const [, domain] = normalized.split("@");
    if (!domain || domain.length < 4 || !domain.includes(".")) {
      throw new BadRequestException("Enter a valid email address with a proper domain");
    }
    return normalized;
  }

  async sendRegistrationOtp(rawEmail: string) {
    const email = this.assertValidEmail(rawEmail);

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException("Email already registered");

    await this.enforceRateLimit(email);

    const otp = String(randomInt(100000, 999999));
    const hash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + OTP_TTL_SECONDS * 1000);

    const emailContent = registrationOtpEmail({
      otp,
      expiresMinutes: OTP_TTL_SECONDS / 60,
    });

    const sent = await this.mail.send({
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    this.logger.log(
      `[OTP] send attempt email=${email} smtpSent=${sent} smtpError=${this.mail.getLastError() ?? "none"}`,
    );

    const isDev = process.env.NODE_ENV !== "production";

    if (!sent) {
      this.logger.warn(`[OTP] Email delivery failed for ${email}`);
      const smtpError = this.mail.getLastError();
      if (isDev) {
        this.logger.warn(`[DEV OTP] ${email} → ${otp} (valid ${OTP_TTL_SECONDS / 60} min)`);
        await this.persistOtp(email, hash, expiresAt);
        return {
          success: true,
          message: "Verification code generated (check API logs — SMTP not configured)",
          expiresIn: OTP_TTL_SECONDS,
          retryAfter: RATE_LIMIT_SECONDS,
          emailSent: false,
          devOtp: otp,
        };
      }
      throw new ServiceUnavailableException(
        smtpError
          ? `Could not send verification email: ${smtpError}`
          : "Could not send verification email. Check SMTP settings on the server or try again later.",
      );
    }

    await this.persistOtp(email, hash, expiresAt);

    return {
      success: true,
      message: "Verification code sent to your email",
      expiresIn: OTP_TTL_SECONDS,
      retryAfter: RATE_LIMIT_SECONDS,
      emailSent: true,
    };
  }

  async verifyRegistrationOtp(rawEmail: string, otp: string) {
    const email = this.assertValidEmail(rawEmail);
    if (!/^\d{6}$/.test(otp)) {
      throw new BadRequestException("Enter the 6-digit verification code");
    }

    const stored = await this.prisma.registrationOtp.findUnique({ where: { email } });
    if (!stored || stored.expiresAt < new Date()) {
      if (stored) {
        await this.prisma.registrationOtp.delete({ where: { email } }).catch(() => undefined);
      }
      throw new BadRequestException("Verification code expired or not requested. Send a new code.");
    }

    const valid = await bcrypt.compare(otp, stored.hash);
    if (!valid) {
      throw new BadRequestException("Invalid verification code");
    }

    await this.prisma.registrationOtp.delete({ where: { email } });
    return true;
  }

  private async persistOtp(email: string, hash: string, expiresAt: Date) {
    await this.prisma.registrationOtp.upsert({
      where: { email },
      create: { email, hash, expiresAt, lastSentAt: new Date() },
      update: { hash, expiresAt, lastSentAt: new Date() },
    });
  }

  private async enforceRateLimit(email: string) {
    const existing = await this.prisma.registrationOtp.findUnique({ where: { email } });
    if (!existing) return;

    const elapsed = Date.now() - existing.lastSentAt.getTime();
    if (elapsed < RATE_LIMIT_SECONDS * 1000) {
      const waitSec = Math.ceil((RATE_LIMIT_SECONDS * 1000 - elapsed) / 1000);
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Please wait ${waitSec}s before requesting another code`,
          retryAfter: waitSec,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }
}
