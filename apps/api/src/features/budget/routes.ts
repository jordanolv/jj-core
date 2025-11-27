import { Hono } from "hono";
import { z } from "zod";
import { betterAuthMiddleware, AuthUser } from "../../middleware/better-auth.js";
import { budgetCollections } from "./db.js";
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

router.get("/years", async (c) => {
  const profileId = c.get("profileId");
  const { expenses, incomes } = await budgetCollections();

  const expenseYears = await expenses.distinct("year", { profileId });
  const incomeYears = await incomes.distinct("year", { profileId });
  const allYears = [...new Set([...expenseYears, ...incomeYears])].sort((a, b) => b - a);

  return c.json({ years: allYears });
});

router.get("/years/:year/months", async (c) => {
  const profileId = c.get("profileId");
  const year = parseInt(c.req.param("year"));
  const { expenses, incomes } = await budgetCollections();

  const expenseMonths = await expenses.distinct("month", { profileId, year });
  const incomeMonths = await incomes.distinct("month", { profileId, year });
  const allMonths = [...new Set([...expenseMonths, ...incomeMonths])].sort((a, b) => a - b);

  return c.json({ months: allMonths });
});

router.get("/years/:year/months/:month", async (c) => {
  const profileId = c.get("profileId");
  const year = parseInt(c.req.param("year"));
  const month = parseInt(c.req.param("month"));
  const { expenses, incomes, monthCategories, globalCategories } = await budgetCollections();

  let categoriesList = await monthCategories.find({ profileId, year, month }).toArray();

  if (categoriesList.length === 0) {
    const globals = await globalCategories.find({ profileId }).toArray();
    const now = new Date();

    for (const global of globals) {
      await monthCategories.insertOne({
        profileId,
        year,
        month,
        globalCategoryId: global._id,
        name: global.name,
        type: global.type,
        color: global.color,
        icon: global.icon,
        createdAt: now,
        updatedAt: now,
      });
    }

    categoriesList = await monthCategories.find({ profileId, year, month }).toArray();
  }

  const [expensesList, incomesList] = await Promise.all([
    expenses.find({ profileId, year, month }).toArray(),
    incomes.find({ profileId, year, month }).toArray(),
  ]);

  return c.json({
    expenses: expensesList.map((e) => ({
      id: e._id,
      categoryId: e.categoryId,
      description: e.description,
      amount: e.amount,
      date: e.date,
      subscriptionId: e.subscriptionId,
    })),
    incomes: incomesList.map((i) => ({
      id: i._id,
      categoryId: i.categoryId,
      description: i.description,
      amount: i.amount,
      date: i.date,
    })),
    categories: categoriesList.map((c) => ({
      id: c._id,
      name: c.name,
      type: c.type,
      color: c.color,
      icon: c.icon,
    })),
  });
});

const createExpenseSchema = z.object({
  categoryId: z.string().optional(),
  description: z.string().min(1),
  amount: z.number().positive(),
  date: z.string().datetime(),
});

router.post("/expenses", async (c) => {
  const profileId = c.get("profileId");
  const body = await c.req.json();
  const parsed = createExpenseSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const date = new Date(parsed.data.date);
  const { expenses } = await budgetCollections();

  const result = await expenses.insertOne({
    profileId,
    categoryId: parsed.data.categoryId ? new ObjectId(parsed.data.categoryId) : undefined,
    description: parsed.data.description,
    amount: parsed.data.amount,
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    date,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return c.json({ id: result.insertedId }, 201);
});

const createIncomeSchema = z.object({
  categoryId: z.string().optional(),
  description: z.string().min(1),
  amount: z.number().positive(),
  date: z.string().datetime(),
});

router.post("/incomes", async (c) => {
  const profileId = c.get("profileId");
  const body = await c.req.json();
  const parsed = createIncomeSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const date = new Date(parsed.data.date);
  const { incomes } = await budgetCollections();

  const result = await incomes.insertOne({
    profileId,
    categoryId: parsed.data.categoryId ? new ObjectId(parsed.data.categoryId) : undefined,
    description: parsed.data.description,
    amount: parsed.data.amount,
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    date,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return c.json({ id: result.insertedId }, 201);
});

const createCategorySchema = z.object({
  name: z.string().min(1),
  type: z.enum(["income", "expense"]),
  year: z.number(),
  month: z.number(),
  color: z.string().optional(),
  icon: z.string().optional(),
});

router.post("/categories", async (c) => {
  const profileId = c.get("profileId");
  const body = await c.req.json();
  const parsed = createCategorySchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const { monthCategories } = await budgetCollections();

  const result = await monthCategories.insertOne({
    profileId,
    year: parsed.data.year,
    month: parsed.data.month,
    name: parsed.data.name,
    type: parsed.data.type,
    color: parsed.data.color,
    icon: parsed.data.icon,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return c.json({ id: result.insertedId }, 201);
});

router.get("/global-categories", async (c) => {
  const profileId = c.get("profileId");
  const { globalCategories } = await budgetCollections();

  const cats = await globalCategories.find({ profileId }).toArray();

  return c.json({
    categories: cats.map((c) => ({
      id: c._id,
      name: c.name,
      type: c.type,
      color: c.color,
      icon: c.icon,
    })),
  });
});

const createGlobalCategorySchema = z.object({
  name: z.string().min(1),
  type: z.enum(["income", "expense"]),
  color: z.string().optional(),
  icon: z.string().optional(),
});

router.post("/global-categories", async (c) => {
  const profileId = c.get("profileId");
  const body = await c.req.json();
  const parsed = createGlobalCategorySchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const { globalCategories } = await budgetCollections();

  const result = await globalCategories.insertOne({
    profileId,
    ...parsed.data,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return c.json({ id: result.insertedId }, 201);
});

router.get("/subscriptions", async (c) => {
  const profileId = c.get("profileId");
  const { subscriptions, globalCategories } = await budgetCollections();

  const subs = await subscriptions.find({ profileId, isActive: true }).toArray();
  const cats = await globalCategories.find({ profileId }).toArray();

  return c.json({
    subscriptions: subs.map((s) => ({
      id: s._id,
      categoryId: s.categoryId,
      name: s.name,
      amount: s.amount,
      frequency: s.frequency,
      startDate: s.startDate,
      category: cats.find((c) => c._id?.toString() === s.categoryId?.toString()),
    })),
  });
});

const createSubscriptionSchema = z.object({
  categoryId: z.string().optional(),
  name: z.string().min(1),
  amount: z.number().positive(),
  frequency: z.enum(["monthly", "yearly"]),
  startDate: z.string().datetime(),
});

router.post("/subscriptions", async (c) => {
  const profileId = c.get("profileId");
  const body = await c.req.json();
  const parsed = createSubscriptionSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const { subscriptions } = await budgetCollections();
  const startDate = new Date(parsed.data.startDate);

  const result = await subscriptions.insertOne({
    profileId,
    categoryId: parsed.data.categoryId ? new ObjectId(parsed.data.categoryId) : undefined,
    name: parsed.data.name,
    amount: parsed.data.amount,
    frequency: parsed.data.frequency,
    startDate,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return c.json({ id: result.insertedId }, 201);
});

router.delete("/subscriptions/:id", async (c) => {
  const profileId = c.get("profileId");
  const id = c.req.param("id");
  const { subscriptions } = await budgetCollections();

  await subscriptions.updateOne(
    { _id: new ObjectId(id), profileId },
    { $set: { isActive: false, updatedAt: new Date() } }
  );

  return c.json({ success: true });
});

const convertToSubscriptionSchema = z.object({
  expenseId: z.string(),
  name: z.string().min(1),
  frequency: z.enum(["monthly", "yearly"]),
});

router.post("/subscriptions/from-expense", async (c) => {
  const profileId = c.get("profileId");
  const body = await c.req.json();
  const parsed = convertToSubscriptionSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const { expenses, subscriptions } = await budgetCollections();
  const expense = await expenses.findOne({
    _id: new ObjectId(parsed.data.expenseId),
    profileId,
  });

  if (!expense) {
    return c.json({ error: "Dépense non trouvée" }, 404);
  }

  const subscription = await subscriptions.insertOne({
    profileId,
    categoryId: expense.categoryId,
    name: parsed.data.name,
    amount: expense.amount,
    frequency: parsed.data.frequency,
    startDate: expense.date,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await expenses.updateOne(
    { _id: expense._id },
    { $set: { subscriptionId: subscription.insertedId, updatedAt: new Date() } }
  );

  return c.json({ id: subscription.insertedId }, 201);
});

router.post("/subscriptions/generate", async (c) => {
  const { subscriptions, expenses } = await budgetCollections();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const activeSubs = await subscriptions.find({ isActive: true }).toArray();
  const generated = [];

  for (const sub of activeSubs) {
    const startDate = new Date(sub.startDate);

    if (startDate > now) continue;

    const shouldGenerate =
      (sub.frequency === "monthly") ||
      (sub.frequency === "yearly" && startDate.getMonth() + 1 === currentMonth);

    if (!shouldGenerate) continue;

    const existingExpense = await expenses.findOne({
      profileId: sub.profileId,
      subscriptionId: sub._id,
      year: currentYear,
      month: currentMonth,
    });

    if (existingExpense) continue;

    const result = await expenses.insertOne({
      profileId: sub.profileId,
      categoryId: sub.categoryId,
      description: `${sub.name} (abonnement)`,
      amount: sub.amount,
      year: currentYear,
      month: currentMonth,
      date: new Date(currentYear, currentMonth - 1, startDate.getDate()),
      subscriptionId: sub._id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    generated.push({ subscriptionId: sub._id, expenseId: result.insertedId });
  }

  return c.json({ generated: generated.length, expenses: generated });
});

export const budgetRouter = router;
