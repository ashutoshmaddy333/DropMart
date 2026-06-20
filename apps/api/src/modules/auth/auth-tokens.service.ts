import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { createHash, randomBytes } from "crypto";
import type { Response } from "express";
import { PrismaService } from "../../prisma/prisma.module";
import { JwtPayload } from "../../common/decorators/auth.decorators";

export const ACCESS_COOKIE = "dropmart_access";
export const REFRESH_COOKIE = "dropmart_refresh";
export const CSRF_COOKIE = "dropmart_csrf";
export const ROLE_COOKIE = "dropmart_role";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  csrfToken: string;
}

@Injectable()
export class AuthTokensService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  get accessExpiresIn() {
    return process.env.JWT_ACCESS_EXPIRES_IN ?? "15m";
  }

  get refreshExpiresInDays() {
    return Number(process.env.JWT_REFRESH_EXPIRES_IN_DAYS ?? "7");
  }

  signAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, { expiresIn: this.accessExpiresIn });
  }

  generateRefreshToken(): string {
    return randomBytes(48).toString("hex");
  }

  generateCsrfToken(): string {
    return randomBytes(32).toString("hex");
  }

  hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  async createRefreshToken(userId: string, rawToken: string, meta?: { userAgent?: string; ip?: string }) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.refreshExpiresInDays);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: this.hashToken(rawToken),
        expiresAt,
        userAgent: meta?.userAgent,
        ip: meta?.ip,
      },
    });
  }

  async validateRefreshToken(rawToken: string) {
    const record = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: this.hashToken(rawToken) },
      include: {
        user: {
          include: {
            role: { include: { rolePermissions: { include: { permission: true } } } },
            supplier: { include: { status: true } },
            deliveryBoy: true,
          },
        },
      },
    });

    if (!record || record.revokedAt || record.expiresAt < new Date()) return null;
    if (!record.user.isActive) return null;
    return record;
  }

  async revokeRefreshToken(rawToken: string) {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: this.hashToken(rawToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllUserTokens(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async rotateRefreshToken(oldRawToken: string, meta?: { userAgent?: string; ip?: string }) {
    const record = await this.validateRefreshToken(oldRawToken);
    if (!record) return null;

    await this.revokeRefreshToken(oldRawToken);
    const newRefreshToken = this.generateRefreshToken();
    await this.createRefreshToken(record.userId, newRefreshToken, meta);
    return { user: record.user, refreshToken: newRefreshToken };
  }

  setAuthCookies(
    res: Response,
    tokens: AuthTokens & { role: string },
  ) {
    const secure = process.env.COOKIE_SECURE === "true";
    const sameSite =
      (process.env.COOKIE_SAME_SITE as "lax" | "none" | "strict" | undefined) ??
      (secure ? "none" : "lax");
    const common = { sameSite, secure, path: "/" };

    res.cookie(ACCESS_COOKIE, tokens.accessToken, {
      ...common,
      httpOnly: true,
      maxAge: this.parseMaxAge(this.accessExpiresIn),
    });

    res.cookie(REFRESH_COOKIE, tokens.refreshToken, {
      ...common,
      httpOnly: true,
      maxAge: this.refreshExpiresInDays * 24 * 60 * 60 * 1000,
    });

    res.cookie(CSRF_COOKIE, tokens.csrfToken, {
      ...common,
      httpOnly: false,
      maxAge: this.refreshExpiresInDays * 24 * 60 * 60 * 1000,
    });

    res.cookie(ROLE_COOKIE, tokens.role, {
      ...common,
      httpOnly: false,
      maxAge: this.refreshExpiresInDays * 24 * 60 * 60 * 1000,
    });
  }

  clearAuthCookies(res: Response) {
    const secure = process.env.COOKIE_SECURE === "true";
    const sameSite =
      (process.env.COOKIE_SAME_SITE as "lax" | "none" | "strict" | undefined) ??
      (secure ? "none" : "lax");
    const opts = { path: "/", sameSite, secure };
    res.clearCookie(ACCESS_COOKIE, { ...opts, httpOnly: true });
    res.clearCookie(REFRESH_COOKIE, { ...opts, httpOnly: true });
    res.clearCookie(CSRF_COOKIE, opts);
    res.clearCookie(ROLE_COOKIE, opts);
  }

  private parseMaxAge(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 15 * 60 * 1000;
    const n = Number(match[1]);
    const unit = match[2];
    const multipliers: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
    return n * (multipliers[unit] ?? 60_000);
  }
}
