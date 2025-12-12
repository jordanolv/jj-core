/**
 * Script de migration des données de l'ancienne base PostgreSQL vers MongoDB
 *
 * Usage: npm run migrate:old
 */

import { PrismaClient } from '../../../old/node_modules/@prisma/client/index.js';
import { getDatabase } from '../src/shared/db/mongo.js';
import { config as loadEnv } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Charger les variables d'environnement depuis la racine du projet
const currentDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(currentDir, '../../..');
loadEnv({ path: resolve(rootDir, ".env") });

console.log('📁 Chargement du .env depuis:', resolve(rootDir, ".env"));
console.log('🔗 MongoDB URI:', process.env.MONGODB_URI ? 'Configuré ✅' : 'Manquant ❌');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.OLD_DATABASE_URL || "prisma+postgres://localhost:51213/?api_key=eyJkYXRhYmFzZVVybCI6InBvc3RncmVzOi8vcG9zdGdyZXM6cG9zdGdyZXNAbG9jYWxob3N0OjUxMjE0L3RlbXBsYXRlMT9zc2xtb2RlPWRpc2FibGUmY29ubmVjdGlvbl9saW1pdD0xJmNvbm5lY3RfdGltZW91dD0wJm1heF9pZGxlX2Nvbm5lY3Rpb25fbGlmZXRpbWU9MCZwb29sX3RpbWVvdXQ9MCZzaW5nbGVfdXNlX2Nvbm5lY3Rpb25zPXRydWUmc29ja2V0X3RpbWVvdXQ9MCIsIm5hbWUiOiJkZWZhdWx0Iiwic2hhZG93RGF0YWJhc2VVcmwiOiJwb3N0Z3JlczovL3Bvc3RncmVzOnBvc3RncmVzQGxvY2FsaG9zdDo1MTIxNS90ZW1wbGF0ZTE_c3NsbW9kZT1kaXNhYmxlJmNvbm5lY3Rpb25fbGltaXQ9MSZjb25uZWN0X3RpbWVvdXQ9MCZtYXhfaWRsZV9jb25uZWN0aW9uX2xpZmV0aW1lPTAmcG9vbF90aW1lb3V0PTAmc2luZ2xlX3VzZV9jb25uZWN0aW9ucz10cnVlJnNvY2tldF90aW1lb3V0PTAifQ"
    }
  }
});

async function migrateProfiles() {
  console.log('🔄 Migration des profils...');

  const db = await getDatabase();
  const profilesCollection = db.collection('profiles');

  try {
    const profiles = await prisma.profile.findMany();

    if (profiles.length === 0) {
      console.log('⚠️  Aucun profil trouvé dans l\'ancienne base');
      return;
    }

    for (const profile of profiles) {
      const existing = await profilesCollection.findOne({ oldId: profile.id });

      if (existing) {
        console.log(`⏭️  Profil "${profile.name}" déjà migré`);
        continue;
      }

      await profilesCollection.insertOne({
        _id: profile.name as any, // Utiliser le nom comme ID (jordan ou juliette)
        oldId: profile.id,
        name: profile.name,
        avatar: profile.avatar,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      });

      console.log(`✅ Profil "${profile.name}" migré`);
    }
  } catch (error) {
    console.error('❌ Erreur lors de la migration des profils:', error);
    throw error;
  }
}

async function migrateGardes() {
  console.log('🔄 Migration des gardes d\'animaux...');

  const db = await getDatabase();
  const gardesCollection = db.collection('gardes');
  const profilesCollection = db.collection('profiles');

  try {
    const gardes = await prisma.gardeAnimaux.findMany({
      include: {
        profile: true
      }
    });

    if (gardes.length === 0) {
      console.log('⚠️  Aucune garde trouvée dans l\'ancienne base');
      return;
    }

    let migrated = 0;
    let skipped = 0;

    for (const garde of gardes) {
      // Vérifier si déjà migrée
      const existing = await gardesCollection.findOne({ oldId: garde.id });

      if (existing) {
        skipped++;
        continue;
      }

      // Récupérer le nouveau profil ID (nom du profil)
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
        dateDebut: garde.dateDebut,
        dateFin: garde.dateFin,
        duree: garde.duree,
        tarif: garde.tarif,
        typeGarde: garde.typeGarde,
        statut: garde.statut,
        notes: garde.notes,
        photos: garde.photos,
        isShared: garde.isShared,
        profileId: String(profile._id), // Nom du profil (jordan ou juliette)
        createdAt: garde.createdAt,
        updatedAt: garde.updatedAt,
      });

      migrated++;
    }

    console.log(`✅ ${migrated} gardes migrées, ${skipped} ignorées (déjà présentes)`);
  } catch (error) {
    console.error('❌ Erreur lors de la migration des gardes:', error);
    throw error;
  }
}

async function migrateBudget() {
  console.log('🔄 Migration du budget...');

  const db = await getDatabase();
  const expensesCollection = db.collection('budget_expenses');
  const incomesCollection = db.collection('budget_incomes');
  const categoriesCollection = db.collection('budget_month_categories');
  const globalCategoriesCollection = db.collection('budget_global_categories');
  const profilesCollection = db.collection('profiles');

  try {
    // 1. Migrer les catégories globales par défaut
    console.log('  📁 Migration des catégories par défaut...');
    const defaultCategories = await prisma.defaultBudgetCategory.findMany();

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
        type: "expense", // Par défaut
        createdAt: cat.createdAt,
        updatedAt: cat.updatedAt,
      });
    }

    console.log(`  ✅ ${defaultCategories.length} catégories par défaut migrées`);

    // 2. Migrer les dépenses
    console.log('  💸 Migration des dépenses...');
    const expenses = await prisma.budgetExpense.findMany({
      include: {
        month: {
          include: {
            year: true
          }
        },
        category: true
      }
    });

    let expensesMigrated = 0;
    for (const expense of expenses) {
      const existing = await expensesCollection.findOne({ oldId: expense.id });
      if (existing) continue;

      const profile = await profilesCollection.findOne({ oldId: expense.profileId });
      if (!profile) continue;

      // Trouver ou créer la catégorie du mois
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
            createdAt: expense.category.createdAt,
            updatedAt: expense.category.updatedAt,
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
        date: expense.date,
        createdAt: expense.createdAt,
        updatedAt: expense.updatedAt,
      });

      expensesMigrated++;
    }

    console.log(`  ✅ ${expensesMigrated} dépenses migrées`);

    // 3. Migrer les revenus
    console.log('  💰 Migration des revenus...');
    const incomes = await prisma.budgetIncome.findMany({
      include: {
        month: {
          include: {
            year: true
          }
        }
      }
    });

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
        date: income.date,
        createdAt: income.createdAt,
        updatedAt: income.updatedAt,
      });

      incomesMigrated++;
    }

    console.log(`  ✅ ${incomesMigrated} revenus migrés`);

  } catch (error) {
    console.error('❌ Erreur lors de la migration du budget:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Démarrage de la migration...\n');

  try {
    // 1. Migrer les profils en premier (dépendances)
    await migrateProfiles();
    console.log('');

    // 2. Migrer les gardes d'animaux
    await migrateGardes();
    console.log('');

    // 3. Migrer le budget
    await migrateBudget();
    console.log('');

    console.log('🎉 Migration terminée avec succès !');
  } catch (error) {
    console.error('💥 Erreur fatale lors de la migration:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
