import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll("files") as File[]
    const type = formData.get("type") as string || "pets" // Par défaut: pets

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      )
    }

    // Valider le type
    const validTypes = ["pets", "recipes"]
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Type invalide. Utilisez 'pets' ou 'recipes'" },
        { status: 400 }
      )
    }

    // Créer le dossier uploads/{type} s'il n'existe pas
    const uploadDir = join(process.cwd(), "public", "uploads", type)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const uploadedUrls: string[] = []

    for (const file of files) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Générer un nom de fichier unique
      const timestamp = Date.now()
      const randomStr = Math.random().toString(36).substring(7)
      const filename = `${timestamp}-${randomStr}-${file.name}`
      const filepath = join(uploadDir, filename)

      // Sauvegarder le fichier
      await writeFile(filepath, buffer)

      // Retourner l'URL relative
      uploadedUrls.push(`/uploads/${type}/${filename}`)
    }

    return NextResponse.json({ urls: uploadedUrls })
  } catch (error) {
    console.error("Erreur lors de l'upload:", error)
    return NextResponse.json(
      { error: "Erreur lors de l'upload des fichiers" },
      { status: 500 }
    )
  }
}
