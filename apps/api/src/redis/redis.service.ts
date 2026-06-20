import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private connected = false;

  constructor() {
    const url = process.env.REDIS_URL;
    if (!url) {
      this.logger.warn("REDIS_URL not set — live tracking will use database only");
      return;
    }

    this.client = new Redis(url, {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
      connectTimeout: 3000,
    });

    this.client
      .connect()
      .then(() => {
        this.connected = true;
        this.logger.log("Redis connected");
      })
      .catch((err) => {
        this.logger.warn(`Redis unavailable (${err.message}) — falling back to database`);
        this.client?.disconnect();
        this.client = null;
      });
  }

  isAvailable() {
    return this.connected && this.client !== null;
  }

  async get(key: string): Promise<string | null> {
    if (!this.client) return null;
    try {
      return await this.client.get(key);
    } catch {
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (!this.client) return;
    try {
      if (ttlSeconds) await this.client.set(key, value, "EX", ttlSeconds);
      else await this.client.set(key, value);
    } catch {
      /* ignore */
    }
  }

  async lpush(key: string, value: string): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.lpush(key, value);
    } catch {
      /* ignore */
    }
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    if (!this.client) return [];
    try {
      return await this.client.lrange(key, start, stop);
    } catch {
      return [];
    }
  }

  async ltrim(key: string, start: number, stop: number): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.ltrim(key, start, stop);
    } catch {
      /* ignore */
    }
  }

  async del(key: string): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.del(key);
    } catch {
      /* ignore */
    }
  }

  onModuleDestroy() {
    this.client?.disconnect();
  }
}
