import { Body, Controller, Get, Post, Req, Res, UnauthorizedException, UseGuards } from "@nestjs/common";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { LoginDto, RegisterCustomerDto, RegisterSupplierDto, SendRegistrationOtpDto } from "./dto/auth.dto";
import { Public } from "../../common/decorators/auth.decorators";
import { AuthGuard } from "../../common/guards/auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { RequestUser } from "../../common/decorators/auth.decorators";
import { REFRESH_COOKIE } from "./auth-tokens.service";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post("login")
  async login(@Body() dto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto, this.requestMeta(req));
    this.authService.applyCookies(res, result);
    return this.authService.toPublicResponse(result);
  }

  @Public()
  @Post("otp/send")
  sendRegistrationOtp(@Body() dto: SendRegistrationOtpDto) {
    return this.authService.sendRegistrationOtp(dto.email);
  }

  @Public()
  @Post("register/customer")
  async registerCustomer(
    @Body() dto: RegisterCustomerDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.registerCustomer(dto, this.requestMeta(req));
    this.authService.applyCookies(res, result);
    return this.authService.toPublicResponse(result);
  }

  @Public()
  @Post("register/supplier")
  async registerSupplier(
    @Body() dto: RegisterSupplierDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.registerSupplier(dto, this.requestMeta(req));
    this.authService.applyCookies(res, result);
    return this.authService.toPublicResponse(result);
  }

  @Public()
  @Post("refresh")
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.[REFRESH_COOKIE];
    if (!refreshToken) throw new UnauthorizedException("No refresh token");
    const result = await this.authService.refresh(refreshToken, this.requestMeta(req));
    this.authService.applyCookies(res, result);
    return this.authService.toPublicResponse(result);
  }

  @Public()
  @Post("logout")
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.logout(req.cookies?.[REFRESH_COOKIE], res);
  }

  @Public()
  @Get("csrf")
  csrf(@Req() req: Request) {
    return { csrfToken: req.cookies?.dropmart_csrf ?? null };
  }

  @UseGuards(AuthGuard)
  @Get("me")
  getMe(@CurrentUser() user: RequestUser) {
    return this.authService.getMe(user.id);
  }

  private requestMeta(req: Request) {
    return {
      userAgent: req.headers["user-agent"],
      ip: req.ip,
    };
  }
}
