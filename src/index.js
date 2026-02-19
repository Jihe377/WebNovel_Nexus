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

// 连接数据库
let novelCol, reviewCol;
connectDB().then(({ novelCol: n, reviewCol: r }) => {
  novelCol = n;
  reviewCol = r;
});

app.use("/api/novels", novelRouter);
app.use("/api", reviewRouter);

// ✅ 关键修改：导出 handler 函数，而不是 app
export default (req, res) => {
  return app(req, res);
};
export { novelCol, reviewCol };