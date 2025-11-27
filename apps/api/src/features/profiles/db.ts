import { getDatabase } from "../../shared/db/mongo.js";

export interface UserDocument {
  _id?: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfileDocument {
  _id?: string;
  userId: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function usersCollection() {
  const db = await getDatabase();
  return db.collection<UserDocument>("users");
}

export async function profilesCollection() {
  const db = await getDatabase();
  return db.collection<ProfileDocument>("profiles");
}

