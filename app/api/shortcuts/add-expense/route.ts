import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// POST - Ajouter une dépense rapidement (pour raccourci iOS)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { categoryId, description, amount, profileId } = body

    if (!categoryId || !description || !amount || !profileId) {
      return NextResponse.json(
        { error: "Missing required fields: categoryId, description, amount, profileId" },
        { status: 400 }
      )
    }

    // Récupérer la catégorie pour avoir le monthId
    const category = await prisma.budgetCategory.findUnique({
      where: { id: categoryId },
      include: { month: true },
    })

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    // Créer la dépense
    const expense = await prisma.budgetExpense.create({
      data: {
        description,
        amount: parseFloat(amount),
        date: new Date(),
        categoryId,
        monthId: category.monthId,
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
