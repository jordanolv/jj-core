import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const profileId = searchParams.get("profileId")

    if (!profileId) {
      return NextResponse.json({ error: "Profile ID required" }, { status: 400 })
    }

    const recettes = await prisma.recette.findMany({
      where: { profileId },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(recettes)
  } catch (error) {
    console.error("Error fetching recettes:", error)
    return NextResponse.json({ error: "Failed to fetch recettes" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      titre,
      description,
      ingredients,
      etapes,
      tempsPrep,
      tempsCuisson,
      portions,
      categorie,
      image,
      favorite,
      profileId,
    } = body

    if (!profileId || !titre) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const recette = await prisma.recette.create({
      data: {
        titre,
        description,
        ingredients: JSON.stringify(ingredients || []),
        etapes: JSON.stringify(etapes || []),
        tempsPrep: tempsPrep ? parseInt(tempsPrep) : null,
        tempsCuisson: tempsCuisson ? parseInt(tempsCuisson) : null,
        portions: portions ? parseInt(portions) : null,
        categorie,
        image,
        favorite: favorite || false,
        profileId,
      },
    })

    return NextResponse.json(recette, { status: 201 })
  } catch (error) {
    console.error("Error creating recette:", error)
    return NextResponse.json({ error: "Failed to create recette" }, { status: 500 })
  }
}
