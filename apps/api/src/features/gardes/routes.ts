import { Hono } from "hono";
import { z } from "zod";
import { betterAuthMiddleware, AuthUser } from "../../middleware/better-auth.js";
import { gardesCollection } from "./db.js";
import { ObjectId } from "mongodb";

const router = new Hono<{ Variables: { user: AuthUser; profileId: string } }>();

router.use("*", betterAuthMiddleware);

router.use("*", async (c, next) => {
  const profileId = c.req.header("X-Profile-Id");
  if (!profileId) {
    return c.json({ error: "Profile ID requis" }, 400);
  }
  c.set("profileId", profileId);
  await next();
});

// GET - Récupérer les gardes selon les filtres
router.get("/", async (c) => {
  const profileId = c.get("profileId");
  const showShared = c.req.query("shared") === "true";

  const gardes = await gardesCollection();

  let filter: any = {};

  if (showShared) {
    // Afficher les gardes du profil ET les gardes partagées
    filter = {
      $or: [
        { profileId, isShared: false },
        { isShared: true }
      ]
    };
  } else {
    // Afficher seulement les gardes du profil
    filter = { profileId, isShared: false };
  }

  const gardesList = await gardes.find(filter).sort({ dateDebut: -1 }).toArray();

  return c.json(
    gardesList.map((g) => ({
      id: g._id,
      typeAnimal: g.typeAnimal,
      nomAnimal: g.nomAnimal,
      nomClient: g.nomClient,
      contact: g.contact,
      source: g.source,
      dateDebut: g.dateDebut,
      dateFin: g.dateFin,
      duree: g.duree,
      tarif: g.tarif,
      typeGarde: g.typeGarde,
      statut: g.statut,
      notes: g.notes,
      photos: g.photos,
      isShared: g.isShared,
      profileId: g.profileId,
    }))
  );
});

// GET - Récupérer une garde par ID
router.get("/:id", async (c) => {
  const id = c.req.param("id");
  const gardes = await gardesCollection();

  const garde = await gardes.findOne({ _id: new ObjectId(id) });

  if (!garde) {
    return c.json({ error: "Garde non trouvée" }, 404);
  }

  return c.json({
    id: garde._id,
    typeAnimal: garde.typeAnimal,
    nomAnimal: garde.nomAnimal,
    nomClient: garde.nomClient,
    contact: garde.contact,
    source: garde.source,
    dateDebut: garde.dateDebut,
    dateFin: garde.dateFin,
    duree: garde.duree,
    tarif: garde.tarif,
    typeGarde: garde.typeGarde,
    statut: garde.statut,
    notes: garde.notes,
    photos: garde.photos,
    isShared: garde.isShared,
    profileId: garde.profileId,
  });
});

// POST - Créer une nouvelle garde
const createGardeSchema = z.object({
  typeAnimal: z.string().min(1),
  nomAnimal: z.string().min(1),
  nomClient: z.string().min(1),
  contact: z.string().optional(),
  source: z.string().optional(),
  dateDebut: z.string().datetime(),
  dateFin: z.string().datetime(),
  duree: z.string().optional(),
  tarif: z.number().positive(),
  typeGarde: z.string().min(1),
  statut: z.enum(["confirmé", "en_cours", "terminé", "annulé"]).default("confirmé"),
  notes: z.string().optional(),
  photos: z.array(z.string()).default([]),
  isShared: z.boolean().default(false),
});

router.post("/", async (c) => {
  const profileId = c.get("profileId");
  const body = await c.req.json();
  const parsed = createGardeSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const gardes = await gardesCollection();

  const result = await gardes.insertOne({
    profileId,
    typeAnimal: parsed.data.typeAnimal,
    nomAnimal: parsed.data.nomAnimal,
    nomClient: parsed.data.nomClient,
    contact: parsed.data.contact,
    source: parsed.data.source,
    dateDebut: new Date(parsed.data.dateDebut),
    dateFin: new Date(parsed.data.dateFin),
    duree: parsed.data.duree,
    tarif: parsed.data.tarif,
    typeGarde: parsed.data.typeGarde,
    statut: parsed.data.statut,
    notes: parsed.data.notes,
    photos: parsed.data.photos,
    isShared: parsed.data.isShared,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return c.json({ id: result.insertedId }, 201);
});

// PATCH - Mettre à jour une garde
const updateGardeSchema = z.object({
  typeAnimal: z.string().min(1).optional(),
  nomAnimal: z.string().min(1).optional(),
  nomClient: z.string().min(1).optional(),
  contact: z.string().optional(),
  source: z.string().optional(),
  dateDebut: z.string().datetime().optional(),
  dateFin: z.string().datetime().optional(),
  duree: z.string().optional(),
  tarif: z.number().positive().optional(),
  typeGarde: z.string().min(1).optional(),
  statut: z.enum(["confirmé", "en_cours", "terminé", "annulé"]).optional(),
  notes: z.string().optional(),
  photos: z.array(z.string()).optional(),
  isShared: z.boolean().optional(),
});

router.patch("/:id", async (c) => {
  const profileId = c.get("profileId");
  const id = c.req.param("id");
  const body = await c.req.json();
  const parsed = updateGardeSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const gardes = await gardesCollection();

  const updateData: any = { ...parsed.data, updatedAt: new Date() };

  if (parsed.data.dateDebut) {
    updateData.dateDebut = new Date(parsed.data.dateDebut);
  }
  if (parsed.data.dateFin) {
    updateData.dateFin = new Date(parsed.data.dateFin);
  }

  const result = await gardes.updateOne({ _id: new ObjectId(id) }, { $set: updateData });

  if (result.matchedCount === 0) {
    return c.json({ error: "Garde non trouvée" }, 404);
  }

  return c.json({ success: true });
});

// DELETE - Supprimer une garde
router.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const gardes = await gardesCollection();

  const result = await gardes.deleteOne({ _id: new ObjectId(id) });

  if (result.deletedCount === 0) {
    return c.json({ error: "Garde non trouvée" }, 404);
  }

  return c.json({ success: true });
});

export const gardesRouter = router;
