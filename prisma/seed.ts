import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Début du seeding...')

  // Créer l'utilisateur avec mot de passe hashé
  const hashedPassword = await bcrypt.hash('jjplatform', 10)
  const user = await prisma.user.upsert({
    where: { email: 'jj@platform.com' },
    update: { password: hashedPassword },
    create: {
      email: 'jj@platform.com',
      password: hashedPassword,
    },
  })

  console.log('✅ Utilisateur créé:', user.email)

  // Créer ou récupérer les profils
  const jordan = await prisma.profile.upsert({
    where: { name: 'jordan' },
    update: {},
    create: { name: 'jordan' },
  })

  const juliette = await prisma.profile.upsert({
    where: { name: 'juliette' },
    update: {},
    create: { name: 'juliette' },
  })

  console.log('✅ Profils créés:', { jordan, juliette })

  // Données de test pour les gardes (profil Juliette)
  const gardesTest = [
    {
      typeAnimal: "Chien",
      nomAnimal: "Max",
      nomClient: "Marie Dupont",
      contact: "06.12.34.56.78",
      dateDebut: new Date("2025-10-10"),
      dateFin: new Date("2025-10-12"),
      duree: "2 jours",
      tarif: 80,
      typeGarde: "Garde chez moi",
      statut: "terminé",
      notes: "Chien très gentil, aime les promenades",
      profileId: juliette.id,
    },
    {
      typeAnimal: "Chat",
      nomAnimal: "Minou",
      nomClient: "Pierre Martin",
      contact: "07.23.45.67.89",
      dateDebut: new Date("2025-10-15"),
      dateFin: new Date("2025-10-17"),
      duree: "3 jours",
      tarif: 60,
      typeGarde: "Visite à domicile",
      statut: "en_cours",
      notes: "2 visites par jour",
      profileId: juliette.id,
    },
    {
      typeAnimal: "Chien",
      nomAnimal: "Rocky",
      nomClient: "Sophie Bernard",
      contact: "06.34.56.78.90",
      dateDebut: new Date("2025-10-20"),
      dateFin: new Date("2025-10-25"),
      duree: "5 jours",
      tarif: 200,
      typeGarde: "Garde chez moi",
      statut: "confirmé",
      notes: "Besoin de 3 promenades par jour",
      profileId: juliette.id,
    },
    {
      typeAnimal: "Chat",
      nomAnimal: "Félix",
      nomClient: "Laurent Petit",
      contact: "07.45.67.89.01",
      dateDebut: new Date("2025-10-28"),
      dateFin: new Date("2025-10-30"),
      duree: "2 jours",
      tarif: 50,
      typeGarde: "Visite à domicile",
      statut: "confirmé",
      notes: "1 visite par jour suffit",
      profileId: juliette.id,
    },
    {
      typeAnimal: "Chien",
      nomAnimal: "Bella",
      nomClient: "Isabelle Moreau",
      contact: "06.56.78.90.12",
      dateDebut: new Date("2025-11-05"),
      dateFin: new Date("2025-11-08"),
      duree: "3 jours",
      tarif: 120,
      typeGarde: "Garde chez moi",
      statut: "confirmé",
      notes: "Adore jouer",
      profileId: juliette.id,
    },
    {
      typeAnimal: "Chat",
      nomAnimal: "Whiskers",
      nomClient: "Thomas Lefebvre",
      contact: "07.67.89.01.23",
      dateDebut: new Date("2025-11-10"),
      dateFin: new Date("2025-11-12"),
      duree: "2 jours",
      tarif: 40,
      typeGarde: "Visite à domicile",
      statut: "confirmé",
      profileId: juliette.id,
    },
    {
      typeAnimal: "Chien",
      nomAnimal: "Lucky",
      nomClient: "Nathalie Dubois",
      contact: "06.78.90.12.34",
      dateDebut: new Date("2025-09-15"),
      dateFin: new Date("2025-09-18"),
      duree: "3 jours",
      tarif: 90,
      typeGarde: "Garde chez moi",
      statut: "terminé",
      notes: "Très calme",
      profileId: juliette.id,
    },
    {
      typeAnimal: "Chat",
      nomAnimal: "Garfield",
      nomClient: "Antoine Roux",
      contact: "07.89.01.23.45",
      dateDebut: new Date("2025-09-25"),
      dateFin: new Date("2025-09-27"),
      duree: "2 jours",
      tarif: 45,
      typeGarde: "Visite à domicile",
      statut: "annulé",
      notes: "Client a annulé",
      profileId: juliette.id,
    },
  ]

  // Supprimer les anciennes gardes de test
  await prisma.gardeAnimaux.deleteMany({
    where: { profileId: juliette.id },
  })

  // Créer les nouvelles gardes
  for (const garde of gardesTest) {
    await prisma.gardeAnimaux.create({ data: garde })
  }

  console.log(`✅ ${gardesTest.length} gardes créées pour Juliette`)

  // Données de test pour les recettes (profil Jordan)
  const recettesTest = [
    {
      titre: "Pâtes Carbonara",
      description: "Recette traditionnelle italienne",
      ingredients: JSON.stringify(["Pâtes", "Lardons", "Œufs", "Parmesan", "Poivre"]),
      etapes: JSON.stringify([
        "Cuire les pâtes",
        "Faire revenir les lardons",
        "Mélanger œufs et parmesan",
        "Mélanger le tout hors du feu"
      ]),
      tempsPrep: 10,
      tempsCuisson: 15,
      portions: 4,
      categorie: "Plat principal",
      favorite: true,
      profileId: jordan.id,
    },
    {
      titre: "Salade César",
      description: "Salade fraîche et gourmande",
      ingredients: JSON.stringify(["Salade romaine", "Poulet", "Croûtons", "Parmesan", "Sauce césar"]),
      etapes: JSON.stringify([
        "Laver et couper la salade",
        "Griller le poulet",
        "Préparer les croûtons",
        "Mélanger avec la sauce"
      ]),
      tempsPrep: 15,
      tempsCuisson: 10,
      portions: 2,
      categorie: "Entrée",
      favorite: false,
      profileId: jordan.id,
    },
  ]

  for (const recette of recettesTest) {
    await prisma.recette.create({ data: recette })
  }

  console.log(`✅ ${recettesTest.length} recettes créées pour Jordan`)

  // Données de test pour les abonnements (profil Jordan)
  const abonnementsTest = [
    {
      nom: "Netflix",
      prix: 13.49,
      frequence: "mensuel",
      dateDebut: new Date("2024-01-15"),
      actif: true,
      categorie: "streaming",
      description: "Abonnement standard",
      profileId: jordan.id,
    },
    {
      nom: "Spotify",
      prix: 9.99,
      frequence: "mensuel",
      dateDebut: new Date("2024-03-01"),
      actif: true,
      categorie: "streaming",
      profileId: jordan.id,
    },
    {
      nom: "Salle de sport",
      prix: 39.99,
      frequence: "mensuel",
      dateDebut: new Date("2024-09-01"),
      actif: true,
      categorie: "sport",
      profileId: jordan.id,
    },
  ]

  for (const abonnement of abonnementsTest) {
    await prisma.abonnement.create({ data: abonnement })
  }

  console.log(`✅ ${abonnementsTest.length} abonnements créés pour Jordan`)

  console.log('🎉 Seeding terminé avec succès !')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Erreur lors du seeding:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
