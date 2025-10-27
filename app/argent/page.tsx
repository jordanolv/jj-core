"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Calendar, DollarSign, TrendingUp } from "lucide-react"
import Header from "@/components/header"

interface Abonnement {
  id: string
  nom: string
  prix: number
  frequence: "mensuel" | "annuel" | "hebdomadaire"
  dateDebut: string
  actif: boolean
  categorie: string
}

export default function ArgentPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<string>("")
  const [abonnements, setAbonnements] = useState<Abonnement[]>([])
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    const currentProfile = localStorage.getItem("currentProfile")
    if (!currentProfile) {
      router.push("/")
    } else {
      setProfile(currentProfile)
      loadAbonnements()
    }
  }, [router])

  const loadAbonnements = () => {
    const saved = localStorage.getItem("abonnements")
    if (saved) {
      setAbonnements(JSON.parse(saved))
    }
  }

  const totalMensuel = abonnements
    .filter((a) => a.actif)
    .reduce((sum, a) => {
      if (a.frequence === "mensuel") return sum + a.prix
      if (a.frequence === "annuel") return sum + a.prix / 12
      if (a.frequence === "hebdomadaire") return sum + a.prix * 4
      return sum
    }, 0)

  const totalAnnuel = totalMensuel * 12

  const categoriesColors: Record<string, string> = {
    streaming: "bg-purple-100 text-purple-700 border-purple-200",
    sport: "bg-green-100 text-green-700 border-green-200",
    logiciel: "bg-blue-100 text-blue-700 border-blue-200",
    autre: "bg-gray-100 text-gray-700 border-gray-200",
  }

  if (!profile) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <Header 
        profile={profile}
        title="Argent"
        description="Gérez vos abonnements"
        showBack={true}
        actions={
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvel abonnement
          </Button>
        }
      />

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total mensuel</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMensuel.toFixed(2)} €</div>
              <p className="text-xs text-muted-foreground">par mois</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total annuel</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAnnuel.toFixed(2)} €</div>
              <p className="text-xs text-muted-foreground">par an</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Abonnements actifs</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {abonnements.filter((a) => a.actif).length}
              </div>
              <p className="text-xs text-muted-foreground">
                sur {abonnements.length} au total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Abonnements List */}
        <Card>
          <CardHeader>
            <CardTitle>Mes abonnements</CardTitle>
            <CardDescription>Liste de tous vos abonnements</CardDescription>
          </CardHeader>
          <CardContent>
            {abonnements.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">Aucun abonnement enregistré</p>
              </div>
            ) : (
              <div className="space-y-4">
                {abonnements.map((abo) => (
                  <div
                    key={abo.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{abo.nom}</h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${
                            categoriesColors[abo.categorie] || categoriesColors.autre
                          }`}
                        >
                          {abo.categorie}
                        </span>
                        {!abo.actif && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border-red-200">
                            Inactif
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Depuis le {new Date(abo.dateDebut).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-800">
                        {abo.prix.toFixed(2)} €
                      </p>
                      <p className="text-sm text-gray-500 capitalize">
                        {abo.frequence}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Nouvel abonnement</CardTitle>
                <CardDescription>Ajoutez un nouvel abonnement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input placeholder="Nom de l'abonnement" />
                  <Input type="number" placeholder="Prix" />
                  {/* Ajouter plus de champs */}
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setShowForm(false)}>
                      Annuler
                    </Button>
                    <Button onClick={() => setShowForm(false)}>
                      Enregistrer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
