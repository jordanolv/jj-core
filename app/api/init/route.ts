import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// Route pour initialiser les profils Jordan & Juliette
export async function POST() {
  try {
    // Créer ou récupérer Jordan
    const jordan = await prisma.profile.upsert({
      where: { name: "jordan" },
      update: {},
      create: { name: "jordan" },
    })

    // Créer ou récupérer Juliette
    const juliette = await prisma.profile.upsert({
      where: { name: "juliette" },
      update: {},
      create: { name: "juliette" },
    })

    return NextResponse.json({
      success: true,
      profiles: [jordan, juliette],
    })
  } catch (error) {
    console.error("Error initializing profiles:", error)
    return NextResponse.json(
      { error: "Failed to initialize profiles" },
      { status: 500 }
    )
  }
}
