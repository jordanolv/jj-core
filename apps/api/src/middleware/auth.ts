import { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { verifyAuthToken } from "../shared/security/jwt";

export type AuthVariables = {
  user: {
    id: string;
    email: string;
  };
};

export const authMiddleware: MiddlewareHandler<{
  Variables: AuthVariables;
}> = async (c, next) => {
  const authHeader = c.req.header("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new HTTPException(401, { message: "Missing authorization token" });
  }

  const token = authHeader.slice("Bearer ".length);

  try {
    const payload = await verifyAuthToken(token);
    const userId = payload.sub as string;
    if (!userId) {
      throw new Error("Invalid token payload");
    }

    c.set("user", {
      id: userId,
      email: payload.email as string,
    });
    await next();
  } catch (error) {
    throw new HTTPException(401, {
      message: "Invalid or expired token",
      cause: error,
    });
  }
};

