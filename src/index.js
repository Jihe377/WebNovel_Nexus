import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./modules/mongodb-connect.js";
import novelRouter from "./routes/novelRouter.js";
import reviewRouter from "./routes/reviewRouter.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.redirect("/homepage.html");
});

app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

connectDB();

app.use("/api/novels", novelRouter);
app.use("/api", reviewRouter);

// Vercel 需要具名导出 handler
export const handler = (req, res) => app(req, res);

export default app;