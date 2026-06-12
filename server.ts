import { env } from "./src/config/env";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./src/config/swagger";
import authRoutes from "./src/routes/auth.routes";
import userRoutes from "./src/routes/user.routes";
import applicationRoutes from "./src/routes/application.routes";

const app = express();
const { PORT } = env;

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
