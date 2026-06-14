import { env } from "./src/config/env";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./src/config/swagger";
import authRoutes from "./src/routes/auth.routes";
import userRoutes from "./src/routes/user.routes";
import applicationRoutes from "./src/routes/application.routes";
import companyRoutes from "./src/routes/company.routes";
import reminderRoutes from "./src/routes/reminder.routes";
import dashboardRoutes from "./src/routes/dashboard.routes";
import { redisClient } from "./src/utils/redis";
import { rabbitmqClient } from "./src/utils/rabbitmq";
import { startEmailWorker } from "./src/workers/email.worker";

const app = express();
const { PORT } = env;

const allowedOrigins = env.CLIENT_URL.split(",").map((url) => url.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (env.NODE_ENV === "development") {
        const isLocalhost =
          origin.includes("localhost") || origin.includes("127.0.0.1");
        if (isLocalhost) return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
    maxAge: 86400,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Track Hire API Documentation",
  })
);

app.get("/", (req, res) => {
  res.send("Track Hire API is running!");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/dashboard", dashboardRoutes);

interface HttpError extends Error {
  status?: number;
}

app.use(
  (
    err: HttpError,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err);
    res.status(err.status || 500).json({
      message: err.message || "Internal server error",
    });
  }
);

async function startServer() {
  try {
    console.log("🔄 Connecting to Redis...");
    await redisClient.connect();

    console.log("🔄 Connecting to RabbitMQ...");
    await rabbitmqClient.connect();

    console.log("🔄 Starting background workers...");
    await startEmailWorker();

    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  console.log("\n⚠️  Shutting down gracefully...");
  await redisClient.disconnect();
  await rabbitmqClient.disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n⚠️  Shutting down gracefully...");
  await redisClient.disconnect();
  await rabbitmqClient.disconnect();
  process.exit(0);
});

startServer();
