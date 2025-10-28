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

    // Récupérer categoryId et amount du body
    const body = await request.json()
    const { categoryId, amount } = body

    if (!categoryId || !amount) {
      return NextResponse.json(
        { error: "Missing required fields: categoryId, amount" },
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
        description: category.name, // Utiliser le nom de la catégorie comme description
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
