import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { randomInt } from "crypto";
import { PrismaService } from "../../prisma/prisma.module";
import { RedisService } from "../../redis/redis.service";
import { MailService } from "../mail/mail.service";
import { registrationOtpEmail } from "../notifications/email-templates";

const OTP_TTL_SECONDS = 600;
const RATE_LIMIT_SECONDS = 60;
const OTP_KEY = (email: string) => `otp:register:${email}`;
const RATE_KEY = (email: string) => `otp:ratelimit:${email}`;

interface MemoryOtpEntry {
  hash: string;
  expiresAt: number;
}

@Injectable()
export class EmailOtpService {
  private readonly logger = new Logger(EmailOtpService.name);
  private readonly memory = new Map<string, MemoryOtpEntry>();
  private readonly rateMemory = new Map<string, number>();

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
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
    await this.storeOtp(email, hash);

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

    if (!sent) {
      this.logger.warn(`[DEV OTP] ${email} → ${otp} (valid ${OTP_TTL_SECONDS / 60} min)`);
    }

    return { success: true, message: "Verification code sent to your email", expiresIn: OTP_TTL_SECONDS };
  }

  async verifyRegistrationOtp(rawEmail: string, otp: string) {
    const email = this.assertValidEmail(rawEmail);
    if (!/^\d{6}$/.test(otp)) {
      throw new BadRequestException("Enter the 6-digit verification code");
    }

    const stored = await this.getStoredHash(email);
    if (!stored) {
      throw new BadRequestException("Verification code expired or not requested. Send a new code.");
    }

    const valid = await bcrypt.compare(otp, stored);
    if (!valid) {
      throw new BadRequestException("Invalid verification code");
    }

    await this.deleteOtp(email);
    return true;
  }

  private async enforceRateLimit(email: string) {
    const rateKey = RATE_KEY(email);
    if (this.redis.isAvailable()) {
      const last = await this.redis.get(rateKey);
      if (last) throw new HttpException("Please wait before requesting another code", HttpStatus.TOO_MANY_REQUESTS);
      await this.redis.set(rateKey, "1", RATE_LIMIT_SECONDS);
      return;
    }

    const lastSent = this.rateMemory.get(email);
    if (lastSent && Date.now() - lastSent < RATE_LIMIT_SECONDS * 1000) {
      throw new HttpException("Please wait before requesting another code", HttpStatus.TOO_MANY_REQUESTS);
    }
    this.rateMemory.set(email, Date.now());
  }

  private async storeOtp(email: string, hash: string) {
    if (this.redis.isAvailable()) {
      await this.redis.set(OTP_KEY(email), hash, OTP_TTL_SECONDS);
      return;
    }
    this.memory.set(email, { hash, expiresAt: Date.now() + OTP_TTL_SECONDS * 1000 });
  }

  private async getStoredHash(email: string) {
    if (this.redis.isAvailable()) {
      return this.redis.get(OTP_KEY(email));
    }
    const entry = this.memory.get(email);
    if (!entry) return null;
    if (entry.expiresAt < Date.now()) {
      this.memory.delete(email);
      return null;
    }
    return entry.hash;
  }

  private async deleteOtp(email: string) {
    if (this.redis.isAvailable()) {
      await this.redis.del(OTP_KEY(email));
      return;
    }
    this.memory.delete(email);
  }
}
