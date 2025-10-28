import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// Catégories par défaut de base
const DEFAULT_CATEGORIES = [
  { name: "Alimentation", color: "#10b981", icon: "🍔" },
  { name: "Santé", color: "#ef4444", icon: "💊" },
  { name: "Loisir", color: "#a855f7", icon: "🎮" },
  { name: "Achats", color: "#f59e0b", icon: "🛍️" },
  { name: "Factures/Loyer", color: "#3b82f6", icon: "🏠" },
]

// Route pour initialiser les profils Jordan & Juliette
export async function POST() {
  try {
    // Créer ou récupérer Jordan
    const jordan = await prisma.profile.upsert({
      where: { name: "jordan" },
      update: {},
      create: { name: "jordan" },
    })

    // Créer ou récupérer Juliette
    const juliette = await prisma.profile.upsert({
      where: { name: "juliette" },
      update: {},
      create: { name: "juliette" },
    })

    // Initialiser les catégories par défaut pour chaque profil
    for (const profile of [jordan, juliette]) {
      // Vérifier si le profil a déjà des catégories par défaut
      const existingCategories = await prisma.defaultBudgetCategory.findMany({
        where: { profileId: profile.id },
      })

      // Si aucune catégorie par défaut, créer les catégories de base
      if (existingCategories.length === 0) {
        await prisma.defaultBudgetCategory.createMany({
          data: DEFAULT_CATEGORIES.map((cat) => ({
            ...cat,
            profileId: profile.id,
          })),
        })
      }
    }

    return NextResponse.json({
      success: true,
      profiles: [jordan, juliette],
    })
  } catch (error) {
    console.error("Error initializing profiles:", error)
    return NextResponse.json(
      { error: "Failed to initialize profiles" },
      { status: 500 }
    )
  }
}
