import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./src/mongodb-connect.js";
import novelRouter from "./src/routes/novelRouter.js";
import reviewRouter from "./src/routes/reviewRouter.js";

const app = express();
const PORT = process.env.PORT || 3000;

// 解决 ES Module 中 __dirname 不可用的问题
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 托管 frontend 静态文件
app.use(express.static(path.join(__dirname, "frontend")));

// 测试路由
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