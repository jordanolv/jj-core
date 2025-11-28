import { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { auth } from "../features/auth/better-auth.js";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export const betterAuthMiddleware: MiddlewareHandler = async (c, next) => {
  let session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session?.user) {
    const authHeader = c.req.header("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      try {
        session = await auth.api.getSession({
          headers: new Headers({
            cookie: `better-auth.session_token=${token}`,
          }),
        });
      } catch (error) {
        console.error("Token validation error:", error);
      }
    }
  }

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
