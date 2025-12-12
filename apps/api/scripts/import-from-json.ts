/**
 * Script pour importer les données depuis les fichiers JSON vers MongoDB
 *
 * Usage: npm run migrate:import --workspace apps/api
 */

import { getDatabase } from '../src/shared/db/mongo.js';
import { config as loadEnv } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync, existsSync } from 'fs';

// Charger les variables d'environnement depuis la racine du projet
const currentDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(currentDir, '../../..');
loadEnv({ path: resolve(rootDir, ".env") });

console.log('📁 Chargement du .env depuis:', resolve(rootDir, ".env"));
console.log('🔗 MongoDB URI:', process.env.MONGODB_URI ? 'Configuré ✅' : 'Manquant ❌');

const dataDir = resolve(currentDir, 'data');

function loadJSON(filename: string) {
  const filepath = resolve(dataDir, filename);
  if (!existsSync(filepath)) {
    console.log(`⚠️  Fichier ${filename} introuvable`);
    return [];
  }
  return JSON.parse(readFileSync(filepath, 'utf-8'));
}

async function importProfiles() {
  console.log('🔄 Import des profils...');

  const db = await getDatabase();
  const profilesCollection = db.collection('profiles');

  try {
    const profiles = loadJSON('profiles.json');

    if (profiles.length === 0) {
      console.log('⚠️  Aucun profil à importer');
      return;
    }

    for (const profile of profiles) {
      const existing = await profilesCollection.findOne({ oldId: profile.id });

      if (existing) {
        console.log(`⏭️  Profil "${profile.name}" déjà migré`);
        continue;
      }

      await profilesCollection.insertOne({
        _id: profile.name as any,
        oldId: profile.id,
        name: profile.name,
        avatar: profile.avatar,
        createdAt: new Date(profile.createdAt),
        updatedAt: new Date(profile.updatedAt),
      });

      console.log(`✅ Profil "${profile.name}" importé`);
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'import des profils:', error);
    throw error;
  }
}

async function importGardes() {
  console.log('🔄 Import des gardes d\'animaux...');

  const db = await getDatabase();
  const gardesCollection = db.collection('gardes');
  const profilesCollection = db.collection('profiles');

  try {
    const gardes = loadJSON('gardes.json');

    if (gardes.length === 0) {
      console.log('⚠️  Aucune garde à importer');
      return;
    }

    let migrated = 0;
    let skipped = 0;

    for (const garde of gardes) {
      const existing = await gardesCollection.findOne({ oldId: garde.id });

      if (existing) {
        skipped++;
        continue;
      }

      const profile = await profilesCollection.findOne({ oldId: garde.profileId });

      if (!profile) {
        console.log(`⚠️  Profil introuvable pour la garde "${garde.nomAnimal}"`);
        continue;
      }

      await gardesCollection.insertOne({
        oldId: garde.id,
        typeAnimal: garde.typeAnimal,
        nomAnimal: garde.nomAnimal,
        nomClient: garde.nomClient,
        contact: garde.contact,
        source: garde.source,
        dateDebut: new Date(garde.dateDebut),
        dateFin: new Date(garde.dateFin),
        duree: garde.duree,
        tarif: garde.tarif,
        typeGarde: garde.typeGarde,
        statut: garde.statut,
        notes: garde.notes,
        photos: garde.photos,
        isShared: garde.isShared,
        profileId: String(profile._id),
        createdAt: new Date(garde.createdAt),
        updatedAt: new Date(garde.updatedAt),
      });

      migrated++;
    }

    console.log(`✅ ${migrated} gardes importées, ${skipped} ignorées`);
  } catch (error) {
    console.error('❌ Erreur lors de l\'import des gardes:', error);
    throw error;
  }
}

async function importBudget() {
  console.log('🔄 Import du budget...');

  const db = await getDatabase();
  const expensesCollection = db.collection('budget_expenses');
  const incomesCollection = db.collection('budget_incomes');
  const categoriesCollection = db.collection('budget_month_categories');
  const globalCategoriesCollection = db.collection('budget_global_categories');
  const profilesCollection = db.collection('profiles');

  try {
    // 1. Catégories par défaut
    console.log('  📁 Import des catégories par défaut...');
    const defaultCategories = loadJSON('default-categories.json');

    for (const cat of defaultCategories) {
      const existing = await globalCategoriesCollection.findOne({ oldId: cat.id });
      if (existing) continue;

      const profile = await profilesCollection.findOne({ oldId: cat.profileId });
      if (!profile) continue;

      await globalCategoriesCollection.insertOne({
        oldId: cat.id,
        profileId: String(profile._id),
        name: cat.name,
        color: cat.color,
        icon: cat.icon,
        type: "expense",
        createdAt: new Date(cat.createdAt),
        updatedAt: new Date(cat.updatedAt),
      });
    }

    console.log(`  ✅ ${defaultCategories.length} catégories importées`);

    // 2. Dépenses
    console.log('  💸 Import des dépenses...');
    const expenses = loadJSON('expenses.json');

    let expensesMigrated = 0;
    for (const expense of expenses) {
      const existing = await expensesCollection.findOne({ oldId: expense.id });
      if (existing) continue;

      const profile = await profilesCollection.findOne({ oldId: expense.profileId });
      if (!profile) continue;

      let categoryId = null;
      if (expense.category) {
        const existingCat = await categoriesCollection.findOne({
          oldId: expense.category.id
        });

        if (existingCat) {
          categoryId = existingCat._id;
        } else {
          const result = await categoriesCollection.insertOne({
            oldId: expense.category.id,
            profileId: String(profile._id),
            year: expense.month.year.year,
            month: expense.month.month,
            name: expense.category.name,
            type: "expense",
            color: expense.category.color,
            icon: expense.category.icon,
            createdAt: new Date(expense.category.createdAt),
            updatedAt: new Date(expense.category.updatedAt),
          });
          categoryId = result.insertedId;
        }
      }

      await expensesCollection.insertOne({
        oldId: expense.id,
        profileId: String(profile._id),
        categoryId,
        description: expense.description,
        amount: expense.amount,
        year: expense.month.year.year,
        month: expense.month.month,
        date: new Date(expense.date),
        createdAt: new Date(expense.createdAt),
        updatedAt: new Date(expense.updatedAt),
      });

      expensesMigrated++;
    }

    console.log(`  ✅ ${expensesMigrated} dépenses importées`);

    // 3. Revenus
    console.log('  💰 Import des revenus...');
    const incomes = loadJSON('incomes.json');

    let incomesMigrated = 0;
    for (const income of incomes) {
      const existing = await incomesCollection.findOne({ oldId: income.id });
      if (existing) continue;

      const profile = await profilesCollection.findOne({ oldId: income.profileId });
      if (!profile) continue;

      await incomesCollection.insertOne({
        oldId: income.id,
        profileId: String(profile._id),
        description: income.description,
        amount: income.amount,
        year: income.month.year.year,
        month: income.month.month,
        date: new Date(income.date),
        createdAt: new Date(income.createdAt),
        updatedAt: new Date(income.updatedAt),
      });

      incomesMigrated++;
    }

    console.log(`  ✅ ${incomesMigrated} revenus importés`);

  } catch (error) {
    console.error('❌ Erreur lors de l\'import du budget:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Démarrage de l\'import...\n');

  try {
    await importProfiles();
    console.log('');

    await importGardes();
    console.log('');

    await importBudget();
    console.log('');

    console.log('🎉 Import terminé avec succès !');
  } catch (error) {
    console.error('💥 Erreur fatale lors de l\'import:', error);
    process.exit(1);
  }
}

main();
