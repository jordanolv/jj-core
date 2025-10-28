import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// GET - Récupérer les catégories par défaut d'un profil
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const profileId = searchParams.get("profileId")

    if (!profileId) {
      return NextResponse.json({ error: "profileId is required" }, { status: 400 })
    }

    const categories = await prisma.defaultBudgetCategory.findMany({
      where: { profileId },
      orderBy: { name: "asc" },
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Error reading default categories:", error)
    return NextResponse.json({ error: "Failed to read default categories" }, { status: 500 })
  }
}

// POST - Ajouter une catégorie par défaut
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, color, icon, profileId } = body

    if (!name || !color || !profileId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Créer la catégorie (unique constraint géré par Prisma)
    try {
      const category = await prisma.defaultBudgetCategory.create({
        data: {
          name,
          color,
          icon: icon || "📁",
          profileId,
        },
      })

      return NextResponse.json({ success: true, category })
    } catch (error: unknown) {
      // Gestion de l'erreur Prisma
      if (error && typeof error === 'object' && 'code' in error && error.code === "P2002") {
        return NextResponse.json(
          { error: "Cette catégorie existe déjà dans vos catégories par défaut" },
          { status: 400 }
        )
      }
      throw error
    }
  } catch (error) {
    console.error("Error adding default category:", error)
    return NextResponse.json({ error: "Failed to add default category" }, { status: 500 })
  }
}

// DELETE - Supprimer une catégorie par défaut
export async function DELETE(request: Request) {
  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json(
        { error: "Missing category id" },
        { status: 400 }
      )
    }

    await prisma.defaultBudgetCategory.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting default category:", error)
    return NextResponse.json({ error: "Failed to delete default category" }, { status: 500 })
  }
}
