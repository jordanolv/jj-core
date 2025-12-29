import { ObjectId } from "mongodb";
import { getDatabase } from "../../shared/db/mongo.js";

export interface ListDocument {
  _id?: ObjectId;
  profileId: string;
  name: string;
  isShared: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListItemDocument {
  _id?: ObjectId;
  listId: ObjectId;
  profileId: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function listsCollections() {
  const db = await getDatabase();

  return {
    lists: db.collection<ListDocument>("lists"),
    items: db.collection<ListItemDocument>("list_items"),
  };
}
