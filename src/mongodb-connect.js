import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME || "novel_db";

if (!URI) {
  console.error("Missing MONGO_URI environment variable");
  process.exit(1);
}

const client = new MongoClient(URI);

async function connectDB() {
  try {
    await client.connect();
    console.log("Connection Successful");

    const db = client.db(DB_NAME);
    const novelCol = db.collection("NOVEL");
    const reviewCol = db.collection("REVIEW");

    console.log("Collections ready: NOVEL, REVIEW");

    return { novelCol, reviewCol };
  } catch (err) {
    console.error("Failed to connect:", err);
    process.exit(1);
  }
}

export default connectDB;