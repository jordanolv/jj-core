import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// POST - Créer une nouvelle entrée (revenu)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { description, amount, monthId, profileId, date, isShared } = body

    if (!description || !amount || !monthId || !profileId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const income = await prisma.budgetIncome.create({
      data: {
        description,
        amount: parseFloat(amount),
        monthId,
        profileId,
        date: date ? new Date(date) : new Date(),
        isShared: isShared || false,
      },
    })

    return NextResponse.json(income, { status: 201 })
  } catch (error) {
    console.error("Error creating income:", error)
    return NextResponse.json({ error: "Failed to create income" }, { status: 500 })
  }
}
