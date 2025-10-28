import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// GET - Récupérer toutes les années avec leur solde
export async function GET() {
  try {
    const years = await prisma.budgetYear.findMany({
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

    // Vérifier si l'année existe déjà
    const existing = await prisma.budgetYear.findUnique({
      where: { year },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Year already exists" },
        { status: 400 }
      )
    }

    const budgetYear = await prisma.budgetYear.create({
      data: {
        year,
        profileId,
      },
    })

    return NextResponse.json(budgetYear, { status: 201 })
  } catch (error) {
    console.error("Error creating year:", error)
    return NextResponse.json({ error: "Failed to create year" }, { status: 500 })
  }
}
