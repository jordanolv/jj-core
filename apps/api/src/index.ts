import { config as loadEnv } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: resolve(process.cwd(), ".env") });
loadEnv({ path: resolve(currentDir, "../../../.env"), override: false });
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { useApitally } from "apitally/hono";
import { auth } from "./features/auth/better-auth.js";
import { profilesRouter } from "./features/profiles/routes.js";
import { budgetRouter } from "./features/budget/routes.js";
import { notificationRouter } from "./features/notifications/routes.js";
import { notificationRegistry } from "./features/notifications/registry.js";
import { notificationScheduler } from "./features/notifications/scheduler.js";

const app = new Hono();

await notificationRegistry.scan();
notificationScheduler.start();

if (process.env.APITALLY_CLIENT_ID) {
  useApitally(app, {
    clientId: process.env.APITALLY_CLIENT_ID,
    env: process.env.NODE_ENV || "dev",
    requestLogging: {
      enabled: true,
      logRequestHeaders: false,
      logRequestBody: false,
      logResponseBody: false,
      captureLogs: true,
    },
  });
}

app.use(
  "*",
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-Profile-Id", "User-Agent"],
    credentials: true,
  })
);
app.get("/", (c) => c.json({ status: "ok" }));

app.on(["POST", "GET"], "/api/auth/**", async (c) => {
  return await auth.handler(c.req.raw);
});

app.route("/profiles", profilesRouter);
app.route("/budget", budgetRouter);
app.route("/notifications", notificationRouter);

const port = Number(process.env.PORT) || 4491;

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`API server is running on http://localhost:${info.port}`);
  }
);
