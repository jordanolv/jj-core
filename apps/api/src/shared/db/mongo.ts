import { MongoClient, Db } from "mongodb";
import { mongoEnv } from "../env";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function getMongoClient() {
  if (cachedClient) {
    return cachedClient;
  }

  cachedClient = new MongoClient(mongoEnv.uri());
  await cachedClient.connect();
  return cachedClient;
}

export async function getDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  const client = await getMongoClient();
  cachedDb = client.db(mongoEnv.db());
  return cachedDb;
}

