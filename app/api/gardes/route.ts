import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// GET - Récupérer les gardes selon les filtres
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const showJordan = searchParams.get("jordan") === "true"
    const showJuliette = searchParams.get("juliette") === "true"

    // Récupérer les IDs des profils
    const profiles = await prisma.profile.findMany({
      where: {
        name: { in: ["jordan", "juliette"] }
      }
    })
    const jordanId = profiles.find(p => p.name === "jordan")?.id
    const julietteId = profiles.find(p => p.name === "juliette")?.id

    let where: any

    if (!showJordan && !showJuliette) {
      // Aucun filtre → uniquement les gardes communes
      where = { isShared: true }
    } else if (showJordan && showJuliette) {
      // Les deux cochés → toutes les gardes
      where = {}
    } else if (showJordan) {
      // Jordan coché → gardes de Jordan (personnelles + communes)
      where = {
        OR: [
          { profileId: jordanId, isShared: false },
          { isShared: true }
        ]
      }
    } else if (showJuliette) {
      // Juliette coché → gardes de Juliette (personnelles + communes)
      where = {
        OR: [
          { profileId: julietteId, isShared: false },
          { isShared: true }
        ]
      }
    }

    const gardes = await prisma.gardeAnimaux.findMany({
      where,
      include: {
        profile: {
          select: {
            id: true,
            name: true,
          },
        },
      },
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
      isShared,
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
        isShared: isShared || false,
        profileId,
      },
    })

    return NextResponse.json(garde, { status: 201 })
  } catch (error) {
    console.error("Error creating garde:", error)
    return NextResponse.json({ error: "Failed to create garde" }, { status: 500 })
  }
}
