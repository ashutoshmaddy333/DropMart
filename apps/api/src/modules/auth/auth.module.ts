import { Module, forwardRef } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { APP_GUARD } from "@nestjs/core";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { AuthTokensService } from "./auth-tokens.service";
import { EmailOtpService } from "./email-otp.service";
import { AuthGuard } from "../../common/guards/auth.guard";
import { NotificationsModule } from "../notifications/notifications.module";
import { RedisModule } from "../../redis/redis.module";

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET ?? process.env.JWT_ACCESS_SECRET ?? "dev-secret-change-me",
      signOptions: { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m" },
    }),
    forwardRef(() => NotificationsModule),
    RedisModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthTokensService,
    EmailOtpService,
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
  exports: [AuthService, AuthTokensService],
})
export class AuthModule {}
