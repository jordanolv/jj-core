"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Calendar, TrendingUp } from "lucide-react"
import Header from "@/components/header"

interface BudgetYear {
  id: string
  year: number
  solde: number
}

export default function BudgetPage() {
  const router = useRouter()
  const [profileId, setProfileId] = useState<string>("")
  const [years, setYears] = useState<BudgetYear[]>([])
  const [loading, setLoading] = useState(true)

  const loadYears = useCallback(async (pid?: string) => {
    const id = pid || profileId
    if (!id) return

    try {
      const response = await fetch(`/api/budget/years?profileId=${id}`)
      if (response.ok) {
        const data = await response.json()
        setYears(data)
      }
    } catch (error) {
      console.error("Error loading years:", error)
    } finally {
      setLoading(false)
    }
  }, [profileId])

  useEffect(() => {
    const initializeProfile = async (profileName: string) => {
      try {
        await fetch("/api/init", { method: "POST" })
        const profilesRes = await fetch("/api/profiles")
        const profilesList = await profilesRes.json()
        const currentProfile = profilesList.find((p: { name: string; id: string }) => p.name === profileName)

        if (currentProfile) {
          setProfileId(currentProfile.id)
          loadYears(currentProfile.id)
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
  }, [router, loadYears])

  const handleCreateYear = async () => {
    const currentYear = new Date().getFullYear()
    const nextYear = years.length > 0
      ? Math.max(...years.map(y => y.year)) + 1
      : currentYear

    try {
      const response = await fetch("/api/budget/years", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year: nextYear, profileId }),
      })

      if (response.ok) {
        loadYears()
      }
    } catch (error) {
      console.error("Error creating year:", error)
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
        title="Gestion Budget"
        description="Gérez vos finances"
        showBack={true}
        actions={
          <Button onClick={handleCreateYear} className="bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-500 hover:to-teal-500 text-white border-0 shadow-md mr-2">
            <Plus className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="sm:hidden">Année</span>
            <span className="hidden sm:inline">Nouvelle année</span>
          </Button>
        }
      />

      <main className="container mx-auto px-4 py-8 relative z-10">
        {years.length === 0 ? (
          <Card className="bg-white/50 backdrop-blur-sm border border-white/60 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-12">
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mx-auto">
                    <Calendar className="h-8 w-8 text-emerald-500" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Aucune année créée</h3>
                <p className="text-sm text-slate-500 mb-4">Commencez par créer votre première année de budget</p>
                <Button
                  className="bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-500 hover:to-teal-500 text-white border-0 shadow-md"
                  onClick={handleCreateYear}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Créer votre première année
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {years.map((yearData) => (
              <Card
                key={yearData.id}
                className="relative cursor-pointer bg-white/50 backdrop-blur-sm border border-white/60 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 rounded-2xl overflow-hidden group"
                onClick={() => router.push(`/budget/${yearData.year}`)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 opacity-50 group-hover:opacity-70 transition-opacity"></div>
                <CardHeader className="relative">
                  <div className="mb-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <Calendar className="h-7 w-7 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-3xl mb-2 text-slate-800">{yearData.year}</CardTitle>
                  <div className="flex items-center gap-2 mt-4">
                    <TrendingUp className="h-4 w-4 text-slate-500" />
                    <span className="text-xs text-slate-500">Solde:</span>
                    <span className={`text-lg font-bold ${yearData.solde >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {yearData.solde.toFixed(2)} €
                    </span>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
