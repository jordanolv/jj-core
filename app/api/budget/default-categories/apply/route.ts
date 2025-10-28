import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// POST - Appliquer les catégories par défaut à tous les mois existants
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { profileId } = body

    if (!profileId) {
      return NextResponse.json({ error: "profileId is required" }, { status: 400 })
    }

    // Récupérer les catégories par défaut du profil
    const defaultCategories = await prisma.defaultBudgetCategory.findMany({
      where: { profileId },
    })

    if (defaultCategories.length === 0) {
      return NextResponse.json({ added: 0, message: "Aucune catégorie par défaut définie" })
    }

    // Récupérer tous les mois du profil
    const budgetYears = await prisma.budgetYear.findMany({
      where: { profileId },
      include: {
        months: {
          include: {
            categories: true,
          },
        },
      },
    })

    let categoriesAdded = 0

    // Pour chaque mois, ajouter les catégories manquantes
    for (const year of budgetYears) {
      for (const month of year.months) {
        const existingCategoryNames = month.categories.map((c) => c.name)

        // Trouver les catégories qui n'existent pas encore pour ce mois
        const categoriesToAdd = defaultCategories.filter(
          (defCat) => !existingCategoryNames.includes(defCat.name)
        )

        // Ajouter les catégories manquantes
        if (categoriesToAdd.length > 0) {
          await prisma.budgetCategory.createMany({
            data: categoriesToAdd.map((cat) => ({
              name: cat.name,
              color: cat.color,
              icon: cat.icon,
              monthId: month.id,
            })),
          })
          categoriesAdded += categoriesToAdd.length
        }
      }
    }

    return NextResponse.json({
      success: true,
      added: categoriesAdded,
      message: `${categoriesAdded} catégorie(s) ajoutée(s)`,
    })
  } catch (error) {
    console.error("Error applying categories:", error)
    return NextResponse.json({ error: "Failed to apply categories" }, { status: 500 })
  }
}
