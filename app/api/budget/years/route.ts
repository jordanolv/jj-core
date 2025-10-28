import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// GET - Récupérer toutes les années avec leur solde (filtrées par profil)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const profileId = searchParams.get("profileId")

    if (!profileId) {
      return NextResponse.json({ error: "profileId is required" }, { status: 400 })
    }

    const years = await prisma.budgetYear.findMany({
      where: { profileId },
      include: {
        months: {
          include: {
            incomes: true,
            expenses: true,
          },
        },
      },
      orderBy: { year: "desc" },
    })

    // Calculer le solde pour chaque année
    const yearsWithSolde = years.map((year) => {
      let totalIncome = 0
      let totalExpenses = 0

      year.months.forEach((month) => {
        totalIncome += month.incomes.reduce((sum, income) => sum + income.amount, 0)
        totalExpenses += month.expenses.reduce((sum, expense) => sum + expense.amount, 0)
      })

      return {
        id: year.id,
        year: year.year,
        solde: totalIncome - totalExpenses,
      }
    })

    return NextResponse.json(yearsWithSolde)
  } catch (error) {
    console.error("Error fetching years:", error)
    return NextResponse.json({ error: "Failed to fetch years" }, { status: 500 })
  }
}

// POST - Créer une nouvelle année
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { year, profileId } = body

    if (!year || !profileId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Vérifier si l'année existe déjà pour ce profil
    const existing = await prisma.budgetYear.findUnique({
      where: {
        year_profileId: {
          year,
          profileId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Year already exists for this profile" },
        { status: 400 }
      )
    }

    // Récupérer les catégories par défaut du profil
    const defaultCategories = await prisma.defaultBudgetCategory.findMany({
      where: { profileId },
    })

    // Créer l'année avec les 12 mois et les catégories par défaut
    const budgetYear = await prisma.budgetYear.create({
      data: {
        year,
        profileId,
        months: {
          create: Array.from({ length: 12 }, (_, i) => ({
            month: i + 1, // 1 à 12 pour janvier à décembre
            categories: {
              create: defaultCategories.map((cat) => ({
                name: cat.name,
                color: cat.color,
                icon: cat.icon,
              })),
            },
          })),
        },
      },
      include: {
        months: {
          include: {
            categories: true,
          },
        },
      },
    })

    return NextResponse.json(budgetYear, { status: 201 })
  } catch (error) {
    console.error("Error creating year:", error)
    return NextResponse.json({ error: "Failed to create year" }, { status: 500 })
  }
}
