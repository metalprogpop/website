import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { authRouter } from "./routes/auth.js";
import { adminRouter } from "./routes/admin.js";
import { episodesRouter } from "./routes/episodes.js";
import { fanClubRouter } from "./routes/fanClub.js";
import { startHourlySync } from "./episodes/catalog.js";
import { serveClient } from "./web/serveClient.js";

const app = express();
app.disable("x-powered-by");
const port = process.env.PORT ?? 3001;

app.use(
  cors({
    origin: process.env.CLIENT_URL ?? "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.get("/api/v1/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/episodes", episodesRouter);
app.use("/api/v1/fan-clu", fanClubRouter);

// Production: serve the built client from the same origin (see Dockerfile).
const clientDistDir = process.env.CLIENT_DIST_DIR;
if (clientDistDir) {
  app.use(
    serveClient(
      clientDistDir,
      process.env.CLIENT_URL ?? `http://localhost:${String(port)}`,
    ),
  );
}

startHourlySync();

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
