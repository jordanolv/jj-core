import { Hono } from "hono";
import { z } from "zod";
import type { AuthVariables } from "../../middleware/auth";
import { usersCollection } from "../profiles/db";
import { verifyPassword } from "../../shared/security/password";
import { signAuthToken } from "../../shared/security/jwt";
import { authMiddleware } from "../../middleware/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const authRouter = new Hono<{ Variables: AuthVariables }>();

authRouter.post("/login", async (c) => {
  const body = await c.req.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const { email, password } = parsed.data;
  const users = await usersCollection();
  const user = await users.findOne({ email });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const token = await signAuthToken({
    sub: user._id!,
    email: user.email,
  });

  return c.json({
    token,
    user: {
      id: user._id,
      email: user.email,
    },
  });
});

authRouter.use("/me", authMiddleware);
authRouter.get("/me", async (c) => {
  const user = c.get("user");
  return c.json({ user });
});

