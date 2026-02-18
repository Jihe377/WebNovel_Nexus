import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const URI = process.env.MONGO_URI || "mongodb+srv://zxing1998_db_user:ew6n4X0SyP86gWF9@cluster0.wjv35ga.mongodb.net/?appName=Cluster0";
const DB_NAME = "Novels";

const client = new MongoClient(URI);

async function connectDB() {
  try {
    await client.connect();
    console.log("Connection Successful");

    const db = client.db(DB_NAME);
    const novelCol = db.collection("NOVEL");
    const tagCol = db.collection("TAG");

    console.log("NOVEL");
    console.log("TAG");

    return { novelCol, tagCol };
  } catch (err) {
    console.error("Fail to connect：", err);
    process.exit(1);
  }
}

connectDB();