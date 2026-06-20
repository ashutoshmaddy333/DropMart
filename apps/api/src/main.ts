import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import * as cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });

  app.useBodyParser("json", { limit: "10mb" });
  app.useBodyParser("urlencoded", { extended: true, limit: "10mb" });

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(",") ?? "http://localhost:3000",
    credentials: true,
    exposedHeaders: ["Set-Cookie"],
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
