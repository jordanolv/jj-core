import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// GET - Récupérer les gardes selon les filtres
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const showJordan = searchParams.get("jordan") === "true"
    const showJuliette = searchParams.get("juliette") === "true"
    const showCommune = searchParams.get("commune") === "true"
    const showAll = searchParams.get("all") === "true"

    // Récupérer les IDs des profils
    const profiles = await prisma.profile.findMany({
      where: {
        name: { in: ["jordan", "juliette"] }
      }
    })
    const jordanId = profiles.find(p => p.name === "jordan")?.id
    const julietteId = profiles.find(p => p.name === "juliette")?.id

    let where

    // Si "all" est demandé, afficher tout
    if (showAll) {
      where = {}
    } 
    // Si uniquement commune est coché, afficher uniquement les communes
    else if (showCommune && !showJordan && !showJuliette) {
      where = { isShared: true }
    }
    // Si des profils sont cochés
    else if (showJordan || showJuliette) {
      const conditions = []
      
      // Ajouter les gardes de Jordan si coché
      if (showJordan) {
        conditions.push({ profileId: jordanId, isShared: false })
      }
      
      // Ajouter les gardes de Juliette si coché
      if (showJuliette) {
        conditions.push({ profileId: julietteId, isShared: false })
      }
      
      // Ajouter les communes si coché
      if (showCommune) {
        conditions.push({ isShared: true })
      }
      
      where = { OR: conditions }
    }
    // Aucun filtre (ne devrait pas arriver car on envoie "all")
    else {
      where = {}
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
      source,
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
        contact: contact || null,
        source: source || null,
        dateDebut: new Date(dateDebut),
        dateFin: new Date(dateFin),
        duree: duree || null,
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
