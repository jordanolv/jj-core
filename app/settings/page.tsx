"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, DollarSign, ChevronRight } from "lucide-react"
import Header from "@/components/header"

export default function SettingsPage() {
  const router = useRouter()
  const [profileId, setProfileId] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeProfile = async (profileName: string) => {
      try {
        await fetch("/api/init", { method: "POST" })
        const profilesRes = await fetch("/api/profiles")
        const profilesList = await profilesRes.json()
        const currentProfile = profilesList.find((p: { name: string; id: string }) => p.name === profileName)

        if (currentProfile) {
          setProfileId(currentProfile.id)
          setLoading(false)
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
  }, [router])

  const settingsOptions = [
    {
      title: "Paramètres Budget",
      description: "Gérer vos catégories par défaut",
      icon: DollarSign,
      color: "from-emerald-400 to-teal-500",
      href: "/budget/settings",
    },
    // On pourra ajouter d'autres paramètres plus tard
    // {
    //   title: "Paramètres Animaux",
    //   description: "Configuration des alertes et notifications",
    //   icon: PawPrint,
    //   color: "from-purple-400 to-pink-500",
    //   href: "/animaux/settings",
    // },
    // {
    //   title: "Paramètres Cuisine",
    //   description: "Préférences alimentaires et régimes",
    //   icon: ChefHat,
    //   color: "from-orange-400 to-red-500",
    //   href: "/cuisine/settings",
    // },
  ]

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
        title="Paramètres"
        description="Configurez vos préférences"
        showBack={true}
        backHref="/dashboard"
      />

      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center shadow-md">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Paramètres</h2>
              <p className="text-sm text-slate-600">Gérez vos préférences par fonctionnalité</p>
            </div>
          </div>

          <div className="space-y-3">
            {settingsOptions.map((option) => {
              const Icon = option.icon
              return (
                <Card
                  key={option.href}
                  className="cursor-pointer bg-white/50 backdrop-blur-sm border border-white/60 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 rounded-2xl overflow-hidden group"
                  onClick={() => router.push(option.href)}
                >
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-slate-800">{option.title}</CardTitle>
                          <p className="text-sm text-slate-600 mt-1">{option.description}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                    </div>
                  </CardHeader>
                </Card>
              )
            })}
          </div>

          {settingsOptions.length === 0 && (
            <Card className="bg-white/50 backdrop-blur-sm border border-white/60 shadow-lg rounded-2xl overflow-hidden">
              <CardContent className="p-12">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-4">
                    <Settings className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Aucun paramètre disponible</h3>
                  <p className="text-sm text-slate-500">Les paramètres seront ajoutés au fur et à mesure</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
