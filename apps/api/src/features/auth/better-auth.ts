import { config as loadEnv } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: resolve(currentDir, "../../../../../.env") });
loadEnv({ path: resolve(process.cwd(), ".env"), override: false });

import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { getDatabase } from "../../shared/db/mongo.js";

const db = await getDatabase();

export const auth = betterAuth({
  database: mongodbAdapter(db),
  baseURL: process.env.BETTER_AUTH_URL || process.env.API_URL || "http://localhost:4491",
  emailAndPassword: {
    enabled: true,
  },
  secret: process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET!,
  trustedOrigins: [process.env.CORS_ORIGIN || "http://localhost:3000"],
});

export type Session = typeof auth.$Infer.Session;
