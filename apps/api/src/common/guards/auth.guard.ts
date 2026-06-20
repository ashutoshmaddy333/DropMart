import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import {
  IS_PUBLIC_KEY,
  PERMISSIONS_KEY,
  ROLES_KEY,
  SKIP_CSRF_KEY,
  JwtPayload,
  RequestUser,
} from "../decorators/auth.decorators";
import { ACCESS_COOKIE, CSRF_COOKIE } from "../../modules/auth/auth-tokens.service";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();

    if (!isPublic) {
      const token = this.extractAccessToken(request);
      if (!token) throw new UnauthorizedException("Authentication required");

      try {
        const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
        request.user = {
          id: payload.sub,
          email: payload.email,
          role: payload.role,
          permissions: payload.permissions,
        } satisfies RequestUser;
      } catch {
        throw new UnauthorizedException("Invalid or expired token");
      }

      this.validateCsrf(context, request);

      const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
      if (requiredRoles?.length && !requiredRoles.includes(request.user.role)) {
        throw new ForbiddenException("Insufficient role");
      }

      const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
      if (requiredPermissions?.length) {
        const hasAll = requiredPermissions.every((p) =>
          request.user.permissions.includes(p),
        );
        if (!hasAll) throw new ForbiddenException("Insufficient permissions");
      }
    }

    return true;
  }

  private validateCsrf(context: ExecutionContext, request: { method: string; headers: Record<string, string | string[] | undefined>; cookies?: Record<string, string> }) {
    if (!MUTATING_METHODS.has(request.method)) return;

    const skipCsrf = this.reflector.getAllAndOverride<boolean>(SKIP_CSRF_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skipCsrf) return;

    const cookieToken = request.cookies?.[CSRF_COOKIE];
    const headerToken =
      (request.headers["x-csrf-token"] as string | undefined) ??
      (request.headers["x-xsrf-token"] as string | undefined);

    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
      throw new ForbiddenException("Invalid CSRF token");
    }
  }

  private extractAccessToken(request: {
    headers: Record<string, string | string[] | undefined>;
    cookies?: Record<string, string>;
  }): string | null {
    const cookieToken = request.cookies?.[ACCESS_COOKIE];
    if (cookieToken) return cookieToken;

    const auth = request.headers.authorization as string | undefined;
    if (!auth) return null;
    const [type, token] = auth.split(" ");
    return type === "Bearer" ? token : null;
  }
}
