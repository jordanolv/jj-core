import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// DELETE - Supprimer une entrée (revenu)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.budgetIncome.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting income:", error)
    return NextResponse.json({ error: "Failed to delete income" }, { status: 500 })
  }
}
