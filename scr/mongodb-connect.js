import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME || "Novels";

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
    const tagCol = db.collection("TAG");

    console.log("Collections ready: NOVEL, TAG");

    return { novelCol, tagCol };
  } catch (err) {
    console.error("Failed to connect:", err);
    process.exit(1);
  }
}

export default connectDB;