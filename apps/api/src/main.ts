import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import cookieParser from "cookie-parser";
import type { NextFunction, Request, Response } from "express";
import { AppModule } from "./app.module";

function parseAllowedOrigins(): string[] {
  return (process.env.CORS_ORIGIN ?? "http://localhost:3000")
    .split(",")
    .map((o) => o.trim().replace(/^['"]|['"]$/g, "").replace(/\/$/, ""))
    .filter(Boolean);
}

/** Allow listed origins plus Vercel preview URLs for the DropMart frontend project. */
function isOriginAllowed(origin: string, allowedOrigins: string[]): boolean {
  const normalized = origin.replace(/\/$/, "");
  if (allowedOrigins.includes(normalized)) return true;
  if (/^http:\/\/localhost(:\d+)?$/.test(normalized)) return true;
  // Production + preview: drop-mart-api-elxn.vercel.app, drop-mart-api-elxn-*.vercel.app
  if (/^https:\/\/drop-mart-api-elxn(-[\w-]+)*\.vercel\.app$/.test(normalized)) return true;
  return false;
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });
  const allowedOrigins = parseAllowedOrigins();

  app.useBodyParser("json", { limit: "10mb" });
  app.useBodyParser("urlencoded", { extended: true, limit: "10mb" });

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (isOriginAllowed(origin, allowedOrigins)) return callback(null, true);
      return callback(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token", "X-XSRF-Token"],
    exposedHeaders: ["Set-Cookie"],
    optionsSuccessStatus: 204,
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method !== "OPTIONS") return next();
    const requestOrigin = typeof req.headers.origin === "string"
      ? req.headers.origin.replace(/\/$/, "")
      : "";
    if (!requestOrigin || isOriginAllowed(requestOrigin, allowedOrigins)) {
      if (requestOrigin) res.header("Access-Control-Allow-Origin", requestOrigin);
      res.header("Vary", "Origin");
      res.header("Access-Control-Allow-Credentials", "true");
      res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type,Authorization,X-CSRF-Token,X-XSRF-Token");
      return res.status(204).send();
    }
    return res.status(403).send("CORS blocked");
  });

  app.use(cookieParser());

  app.setGlobalPrefix("api/v1");

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`🚀 DropMart API running on http://localhost:${port}/api/v1`);
}

bootstrap();
