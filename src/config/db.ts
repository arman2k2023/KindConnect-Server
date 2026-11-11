
import { MongoClient, type Db } from "mongodb";

let client: MongoClient | null = null;

export function getMongoClient(): MongoClient {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is missing from environment variables");
  }

  if (!client) {
    client = new MongoClient(uri);
  }

  return client;
}

export async function connectDB(): Promise<Db> {
  const mongoClient = getMongoClient();

  await mongoClient.connect();

  const database = mongoClient.db(
    process.env.DB_NAME || "kindconnect"
  );

  console.log("MongoDB connected successfully!");

  return database;
}
