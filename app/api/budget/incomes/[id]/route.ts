import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// PATCH - Modifier une entrée (revenu)
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { description, amount, date } = body

    const updateData: {
      description?: string
      amount?: number
      date?: Date
    } = {}

    if (description !== undefined) updateData.description = description
    if (amount !== undefined) updateData.amount = parseFloat(amount)
    if (date !== undefined) updateData.date = new Date(date)

    const income = await prisma.budgetIncome.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(income)
  } catch (error) {
    console.error("Error updating income:", error)
    return NextResponse.json({ error: "Failed to update income" }, { status: 500 })
  }
}

// DELETE - Supprimer une entrée (revenu)
export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    await prisma.budgetIncome.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting income:", error)
    return NextResponse.json({ error: "Failed to delete income" }, { status: 500 })
  }
}
