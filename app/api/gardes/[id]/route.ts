import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// GET - Récupérer une garde par ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const garde = await prisma.gardeAnimaux.findUnique({
      where: { id },
      include: {
        profile: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!garde) {
      return NextResponse.json({ error: "Garde not found" }, { status: 404 })
    }

    return NextResponse.json(garde)
  } catch (error) {
    console.error("Error fetching garde:", error)
    return NextResponse.json({ error: "Failed to fetch garde" }, { status: 500 })
  }
}

// DELETE - Supprimer une garde
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.gardeAnimaux.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting garde:", error)
    return NextResponse.json({ error: "Failed to delete garde" }, { status: 500 })
  }
}

// PATCH - Mettre à jour une garde
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const garde = await prisma.gardeAnimaux.update({
      where: { id },
      data: {
        ...body,
        dateDebut: body.dateDebut ? new Date(body.dateDebut) : undefined,
        dateFin: body.dateFin ? new Date(body.dateFin) : undefined,
        tarif: body.tarif ? parseFloat(body.tarif) : undefined,
      },
    })

    return NextResponse.json(garde)
  } catch (error) {
    console.error("Error updating garde:", error)
    return NextResponse.json({ error: "Failed to update garde" }, { status: 500 })
  }
}
