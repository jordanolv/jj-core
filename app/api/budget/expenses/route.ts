import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// POST - Créer une nouvelle dépense
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { description, amount, categoryId, profileId, date, isShared } = body

    if (!description || !amount || !categoryId || !profileId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Récupérer la catégorie pour obtenir le monthId
    const category = await prisma.budgetCategory.findUnique({
      where: { id: categoryId },
    })

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      )
    }

    const expense = await prisma.budgetExpense.create({
      data: {
        description,
        amount: parseFloat(amount),
        categoryId,
        monthId: category.monthId,
        profileId,
        date: date ? new Date(date) : new Date(),
        isShared: isShared || false,
      },
    })

    return NextResponse.json(expense, { status: 201 })
  } catch (error) {
    console.error("Error creating expense:", error)
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 })
  }
}
