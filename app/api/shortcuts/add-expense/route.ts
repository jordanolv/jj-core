import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// POST - Ajouter une dépense rapidement (pour raccourci iOS)
export async function POST(request: NextRequest) {
  try {
    // Récupérer profileId de l'URL
    const { searchParams } = new URL(request.url)
    const profileId = searchParams.get("profileId")

    if (!profileId) {
      return NextResponse.json({ error: "profileId is required in URL" }, { status: 400 })
    }

    // Récupérer les données du body
    const body = await request.json()
    console.log("Received body:", JSON.stringify(body, null, 2))
    const { categoryName, description, amount } = body

    if (!categoryName || !description || !amount) {
      console.log("Missing fields - categoryName:", categoryName, "description:", description, "amount:", amount)
      return NextResponse.json(
        { error: "Missing required fields: categoryName, description, amount" },
        { status: 400 }
      )
    }

    // Récupérer l'année et le mois actuel
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1

    // Trouver le mois actuel dans la base de données
    const budgetYear = await prisma.budgetYear.findUnique({
      where: {
        year_profileId: {
          year: currentYear,
          profileId,
        },
      },
      include: {
        months: {
          where: { month: currentMonth },
          include: {
            categories: true,
          },
        },
      },
    })

    if (!budgetYear || budgetYear.months.length === 0) {
      return NextResponse.json({ error: "Current month not found" }, { status: 404 })
    }

    const currentMonthData = budgetYear.months[0]

    // Trouver la catégorie par son nom (icon + name)
    const category = currentMonthData.categories.find((cat) => `${cat.icon} ${cat.name}` === categoryName)

    if (!category) {
      return NextResponse.json({ error: "Category not found in current month" }, { status: 404 })
    }

    // Créer la dépense
    const expense = await prisma.budgetExpense.create({
      data: {
        description,
        amount: parseFloat(amount),
        date: new Date(),
        categoryId: category.id,
        monthId: currentMonthData.id,
        profileId,
        isShared: false,
      },
    })

    return NextResponse.json({
      success: true,
      expense: {
        id: expense.id,
        description: expense.description,
        amount: expense.amount,
        category: category.name,
      },
    })
  } catch (error) {
    console.error("Error adding expense:", error)
    return NextResponse.json({ error: "Failed to add expense" }, { status: 500 })
  }
}
