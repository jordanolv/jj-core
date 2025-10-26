import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const profileId = searchParams.get("profileId")

    if (!profileId) {
      return NextResponse.json({ error: "Profile ID required" }, { status: 400 })
    }

    const abonnements = await prisma.abonnement.findMany({
      where: { profileId },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(abonnements)
  } catch (error) {
    console.error("Error fetching abonnements:", error)
    return NextResponse.json({ error: "Failed to fetch abonnements" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      nom,
      prix,
      frequence,
      dateDebut,
      dateFin,
      actif,
      categorie,
      description,
      profileId,
    } = body

    if (!profileId || !nom || !prix || !frequence) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const abonnement = await prisma.abonnement.create({
      data: {
        nom,
        prix: parseFloat(prix),
        frequence,
        dateDebut: new Date(dateDebut),
        dateFin: dateFin ? new Date(dateFin) : null,
        actif: actif !== undefined ? actif : true,
        categorie,
        description,
        profileId,
      },
    })

    return NextResponse.json(abonnement, { status: 201 })
  } catch (error) {
    console.error("Error creating abonnement:", error)
    return NextResponse.json({ error: "Failed to create abonnement" }, { status: 500 })
  }
}
