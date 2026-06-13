import { createClient, RedisClientType } from "redis";
import { env } from "../config/env";

class RedisClient {
  private client: RedisClientType | null = null;
  private isConnected = false;

  async connect() {
    try {
      this.client = createClient({
        url: env.REDIS_URL,
      });

      this.client.on("error", (err) => {
        console.error("Redis Client Error:", err);
        this.isConnected = false;
      });

      this.client.on("connect", () => {
        console.log("✅ Redis connected successfully");
        this.isConnected = true;
      });

      this.client.on("disconnect", () => {
        console.log("⚠️  Redis disconnected");
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      console.error("❌ Failed to connect to Redis:", error);
      this.client = null;
      this.isConnected = false;

      if (env.isProduction) {
        throw error;
      }

      console.warn("⚠️  Running without Redis in development mode");
    }
  }

  async disconnect() {
    if (this.client && this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
      console.log("Redis connection closed");
    }
  }

  private ensureConnection() {
    if (!this.client || !this.isConnected) {
      if (env.isProduction) {
        throw new Error("Redis is not connected in production mode");
      }
      return false;
    }
    return true;
  }

  async checkRateLimit(
    key: string,
    limit: number,
    ttlSeconds: number
  ): Promise<{ allowed: boolean; remaining: number }> {
    if (!this.ensureConnection()) {
      return { allowed: true, remaining: limit };
    }

    try {
      const now = Date.now();
      const windowStart = now - ttlSeconds * 1000;

      await this.client!.zRemRangeByScore(key, 0, windowStart);

      const currentCount = await this.client!.zCard(key);

      if (currentCount >= limit) {
        return { allowed: false, remaining: 0 };
      }

      await this.client!.zAdd(key, { score: now, value: `${now}` });

      await this.client!.expire(key, ttlSeconds);

      const remaining = limit - (currentCount + 1);
      return { allowed: true, remaining };
    } catch (error) {
      console.error("Redis rate limit check error:", error);

      if (env.isProduction) {
        return { allowed: false, remaining: 0 };
      }

      return { allowed: true, remaining: limit };
    }
  }

  async getCache<T>(key: string): Promise<T | null> {
    if (!this.ensureConnection()) {
      return null;
    }

    try {
      const value = await this.client!.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      console.error("Redis get cache error:", error);
      return null;
    }
  }

  async setCache(key: string, value: any, ttlSeconds?: number): Promise<void> {
    if (!this.ensureConnection()) {
      return;
    }

    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client!.setEx(key, ttlSeconds, serialized);
      } else {
        await this.client!.set(key, serialized);
      }
    } catch (error) {
      console.error("Redis set cache error:", error);
    }
  }

  async deleteCache(key: string): Promise<void> {
    if (!this.ensureConnection()) {
      return;
    }

    try {
      await this.client!.del(key);
    } catch (error) {
      console.error("Redis delete cache error:", error);
    }
  }

  async deleteCacheByPattern(pattern: string): Promise<void> {
    if (!this.ensureConnection()) {
      return;
    }

    try {
      const keys = await this.client!.keys(pattern);
      if (keys.length > 0) {
        await this.client!.del(keys);
      }
    } catch (error) {
      console.error("Redis delete cache by pattern error:", error);
    }
  }
}

export const redisClient = new RedisClient();

export const checkRateLimit = (
  key: string,
  limit: number,
  ttlSeconds: number
) => redisClient.checkRateLimit(key, limit, ttlSeconds);

export const getCache = <T>(key: string) => redisClient.getCache<T>(key);

export const setCache = (key: string, value: any, ttlSeconds?: number) =>
  redisClient.setCache(key, value, ttlSeconds);

export const deleteCache = (key: string) => redisClient.deleteCache(key);

export const deleteCacheByPattern = (pattern: string) =>
  redisClient.deleteCacheByPattern(pattern);
