import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// GET - Récupérer toutes les gardes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const profileId = searchParams.get("profileId")

    if (!profileId) {
      return NextResponse.json({ error: "Profile ID required" }, { status: 400 })
    }

    const gardes = await prisma.gardeAnimaux.findMany({
      where: { profileId },
      orderBy: { dateDebut: "desc" },
    })

    return NextResponse.json(gardes)
  } catch (error) {
    console.error("Error fetching gardes:", error)
    return NextResponse.json({ error: "Failed to fetch gardes" }, { status: 500 })
  }
}

// POST - Créer une nouvelle garde
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      typeAnimal,
      nomAnimal,
      nomClient,
      contact,
      dateDebut,
      dateFin,
      duree,
      tarif,
      typeGarde,
      statut,
      notes,
      profileId,
      photos,
    } = body

    if (!profileId || !typeAnimal || !nomAnimal || !nomClient) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const garde = await prisma.gardeAnimaux.create({
      data: {
        typeAnimal,
        nomAnimal,
        nomClient,
        contact,
        dateDebut: new Date(dateDebut),
        dateFin: new Date(dateFin),
        duree,
        tarif: parseFloat(tarif),
        typeGarde,
        statut: statut || "confirmé",
        notes,
        photos: photos || [],
        profileId,
      },
    })

    return NextResponse.json(garde, { status: 201 })
  } catch (error) {
    console.error("Error creating garde:", error)
    return NextResponse.json({ error: "Failed to create garde" }, { status: 500 })
  }
}
