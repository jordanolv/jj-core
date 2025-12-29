import { Hono } from "hono";
import { z } from "zod";
import { betterAuthMiddleware, AuthUser } from "../../middleware/better-auth.js";
import { alexaAuthMiddleware } from "../../middleware/alexa-auth.js";
import { listsCollections } from "./db.js";
import { ObjectId } from "mongodb";

const router = new Hono<{ Variables: { user: AuthUser; profileId: string } }>();

// ==========================================
// Routes Alexa (sans auth utilisateur)
// ==========================================
const alexaRoutes = new Hono();

// Middleware Alexa pour vérifier le secret
alexaRoutes.use("*", alexaAuthMiddleware);

// Schema pour créer un item
const createItemSchema = z.object({
  text: z.string().min(1),
});

// Route Alexa : POST /api/lists/alexa/:id/items
alexaRoutes.post("/:id/items", async (c) => {
  const listId = c.req.param("id");
  const body = await c.req.json();
  const data = createItemSchema.parse(body);

  const { lists, items } = await listsCollections();

  // Vérifier que la liste existe (sans vérifier le profileId)
  const list = await lists.findOne({
    _id: new ObjectId(listId),
  });

  if (!list) {
    return c.json({ error: "Liste non trouvée" }, 404);
  }

  const now = new Date();

  const result = await items.insertOne({
    listId: new ObjectId(listId),
    profileId: list.profileId, // Utiliser le profileId de la liste
    text: data.text,
    completed: false,
    createdAt: now,
    updatedAt: now,
  });

  return c.json({
    success: true,
    id: result.insertedId.toString(),
    text: data.text,
    completed: false,
  });
});

// Monter les routes Alexa sur /alexa
router.route("/alexa", alexaRoutes);

// ==========================================
// Routes normales avec auth utilisateur
// ==========================================
router.use("*", betterAuthMiddleware);

router.use("*", async (c, next) => {
  const profileId = c.req.header("X-Profile-Id");
  if (!profileId) {
    return c.json({ error: "Profile ID requis" }, 400);
  }
  c.set("profileId", profileId);
  await next();
});

// Get all lists
router.get("/", async (c) => {
  const profileId = c.get("profileId");
  const { lists } = await listsCollections();

  const allLists = await lists.find({ profileId }).toArray();

  return c.json({
    lists: allLists.map((list) => ({
      id: list._id?.toString(),
      name: list.name,
      isShared: list.isShared,
      createdAt: list.createdAt,
      updatedAt: list.updatedAt,
    })),
  });
});

// Create a new list
const createListSchema = z.object({
  name: z.string().min(1),
  isShared: z.boolean().default(false),
});

router.post("/", async (c) => {
  const profileId = c.get("profileId");
  const body = await c.req.json();
  const data = createListSchema.parse(body);

  const { lists } = await listsCollections();
  const now = new Date();

  const result = await lists.insertOne({
    profileId,
    name: data.name,
    isShared: data.isShared,
    createdAt: now,
    updatedAt: now,
  });

  return c.json({
    id: result.insertedId.toString(),
    name: data.name,
    isShared: data.isShared,
    createdAt: now,
    updatedAt: now,
  });
});

// Get a specific list with its items
router.get("/:id", async (c) => {
  const profileId = c.get("profileId");
  const listId = c.req.param("id");

  const { lists, items } = await listsCollections();

  const list = await lists.findOne({
    _id: new ObjectId(listId),
    profileId,
  });

  if (!list) {
    return c.json({ error: "Liste non trouvée" }, 404);
  }

  const listItems = await items.find({ listId: new ObjectId(listId) }).toArray();

  return c.json({
    list: {
      id: list._id?.toString(),
      name: list.name,
      isShared: list.isShared,
      createdAt: list.createdAt,
      updatedAt: list.updatedAt,
    },
    items: listItems.map((item) => ({
      id: item._id?.toString(),
      text: item.text,
      completed: item.completed,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    })),
  });
});

// Update a list
const updateListSchema = z.object({
  name: z.string().min(1).optional(),
  isShared: z.boolean().optional(),
});

router.patch("/:id", async (c) => {
  const profileId = c.get("profileId");
  const listId = c.req.param("id");
  const body = await c.req.json();
  const data = updateListSchema.parse(body);

  const { lists } = await listsCollections();

  const result = await lists.findOneAndUpdate(
    { _id: new ObjectId(listId), profileId },
    { $set: { ...data, updatedAt: new Date() } },
    { returnDocument: "after" }
  );

  if (!result) {
    return c.json({ error: "Liste non trouvée" }, 404);
  }

  return c.json({
    id: result._id?.toString(),
    name: result.name,
    isShared: result.isShared,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
  });
});

// Delete a list
router.delete("/:id", async (c) => {
  const profileId = c.get("profileId");
  const listId = c.req.param("id");

  const { lists, items } = await listsCollections();

  // Delete all items in the list
  await items.deleteMany({ listId: new ObjectId(listId) });

  // Delete the list
  const result = await lists.deleteOne({
    _id: new ObjectId(listId),
    profileId,
  });

  if (result.deletedCount === 0) {
    return c.json({ error: "Liste non trouvée" }, 404);
  }

  return c.json({ success: true });
});

// Add an item to a list (route normale avec auth)
router.post("/:id/items", async (c) => {
  const profileId = c.get("profileId");
  const listId = c.req.param("id");
  const body = await c.req.json();
  const data = createItemSchema.parse(body);

  const { lists, items } = await listsCollections();

  // Verify list exists and belongs to user
  const list = await lists.findOne({
    _id: new ObjectId(listId),
    profileId,
  });

  if (!list) {
    return c.json({ error: "Liste non trouvée" }, 404);
  }

  const now = new Date();

  const result = await items.insertOne({
    listId: new ObjectId(listId),
    profileId,
    text: data.text,
    completed: false,
    createdAt: now,
    updatedAt: now,
  });

  return c.json({
    id: result.insertedId.toString(),
    text: data.text,
    completed: false,
    createdAt: now,
    updatedAt: now,
  });
});

// Update an item
const updateItemSchema = z.object({
  text: z.string().min(1).optional(),
  completed: z.boolean().optional(),
});

router.patch("/:listId/items/:itemId", async (c) => {
  const profileId = c.get("profileId");
  const itemId = c.req.param("itemId");
  const body = await c.req.json();
  const data = updateItemSchema.parse(body);

  const { items } = await listsCollections();

  const result = await items.findOneAndUpdate(
    { _id: new ObjectId(itemId), profileId },
    { $set: { ...data, updatedAt: new Date() } },
    { returnDocument: "after" }
  );

  if (!result) {
    return c.json({ error: "Item non trouvé" }, 404);
  }

  return c.json({
    id: result._id?.toString(),
    text: result.text,
    completed: result.completed,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
  });
});

// Delete an item
router.delete("/:listId/items/:itemId", async (c) => {
  const profileId = c.get("profileId");
  const itemId = c.req.param("itemId");

  const { items } = await listsCollections();

  const result = await items.deleteOne({
    _id: new ObjectId(itemId),
    profileId,
  });

  if (result.deletedCount === 0) {
    return c.json({ error: "Item non trouvé" }, 404);
  }

  return c.json({ success: true });
});

export default router;
