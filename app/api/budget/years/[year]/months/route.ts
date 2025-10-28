import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// GET - Récupérer tous les mois d'une année avec leur solde
export async function GET(
  request: NextRequest,
  { params }: { params: { year: string } }
) {
  try {
    const year = parseInt(params.year)

    const budgetYear = await prisma.budgetYear.findUnique({
      where: { year },
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
      const totalIncome = month.incomes.reduce((sum, income) => sum + income.amount, 0)
      const totalExpenses = month.expenses.reduce((sum, expense) => sum + expense.amount, 0)

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
  request: NextRequest,
  { params }: { params: { year: string } }
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

    const budgetMonth = await prisma.budgetMonth.create({
      data: {
        month,
        yearId,
      },
    })

    return NextResponse.json(budgetMonth, { status: 201 })
  } catch (error) {
    console.error("Error creating month:", error)
    return NextResponse.json({ error: "Failed to create month" }, { status: 500 })
  }
}
