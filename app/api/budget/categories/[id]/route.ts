import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// GET - Récupérer une catégorie avec ses dépenses
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const category = await prisma.budgetCategory.findUnique({
      where: { id: params.id },
      include: {
        expenses: {
          orderBy: { date: "desc" },
        },
      },
    })

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      category: {
        id: category.id,
        name: category.name,
        color: category.color,
        icon: category.icon,
      },
      expenses: category.expenses,
    })
  } catch (error) {
    console.error("Error fetching category:", error)
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 })
  }
}
