import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./modules/mongodb-connect.js";
import novelRouter from "./routes/novelRouter.js";
import reviewRouter from "./routes/reviewRouter.js";

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 根路径重定向到 homepage（必须在 static 之前，否则会被 index.html 拦截）
app.get("/", (req, res) => {
  res.redirect("/homepage.html");
});

// 托管 frontend 静态文件
app.use(express.static(path.join(__dirname, "../frontend")));

// 健康检查
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/novels", novelRouter);
app.use("/api", reviewRouter);

// 启动服务器
const { novelCol, reviewCol } = await connectDB();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export { novelCol, reviewCol };