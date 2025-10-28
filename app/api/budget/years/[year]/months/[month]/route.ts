import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import defaultCategories from "@/data/default-categories.json"

// GET - Récupérer les données d'un mois spécifique
export async function GET(
  request: Request,
  context: { params: Promise<{ year: string; month: string }> }
) {
  try {
    const params = await context.params
    const year = parseInt(params.year)
    const month = parseInt(params.month)

    const { searchParams } = new URL(request.url)
    const profileId = searchParams.get("profileId")

    if (!profileId) {
      return NextResponse.json({ error: "profileId is required" }, { status: 400 })
    }

    // Trouver l'année pour ce profil
    const budgetYear = await prisma.budgetYear.findUnique({
      where: {
        year_profileId: {
          year,
          profileId,
        },
      },
    })

    if (!budgetYear) {
      return NextResponse.json(
        { error: "Year not found" },
        { status: 404 }
      )
    }

    // Trouver ou créer le mois
    let budgetMonth = await prisma.budgetMonth.findUnique({
      where: {
        yearId_month: {
          yearId: budgetYear.id,
          month,
        },
      },
      include: {
        incomes: {
          orderBy: { date: "desc" },
        },
        categories: {
          include: {
            expenses: true,
          },
        },
      },
    })

    // Si le mois n'existe pas, le créer avec les catégories par défaut
    if (!budgetMonth) {
      budgetMonth = await prisma.budgetMonth.create({
        data: {
          month,
          yearId: budgetYear.id,
          categories: {
            create: defaultCategories.categories.map((cat) => ({
              name: cat.name,
              color: cat.color,
              icon: cat.icon,
            })),
          },
        },
        include: {
          incomes: true,
          categories: {
            include: {
              expenses: true,
            },
          },
        },
      })
    }

    // Calculer le total pour chaque catégorie
    const categoriesWithTotal = budgetMonth.categories.map((category) => ({
      id: category.id,
      name: category.name,
      color: category.color,
      icon: category.icon,
      total: category.expenses.reduce((sum: number, expense: { amount: number }) => sum + expense.amount, 0),
    }))

    return NextResponse.json({
      monthId: budgetMonth.id,
      incomes: budgetMonth.incomes,
      categories: categoriesWithTotal,
    })
  } catch (error) {
    console.error("Error fetching month data:", error)
    return NextResponse.json({ error: "Failed to fetch month data" }, { status: 500 })
  }
}
