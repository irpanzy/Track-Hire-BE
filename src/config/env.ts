import "dotenv/config";

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  PORT: Number(process.env.PORT) || 3000,
  NODE_ENV:
    (process.env.NODE_ENV as "development" | "production" | "test") ||
    "development",
  CLIENT_URL: requireEnv("CLIENT_URL"),

  DATABASE_URL: requireEnv("DATABASE_URL"),

  JWT_SECRET: requireEnv("JWT_SECRET"),
  JWT_REFRESH_SECRET: requireEnv("JWT_REFRESH_SECRET"),
  ACCESS_TOKEN_EXPIRY: requireEnv("ACCESS_TOKEN_EXPIRY"),
  REFRESH_TOKEN_EXPIRY: requireEnv("REFRESH_TOKEN_EXPIRY"),

  COOKIE_ACCESS_MAX_AGE: requireEnv("COOKIE_ACCESS_MAX_AGE"),
  COOKIE_REFRESH_MAX_AGE: requireEnv("COOKIE_REFRESH_MAX_AGE"),

  get isProduction() {
    return this.NODE_ENV === "production";
  },
  get isDevelopment() {
    return this.NODE_ENV === "development";
  },
} as const;
