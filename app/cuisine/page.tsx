"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Plus, Clock, Users, Heart, Search } from "lucide-react"

interface Recette {
  id: string
  titre: string
  description: string
  tempsPrep: number
  tempsCuisson: number
  portions: number
  favorite: boolean
  categorie: string
  image?: string
}

export default function CuisinePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<string>("")
  const [recettes, setRecettes] = useState<Recette[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    const currentProfile = localStorage.getItem("currentProfile")
    if (!currentProfile) {
      router.push("/")
    } else {
      setProfile(currentProfile)
      loadRecettes()
    }
  }, [router])

  const loadRecettes = () => {
    // Charger depuis localStorage pour le moment
    const saved = localStorage.getItem("recettes")
    if (saved) {
      setRecettes(JSON.parse(saved))
    }
  }

  const filteredRecettes = recettes.filter((r) =>
    r.titre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Cuisine</h1>
              <p className="text-sm text-gray-500">Gérez vos recettes</p>
            </div>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle recette
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher une recette..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Recettes Grid */}
        {filteredRecettes.length === 0 ? (
          <Card className="p-12 text-center">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-400">Aucune recette</CardTitle>
              <CardDescription>
                Commencez par créer votre première recette !
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecettes.map((recette) => (
              <Card
                key={recette.id}
                className="cursor-pointer transition-all hover:shadow-lg group"
              >
                {recette.image && (
                  <div className="h-48 bg-gradient-to-br from-orange-200 to-red-200 rounded-t-lg" />
                )}
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{recette.titre}</CardTitle>
                    {recette.favorite && (
                      <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                    )}
                  </div>
                  <CardDescription className="line-clamp-2">
                    {recette.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {recette.tempsPrep + recette.tempsCuisson} min
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {recette.portions} pers.
                    </div>
                  </div>
                  {recette.categorie && (
                    <div className="mt-3">
                      <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                        {recette.categorie}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Form Modal - À implémenter dans un composant séparé */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Nouvelle recette</CardTitle>
                <CardDescription>
                  Ajoutez les détails de votre recette
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input placeholder="Titre de la recette" />
                  <Input placeholder="Description" />
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
