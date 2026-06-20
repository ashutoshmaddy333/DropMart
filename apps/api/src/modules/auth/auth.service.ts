import { Injectable, UnauthorizedException, ConflictException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import type { Response } from "express";
import { PrismaService } from "../../prisma/prisma.module";
import { LoginDto, RegisterCustomerDto, RegisterSupplierDto } from "./dto/auth.dto";
import { JwtPayload } from "../../common/decorators/auth.decorators";
import { NotificationsService } from "../notifications/notifications.service";
import { supplierRegisteredEmail } from "../notifications/email-templates";
import { AuthTokensService } from "./auth-tokens.service";
import { EmailOtpService } from "./email-otp.service";

type AuthUserRecord = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatar: string | null;
  role: { code: string; label: string; rolePermissions: { permission: { code: string } }[] };
  supplier?: { id: string; businessName: string; status: { code: string; label: string } } | null;
  deliveryBoy?: { id: string } | null;
};

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  csrfToken: string;
  user: ReturnType<AuthService["mapUser"]>;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private tokens: AuthTokensService,
    private notifications: NotificationsService,
    private emailOtp: EmailOtpService,
  ) {}

  async login(dto: LoginDto, meta?: { userAgent?: string; ip?: string }) {
    const user = await this.findUserWithRelations(dto.email);
    if (!user || !user.isActive) throw new UnauthorizedException("Invalid credentials");

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException("Invalid credentials");

    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    return this.issueTokens(user, meta);
  }

  async registerCustomer(dto: RegisterCustomerDto, meta?: { userAgent?: string; ip?: string }) {
    const email = this.emailOtp.normalizeEmail(dto.email);
    await this.emailOtp.verifyRegistrationOtp(email, dto.otp);

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException("Email already registered");

    const role = await this.prisma.masterRole.findUnique({ where: { code: "customer" } });
    const activeStatus = await this.prisma.masterUserStatus.findUnique({ where: { code: "active" } });
    if (!role || !activeStatus) throw new ConflictException("Customer role not configured");

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email,
        phone: dto.phone,
        passwordHash,
        roleId: role.id,
        statusId: activeStatus.id,
      },
      include: this.userInclude(),
    });

    return this.issueTokens(user, meta);
  }

  async registerSupplier(dto: RegisterSupplierDto, meta?: { userAgent?: string; ip?: string }) {
    const userEmail = this.emailOtp.normalizeEmail(dto.email);
    await this.emailOtp.verifyRegistrationOtp(userEmail, dto.otp);

    const existing = await this.prisma.user.findUnique({ where: { email: userEmail } });
    if (existing) throw new ConflictException("Email already registered");

    const role = await this.prisma.masterRole.findUnique({ where: { code: "supplier" } });
    const activeUserStatus = await this.prisma.masterUserStatus.findUnique({ where: { code: "active" } });
    const pendingStatus = await this.prisma.masterSupplierStatus.findUnique({
      where: { code: "pending_verification" },
    });
    if (!role || !activeUserStatus || !pendingStatus) {
      throw new ConflictException("Supplier registration not configured");
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: userEmail,
        phone: dto.phone,
        passwordHash,
        roleId: role.id,
        statusId: activeUserStatus.id,
        supplier: {
          create: {
            businessName: dto.businessName,
            warehouseCity: dto.warehouseCity,
            gstNumber: dto.gstNumber,
            address: dto.address,
            statusId: pendingStatus.id,
          },
        },
      },
      include: this.userInclude(),
    });

    const adminBase = process.env.ADMIN_APP_URL ?? process.env.CORS_ORIGIN ?? "http://localhost:3000";
    const adminEmail = supplierRegisteredEmail({
      businessName: dto.businessName,
      contactName: dto.name,
      email: userEmail,
      warehouseCity: dto.warehouseCity,
      adminUrl: `${adminBase}/admin/suppliers`,
    });

    await this.notifications.notifyAdmins({
      type: "supplier_registered",
      title: "New Supplier Registration",
      message: `${dto.businessName} (${userEmail}) registered and needs verification.`,
      link: "/admin/suppliers",
      metadata: {
        supplierId: user.supplier?.id,
        businessName: dto.businessName,
        email: userEmail,
      },
      emailSubject: adminEmail.subject,
      emailHtml: adminEmail.html,
      emailText: adminEmail.text,
    });

    return this.issueTokens(user, meta);
  }

  async sendRegistrationOtp(email: string) {
    return this.emailOtp.sendRegistrationOtp(email);
  }

  async refresh(refreshToken: string, meta?: { userAgent?: string; ip?: string }) {
    const rotated = await this.tokens.rotateRefreshToken(refreshToken, meta);
    if (!rotated) throw new UnauthorizedException("Invalid or expired refresh token");
    return this.issueTokens(rotated.user, meta, rotated.refreshToken);
  }

  async logout(refreshToken: string | undefined, res: Response) {
    if (refreshToken) await this.tokens.revokeRefreshToken(refreshToken);
    this.tokens.clearAuthCookies(res);
    return { success: true };
  }

  async getMe(userId: string) {
    if (!userId) throw new UnauthorizedException();
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: this.userInclude(),
    });
    if (!user) throw new UnauthorizedException();
    return { user: this.mapUser(user) };
  }

  applyCookies(res: Response, result: AuthResult) {
    this.tokens.setAuthCookies(res, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      csrfToken: result.csrfToken,
      role: result.user.role,
    });
  }

  toPublicResponse(result: AuthResult) {
    return {
      accessToken: result.accessToken,
      csrfToken: result.csrfToken,
      user: result.user,
    };
  }

  private async findUserWithRelations(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: this.userInclude(),
    });
  }

  private userInclude() {
    return {
      role: { include: { rolePermissions: { include: { permission: true } } } },
      supplier: { include: { status: true } },
      deliveryBoy: true,
    } as const;
  }

  private async issueTokens(
    user: AuthUserRecord,
    meta?: { userAgent?: string; ip?: string },
    existingRefreshToken?: string,
  ): Promise<AuthResult> {
    const permissions = user.role.rolePermissions.map((rp) => rp.permission.code);
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role.code,
      permissions,
    };

    const accessToken = this.tokens.signAccessToken(payload);
    const refreshToken = existingRefreshToken ?? this.tokens.generateRefreshToken();
    const csrfToken = this.tokens.generateCsrfToken();

    if (!existingRefreshToken) {
      await this.tokens.createRefreshToken(user.id, refreshToken, meta);
    }

    return {
      accessToken,
      refreshToken,
      csrfToken,
      user: this.mapUser(user, permissions),
    };
  }

  private mapUser(user: AuthUserRecord, permissions?: string[]) {
    const perms = permissions ?? user.role.rolePermissions.map((rp) => rp.permission.code);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role.code,
      roleLabel: user.role.label,
      permissions: perms,
      supplier: user.supplier
        ? {
            id: user.supplier.id,
            businessName: user.supplier.businessName,
            status: user.supplier.status.code,
            statusLabel: user.supplier.status.label,
          }
        : null,
      deliveryBoyId: user.deliveryBoy?.id ?? null,
    };
  }
}
