import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// PATCH - Modifier une dépense
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { description, amount, date } = body

    const expense = await prisma.budgetExpense.update({
      where: { id },
      data: {
        description,
        amount: parseFloat(amount),
        date: date ? new Date(date) : undefined,
      },
    })

    return NextResponse.json(expense)
  } catch (error) {
    console.error("Error updating expense:", error)
    return NextResponse.json({ error: "Failed to update expense" }, { status: 500 })
  }
}

// DELETE - Supprimer une dépense
export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    await prisma.budgetExpense.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting expense:", error)
    return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 })
  }
}
