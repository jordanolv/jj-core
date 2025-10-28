"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "lucide-react"
import Header from "@/components/header"

interface BudgetMonth {
  id: string
  month: number
  solde: number
}

const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
]

export default function BudgetYearPage() {
  const router = useRouter()
  const params = useParams()
  const year = params.year as string
  const [profileId, setProfileId] = useState<string>("")
  const [months, setMonths] = useState<BudgetMonth[]>([])
  const [yearId, setYearId] = useState<string>("")
  const [loading, setLoading] = useState(true)

  const loadMonths = useCallback(async () => {
    try {
      const response = await fetch(`/api/budget/years/${year}/months`)
      if (response.ok) {
        const data = await response.json()
        setMonths(data.months)
        setYearId(data.yearId)
      }
    } catch (error) {
      console.error("Error loading months:", error)
    } finally {
      setLoading(false)
    }
  }, [year])

  useEffect(() => {
    const initializeProfile = async (profileName: string) => {
      try {
        await fetch("/api/init", { method: "POST" })
        const profilesRes = await fetch("/api/profiles")
        const profilesList = await profilesRes.json()
        const currentProfile = profilesList.find((p: { name: string; id: string }) => p.name === profileName)

        if (currentProfile) {
          setProfileId(currentProfile.id)
          loadMonths()
        }
      } catch (error) {
        console.error("Error initializing profile:", error)
        setLoading(false)
      }
    }

    const currentProfile = localStorage.getItem("currentProfile")
    if (!currentProfile) {
      router.push("/")
    } else {
      initializeProfile(currentProfile)
    }
  }, [router, loadMonths])

  const handleMonthClick = async (monthNumber: number) => {
    // Créer le mois s'il n'existe pas
    const existingMonth = months.find(m => m.month === monthNumber)

    if (!existingMonth) {
      try {
        const response = await fetch(`/api/budget/years/${year}/months`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ month: monthNumber, yearId }),
        })

        if (response.ok) {
          router.push(`/budget/${year}/${monthNumber}`)
        }
      } catch (error) {
        console.error("Error creating month:", error)
      }
    } else {
      router.push(`/budget/${year}/${monthNumber}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-100 via-rose-50 to-blue-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
          <p className="mt-4 text-slate-700">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-rose-50 to-blue-50">
      <Header
        profile={profileId}
        title={`Budget ${year}`}
        description="Sélectionnez un mois"
        showBack={true}
        backHref="/budget"
      />

      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {MONTH_NAMES.map((monthName, index) => {
            const monthNumber = index + 1
            const monthData = months.find(m => m.month === monthNumber)
            const solde = monthData?.solde || 0

            return (
              <Card
                key={monthNumber}
                className="relative cursor-pointer bg-white/50 backdrop-blur-sm border border-white/60 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 rounded-2xl overflow-hidden group"
                onClick={() => handleMonthClick(monthNumber)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 opacity-50 group-hover:opacity-70 transition-opacity"></div>
                <CardHeader className="relative p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Calendar className="h-5 w-5 text-emerald-500" />
                    {monthData && (
                      <div className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        solde >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {solde >= 0 ? '+' : ''}{solde.toFixed(0)}€
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-lg text-slate-800">{monthName}</CardTitle>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}
