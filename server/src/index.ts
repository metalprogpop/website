import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { authRouter } from "./routes/auth.js";

const app = express();
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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
