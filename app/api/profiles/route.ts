import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const profiles = await prisma.profile.findMany()
    return NextResponse.json(profiles)
  } catch (error) {
    console.error("Error fetching profiles:", error)
    return NextResponse.json({ error: "Failed to fetch profiles" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, avatar } = body

    if (!name) {
      return NextResponse.json({ error: "Name required" }, { status: 400 })
    }

    const profile = await prisma.profile.create({
      data: { name, avatar },
    })

    return NextResponse.json(profile, { status: 201 })
  } catch (error) {
    console.error("Error creating profile:", error)
    return NextResponse.json({ error: "Failed to create profile" }, { status: 500 })
  }
}
