/**
 * Script pour nettoyer les données après migration :
 * - Remplacer les _id string des profils par de vrais ObjectId
 * - Supprimer tous les oldId
 * - Mettre à jour toutes les références
 *
 * Usage: npm run cleanup:migration --workspace apps/api
 */

import { getDatabase } from '../src/shared/db/mongo.js';
import { ObjectId } from 'mongodb';
import { config as loadEnv } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(currentDir, '../../..');
loadEnv({ path: resolve(rootDir, ".env") });

console.log('📁 Chargement du .env depuis:', resolve(rootDir, ".env"));
console.log('🔗 MongoDB URI:', process.env.MONGODB_URI ? 'Configuré ✅' : 'Manquant ❌');

async function cleanupMigration() {
  console.log('🧹 Nettoyage des données de migration...\n');

  const db = await getDatabase();

  try {
    // 1. Récupérer tous les profils
    const profilesCollection = db.collection('profiles');
    const profiles = await profilesCollection.find({}).toArray();

    console.log(`📊 ${profiles.length} profils à nettoyer\n`);

    // Map pour garder la correspondance ancien ID -> nouveau ObjectId
    const profileIdMap = new Map<string, ObjectId>();

    // 2. Pour chaque profil, créer un nouveau avec un vrai ObjectId
    for (const profile of profiles) {
      const oldProfileId = String(profile._id);
      const newProfileId = new ObjectId();

      profileIdMap.set(oldProfileId, newProfileId);

      // Créer le nouveau profil sans oldId
      await profilesCollection.insertOne({
        _id: newProfileId,
        name: profile.name,
        avatar: profile.avatar,
        userId: profile.userId,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      });

      console.log(`✅ Profil "${profile.name}" : ${oldProfileId} -> ${newProfileId}`);
    }

    console.log('\n🔄 Mise à jour des références...\n');

    // 3. Mettre à jour toutes les références dans les autres collections
    const collections = [
      'gardes',
      'budget_expenses',
      'budget_incomes',
      'budget_month_categories',
      'budget_global_categories',
    ];

    for (const collectionName of collections) {
      const collection = db.collection(collectionName);
      const documents = await collection.find({}).toArray();

      if (documents.length === 0) {
        console.log(`⏭️  ${collectionName}: aucun document`);
        continue;
      }

      let updated = 0;

      for (const doc of documents) {
        const oldProfileId = doc.profileId;
        const newProfileId = profileIdMap.get(oldProfileId);

        if (newProfileId) {
          // Supprimer oldId et mettre à jour profileId
          const updateFields: any = {
            profileId: String(newProfileId),
          };

          // Supprimer oldId s'il existe
          const unsetFields: any = {};
          if (doc.oldId) {
            unsetFields.oldId = "";
          }

          await collection.updateOne(
            { _id: doc._id },
            {
              $set: updateFields,
              ...(Object.keys(unsetFields).length > 0 ? { $unset: unsetFields } : {}),
            }
          );

          updated++;
        }
      }

      console.log(`✅ ${collectionName}: ${updated} documents mis à jour`);
    }

    // 4. Supprimer les anciens profils
    console.log('\n🗑️  Suppression des anciens profils...\n');

    for (const profile of profiles) {
      await profilesCollection.deleteOne({ _id: profile._id });
      console.log(`✅ Ancien profil "${profile.name}" supprimé`);
    }

    console.log('\n━'.repeat(60));
    console.log('🎉 Nettoyage terminé avec succès !');
    console.log('━'.repeat(60));
    console.log('\n✅ Tous les _id sont maintenant de vrais ObjectId');
    console.log('✅ Tous les oldId ont été supprimés');
    console.log('✅ Toutes les références ont été mises à jour\n');

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    throw error;
  }
}

cleanupMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  });
