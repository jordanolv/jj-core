import { ObjectId } from "mongodb";
import { getDatabase } from "../../shared/db/mongo.js";

export interface GlobalCategoryDocument {
  _id?: ObjectId;
  profileId: string;
  name: string;
  type: "expense";
  color?: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseDocument {
  _id?: ObjectId;
  profileId: string;
  categoryId?: ObjectId;
  description: string;
  amount: number;
  year: number;
  month: number;
  date: Date;
  subscriptionId?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IncomeDocument {
  _id?: ObjectId;
  profileId: string;
  categoryId?: ObjectId;
  description: string;
  amount: number;
  year: number;
  month: number;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionDocument {
  _id?: ObjectId;
  profileId: string;
  categoryId?: ObjectId;
  name: string;
  amount: number;
  frequency: "monthly" | "yearly";
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function budgetCollections() {
  const db = await getDatabase();

  return {
    globalCategories: db.collection<GlobalCategoryDocument>("budget_global_categories"),
    expenses: db.collection<ExpenseDocument>("budget_expenses"),
    incomes: db.collection<IncomeDocument>("budget_incomes"),
    subscriptions: db.collection<SubscriptionDocument>("budget_subscriptions"),
  };
}

