import { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { auth } from "../features/auth/better-auth.js";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export const betterAuthMiddleware: MiddlewareHandler = async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session?.user) {
    throw new HTTPException(401, { message: "Non autorisé" });
  }

  c.set("user", {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  });

  await next();
};
