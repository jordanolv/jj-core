import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// GET - Récupérer les catégories du mois actuel pour un profil
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const profileId = searchParams.get("profileId")

    if (!profileId) {
      return NextResponse.json({ error: "profileId is required" }, { status: 400 })
    }

    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1 // 1-12

    // Trouver ou créer l'année avec les mois inclus
    let budgetYear = await prisma.budgetYear.findUnique({
      where: {
        year_profileId: {
          year: currentYear,
          profileId,
        },
      },
      include: {
        months: {
          include: {
            categories: true,
          },
        },
      },
    })

    // Si l'année n'existe pas, la créer avec les 12 mois
    if (!budgetYear) {
      const defaultCategories = await prisma.defaultBudgetCategory.findMany({
        where: { profileId },
      })

      budgetYear = await prisma.budgetYear.create({
        data: {
          year: currentYear,
          profileId,
          months: {
            create: Array.from({ length: 12 }, (_, i) => ({
              month: i + 1,
              categories: {
                create: defaultCategories.map((cat) => ({
                  name: cat.name,
                  color: cat.color,
                  icon: cat.icon,
                })),
              },
            })),
          },
        },
        include: {
          months: {
            include: {
              categories: true,
            },
          },
        },
      })
    }

    // Trouver le mois actuel
    const currentMonthData = budgetYear.months.find((m) => m.month === currentMonth)

    if (!currentMonthData) {
      return NextResponse.json({ error: "Current month not found" }, { status: 404 })
    }

    // Retourner les catégories avec monthId
    return NextResponse.json({
      monthId: currentMonthData.id,
      categories: currentMonthData.categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
      })),
    })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}
