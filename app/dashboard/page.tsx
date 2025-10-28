"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChefHat, DollarSign, PawPrint } from "lucide-react"
import Header from "@/components/header"

export default function Dashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<string>("")

  useEffect(() => {
    const currentProfile = localStorage.getItem("currentProfile")
    if (!currentProfile) {
      router.push("/")
    } else {
      setProfile(currentProfile)
    }
  }, [router])

  if (!profile) return null

  const modules = [
    {
      title: "Cuisine",
      description: "Découvrez et partagez vos recettes préférées",
      icon: ChefHat,
      href: "/cuisine",
      gradient: "from-orange-400 to-amber-400",
      bgGradient: "from-orange-400/10 to-amber-400/10",
      iconBg: "from-orange-400 to-amber-500",
    },
    {
      title: "Gestion Budget",
      description: "Gérez vos revenus et dépenses mensuelles",
      icon: DollarSign,
      href: "/budget",
      gradient: "from-emerald-400 to-teal-400",
      bgGradient: "from-emerald-400/10 to-teal-400/10",
      iconBg: "from-emerald-400 to-teal-500",
    },
    {
      title: "Argent",
      description: "Suivez vos abonnements et vos dépenses",
      icon: DollarSign,
      href: "/argent",
      gradient: "from-blue-400 to-cyan-400",
      bgGradient: "from-blue-400/10 to-cyan-400/10",
      iconBg: "from-blue-400 to-cyan-500",
    },
    {
      title: "Animaux",
      description: "Gérez vos gardes et vos petits compagnons",
      icon: PawPrint,
      href: "/animaux",
      gradient: "from-rose-400 to-pink-400",
      bgGradient: "from-rose-400/10 to-pink-400/10",
      iconBg: "from-rose-400 to-pink-500",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-rose-50 to-blue-50">
      <Header profile={profile} />

      {/* Dashboard Content */}
      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-73px)] px-4 py-12">
        <div className="container mx-auto">
          <div className="mb-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-slate-800">
              Que souhaitez-vous faire ?
            </h2>
            <p className="text-slate-600 text-base md:text-lg">
              Explorez vos différents espaces
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {modules.map((module) => {
            const Icon = module.icon
            return (
              <Card
                key={module.title}
                className="relative cursor-pointer bg-white/50 backdrop-blur-sm border border-white/60 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 rounded-2xl overflow-hidden group"
                onClick={() => router.push(module.href)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${module.bgGradient} opacity-50 group-hover:opacity-70 transition-opacity`}></div>
                <CardHeader className="relative pb-4">
                  <div className="mb-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${module.iconBg} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl mb-2 text-slate-800">{module.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed text-slate-600">
                    {module.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative pt-0">
                  <div className={`inline-flex items-center gap-2 text-sm font-semibold bg-gradient-to-r ${module.gradient} bg-clip-text text-transparent group-hover:gap-3 transition-all`}>
                    Découvrir
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
          </div>
        </div>
      </main>
    </div>
  )
}
