/**
 * Script pour créer un compte utilisateur et lier les profils existants
 *
 * Usage: npm run create:account --workspace apps/api
 */

import { getDatabase } from '../src/shared/db/mongo.js';
import { config as loadEnv } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { hash } from "bcryptjs";

const currentDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(currentDir, '../../..');
loadEnv({ path: resolve(rootDir, ".env") });

console.log('📁 Chargement du .env depuis:', resolve(rootDir, ".env"));
console.log('🔗 MongoDB URI:', process.env.MONGODB_URI ? 'Configuré ✅' : 'Manquant ❌');

async function createAccount() {
  console.log('🚀 Création du compte utilisateur...\n');

  const db = await getDatabase();
  const usersCollection = db.collection('user');
  const profilesCollection = db.collection('profiles');

  try {
    // 1. Récupérer les profils existants
    const profiles = await profilesCollection.find({}).toArray();
    console.log(`📊 ${profiles.length} profils trouvés: ${profiles.map(p => p.name).join(', ')}\n`);

    // 2. Demander les informations du compte
    const email = 'contact@jj-core.app'; // Email par défaut
    const password = 'jordzpgm'; // Mot de passe par défaut
    const name = 'JJ Core'; // Nom du compte

    // 3. Vérifier si le compte existe déjà
    const existingUser = await usersCollection.findOne({ email });

    if (existingUser) {
      console.log(`⚠️  Le compte "${email}" existe déjà`);
      console.log(`🔗 Liaison des profils au compte existant...\n`);

      // Lier tous les profils à ce compte
      for (const profile of profiles) {
        await profilesCollection.updateOne(
          { _id: profile._id },
          { $set: { userId: String(existingUser._id) } }
        );
        console.log(`✅ Profil "${profile.name}" lié au compte`);
      }

      console.log(`\n✅ Tous les profils sont maintenant liés au compte "${email}"`);
      return;
    }

    // 4. Créer le mot de passe hashé
    const hashedPassword = await hash(password, 10);

    // 5. Créer le compte
    const result = await usersCollection.insertOne({
      name,
      email,
      emailVerified: false,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const userId = result.insertedId;

    // 6. Créer la session better-auth (account)
    await db.collection('account').insertOne({
      userId: String(userId),
      accountId: email,
      providerId: 'credential',
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log(`✅ Compte créé avec succès !`);
    console.log(`   📧 Email: ${email}`);
    console.log(`   🔑 Mot de passe: ${password}`);
    console.log(`   👤 Nom: ${name}\n`);

    // 7. Lier tous les profils à ce compte
    console.log('🔗 Liaison des profils au compte...\n');

    for (const profile of profiles) {
      await profilesCollection.updateOne(
        { _id: profile._id },
        { $set: { userId: String(userId) } }
      );
      console.log(`✅ Profil "${profile.name}" lié au compte`);
    }

    // 8. Résumé final
    console.log('\n━'.repeat(60));
    console.log('🎉 Configuration terminée avec succès !');
    console.log('━'.repeat(60));
    console.log('\n📝 Identifiants de connexion :');
    console.log(`   📧 Email: ${email}`);
    console.log(`   🔑 Mot de passe: ${password}`);
    console.log(`\n👥 Profils disponibles :`);
    for (const profile of profiles) {
      console.log(`   • ${profile.name}`);
    }
    console.log('\n⚠️  Pensez à changer le mot de passe après la première connexion !');

  } catch (error) {
    console.error('❌ Erreur lors de la création du compte:', error);
    throw error;
  }
}

createAccount()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  });