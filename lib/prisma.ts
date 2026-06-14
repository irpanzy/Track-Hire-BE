import { env } from "../src/config/env";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { Pool } from "pg";

const connectionString = env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  connectionTimeoutMillis: 60000,
  idleTimeoutMillis: 30000,
  max: 20,
  statement_timeout: 60000,

  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL pool error:", err);
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  adapter,
  log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

pool
  .query("SELECT 1")
  .then(() => console.log("✅ Database connection test successful"))
  .catch((err) =>
    console.error("❌ Database connection test failed:", err.message)
  );

export { prisma };
