import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME || "novel_db";

if (!URI) {
  throw new Error("Missing MONGO_URI environment variable");
}

// 复用连接（Vercel Serverless 环境下避免每次请求重新建立连接）
let client = new MongoClient(URI);
let clientPromise = client.connect();

async function connectDB() {
  try {
    await clientPromise;
    console.log("Connection Successful");

    const db = client.db(DB_NAME);
    const novelCol = db.collection("NOVEL");
    const reviewCol = db.collection("REVIEW");

    console.log("Collections ready: NOVEL, REVIEW");

    return { novelCol, reviewCol };
  } catch (err) {
    console.error("Failed to connect:", err);
    throw err;
  }
}

export default connectDB;