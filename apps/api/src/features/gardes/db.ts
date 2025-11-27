import { ObjectId } from "mongodb";
import { getDatabase } from "../../shared/db/mongo";

export interface GardeDocument {
  _id?: ObjectId;
  typeAnimal: string;
  nomAnimal: string;
  nomClient: string;
  contact?: string;
  source?: string;
  dateDebut: Date;
  dateFin: Date;
  duree?: string;
  tarif: number;
  typeGarde: string;
  statut: string;
  notes?: string;
  photos: string[];
  isShared: boolean;
  profileId: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function gardesCollection() {
  const db = await getDatabase();
  return db.collection<GardeDocument>("gardes");
}

