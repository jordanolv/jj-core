import { Hono } from "hono";
import { z } from "zod";
import { betterAuthMiddleware, AuthUser } from "../../middleware/better-auth.js";
import { profilesCollection } from "./db.js";

const router = new Hono<{ Variables: { user: AuthUser } }>();

router.use("*", betterAuthMiddleware);

router.get("/", async (c) => {
  const user = c.get("user");
  const profiles = await (await profilesCollection())
    .find({ userId: user.id })
    .toArray();

  return c.json({
    profiles: profiles.map((profile) => ({
      id: profile._id,
      name: profile.name,
      avatar: profile.avatar,
    })),
  });
});

const updateSchema = z.object({
  name: z.string().min(2),
  avatar: z.string().url().optional(),
});

router.post("/", async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const profiles = await profilesCollection();
  const now = new Date();
  const result = await profiles.insertOne({
    userId: user.id,
    ...parsed.data,
    createdAt: now,
    updatedAt: now,
  });

  return c.json(
    {
      profile: {
        id: result.insertedId.toString(),
        ...parsed.data,
      },
    },
    201
  );
});

export const profilesRouter = router;

