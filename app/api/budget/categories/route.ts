import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// POST - Créer une nouvelle catégorie
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, color, icon, monthId } = body

    if (!name || !monthId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const category = await prisma.budgetCategory.create({
      data: {
        name,
        color: color || "#10b981",
        icon: icon || null,
        monthId,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
  }
}
