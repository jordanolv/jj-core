import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// GET - Récupérer tous les mois d'une année avec leur solde
export async function GET(
  request: Request,
  context: { params: Promise<{ year: string }> }
) {
  try {
    const { year: yearParam } = await context.params
    const year = parseInt(yearParam)

    const { searchParams } = new URL(request.url)
    const profileId = searchParams.get("profileId")

    if (!profileId) {
      return NextResponse.json({ error: "profileId is required" }, { status: 400 })
    }

    const budgetYear = await prisma.budgetYear.findUnique({
      where: {
        year_profileId: {
          year,
          profileId,
        },
      },
      include: {
        months: {
          include: {
            incomes: true,
            expenses: true,
          },
        },
      },
    })

    if (!budgetYear) {
      return NextResponse.json({ yearId: null, months: [] })
    }

    // Calculer le solde pour chaque mois
    const monthsWithSolde = budgetYear.months.map((month) => {
      const totalIncome = month.incomes.reduce((sum: number, income: { amount: number }) => sum + income.amount, 0)
      const totalExpenses = month.expenses.reduce((sum: number, expense: { amount: number }) => sum + expense.amount, 0)

      return {
        id: month.id,
        month: month.month,
        solde: totalIncome - totalExpenses,
      }
    })

    return NextResponse.json({
      yearId: budgetYear.id,
      months: monthsWithSolde,
    })
  } catch (error) {
    console.error("Error fetching months:", error)
    return NextResponse.json({ error: "Failed to fetch months" }, { status: 500 })
  }
}

// POST - Créer un nouveau mois
export async function POST(
  request: Request
) {
  try {
    const body = await request.json()
    const { month, yearId } = body

    if (!month || !yearId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Vérifier si le mois existe déjà
    const existing = await prisma.budgetMonth.findUnique({
      where: {
        yearId_month: {
          yearId,
          month,
        },
      },
    })

    if (existing) {
      return NextResponse.json(existing)
    }

    // Récupérer l'année pour avoir le profileId
    const budgetYear = await prisma.budgetYear.findUnique({
      where: { id: yearId },
    })

    if (!budgetYear) {
      return NextResponse.json({ error: "Year not found" }, { status: 404 })
    }

    // Récupérer les catégories par défaut du profil
    const defaultCategories = await prisma.defaultBudgetCategory.findMany({
      where: { profileId: budgetYear.profileId },
    })

    const budgetMonth = await prisma.budgetMonth.create({
      data: {
        month,
        yearId,
        categories: {
          create: defaultCategories.map((cat) => ({
            name: cat.name,
            color: cat.color,
            icon: cat.icon,
          })),
        },
      },
    })

    return NextResponse.json(budgetMonth, { status: 201 })
  } catch (error) {
    console.error("Error creating month:", error)
    return NextResponse.json({ error: "Failed to create month" }, { status: 500 })
  }
}
