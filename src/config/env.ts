import "dotenv/config";

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  PORT: Number(process.env.PORT),
  NODE_ENV:
    (process.env.NODE_ENV as "development" | "production" | "test") ||
    "development",
  CLIENT_URL: requireEnv("CLIENT_URL"),

  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((url) => url.trim())
    : [requireEnv("CLIENT_URL")],

  DATABASE_URL: requireEnv("DATABASE_URL"),

  ADMIN_USERNAME: requireEnv("ADMIN_USERNAME"),
  ADMIN_NAME: requireEnv("ADMIN_NAME"),
  ADMIN_EMAIL: requireEnv("ADMIN_EMAIL"),
  ADMIN_PASSWORD: requireEnv("ADMIN_PASSWORD"),

  JWT_SECRET: requireEnv("JWT_SECRET"),
  JWT_REFRESH_SECRET: requireEnv("JWT_REFRESH_SECRET"),
  ACCESS_TOKEN_EXPIRY: requireEnv("ACCESS_TOKEN_EXPIRY"),
  REFRESH_TOKEN_EXPIRY: requireEnv("REFRESH_TOKEN_EXPIRY"),

  COOKIE_ACCESS_MAX_AGE: requireEnv("COOKIE_ACCESS_MAX_AGE"),
  COOKIE_REFRESH_MAX_AGE: requireEnv("COOKIE_REFRESH_MAX_AGE"),

  SMTP_HOST: requireEnv("SMTP_HOST"),
  SMTP_PORT: Number(requireEnv("SMTP_PORT")),
  SMTP_USER: requireEnv("SMTP_USER"),
  SMTP_PASS: requireEnv("SMTP_PASS"),

  GOOGLE_CLIENT_ID: requireEnv("GOOGLE_CLIENT_ID"),

  EMAIL_VERIFICATION_EXPIRY: requireEnv("EMAIL_VERIFICATION_EXPIRY"),
  PASSWORD_RESET_EXPIRY: requireEnv("PASSWORD_RESET_EXPIRY"),

  IMAGEKIT_PRIVATE_KEY: requireEnv("IMAGEKIT_PRIVATE_KEY"),
  MAX_FILE_SIZE: Number(process.env.MAX_FILE_SIZE),
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,

  REDIS_URL: requireEnv("REDIS_URL"),
  RABBITMQ_URL: requireEnv("RABBITMQ_URL"),

  get isProduction() {
    return this.NODE_ENV === "production";
  },
  get isDevelopment() {
    return this.NODE_ENV === "development";
  },
} as const;
