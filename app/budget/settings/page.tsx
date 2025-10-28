"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Settings } from "lucide-react"
import Header from "@/components/header"

interface DefaultCategory {
  id: string
  name: string
  color: string
  icon: string
}

export default function BudgetSettingsPage() {
  const router = useRouter()
  const [profileId, setProfileId] = useState<string>("")
  const [categories, setCategories] = useState<DefaultCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: "", color: "#10b981", icon: "📁" })

  useEffect(() => {
    const initializeProfile = async (profileName: string) => {
      try {
        await fetch("/api/init", { method: "POST" })
        const profilesRes = await fetch("/api/profiles")
        const profilesList = await profilesRes.json()
        const currentProfile = profilesList.find((p: { name: string; id: string }) => p.name === profileName)

        if (currentProfile) {
          setProfileId(currentProfile.id)
          loadCategories(currentProfile.id)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  const loadCategories = async (pid?: string) => {
    const id = pid || profileId
    if (!id) return

    try {
      const response = await fetch(`/api/budget/default-categories?profileId=${id}`)
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories)
      }
    } catch (error) {
      console.error("Error loading categories:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategory.name) return

    try {
      const response = await fetch("/api/budget/default-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newCategory, profileId }),
      })

      if (response.ok) {
        setNewCategory({ name: "", color: "#10b981", icon: "📁" })
        setShowAddForm(false)
        loadCategories()
      } else {
        const error = await response.json()
        alert(error.error || "Erreur lors de l'ajout")
      }
    } catch (error) {
      console.error("Error adding category:", error)
      alert("Erreur lors de l'ajout de la catégorie")
    }
  }

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (!confirm(`Supprimer la catégorie "${categoryName}" des catégories par défaut ?`)) return

    try {
      const response = await fetch("/api/budget/default-categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: categoryId }),
      })

      if (response.ok) {
        loadCategories()
      }
    } catch (error) {
      console.error("Error deleting category:", error)
    }
  }

  const handleApplyToAllMonths = async () => {
    if (!confirm("Ajouter les catégories par défaut à tous les mois existants qui ne les ont pas ?")) return

    try {
      const response = await fetch("/api/budget/default-categories/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId }),
      })

      if (response.ok) {
        const data = await response.json()
        alert(`✅ ${data.added} catégories ajoutées avec succès!`)
      }
    } catch (error) {
      console.error("Error applying categories:", error)
      alert("Erreur lors de l'application des catégories")
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
        title="Paramètres Budget"
        description="Gérez vos catégories par défaut"
        showBack={true}
        backHref="/budget"
      />

      <main className="container mx-auto px-4 py-8 relative z-10">
        <Card className="bg-white/50 backdrop-blur-sm border border-white/60 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-emerald-50/30 to-teal-50/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-800">Catégories par défaut</CardTitle>
              </div>
              <Button
                onClick={() => setShowAddForm(!showAddForm)}
                size="sm"
                className="bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-500 hover:to-teal-500 text-white border-0 shadow-md"
              >
                <Plus className="h-4 w-4 mr-1" />
                Ajouter
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <p className="text-sm text-slate-600 mb-6">
              Ces catégories seront automatiquement créées pour chaque nouveau mois.
              Vous pouvez aussi les appliquer à tous les mois existants.
            </p>

            {showAddForm && (
              <form onSubmit={handleAddCategory} className="mb-6 p-4 bg-emerald-50/50 rounded-xl space-y-3">
                <input
                  type="text"
                  placeholder="Nom de la catégorie (ex: Transport, Épargne...)"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Icône (emoji)</label>
                    <input
                      type="text"
                      placeholder="📁"
                      value={newCategory.icon}
                      onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-center text-2xl"
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Couleur</label>
                    <input
                      type="color"
                      value={newCategory.color}
                      onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                      className="w-full h-10 rounded-lg border border-slate-200 cursor-pointer"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white">
                    Ajouter
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false)
                      setNewCategory({ name: "", color: "#10b981", icon: "📁" })
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            )}

            <div className="space-y-2 mb-6">
              {categories.map((category, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                      style={{ backgroundColor: category.color + "20" }}
                    >
                      {category.icon}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{category.name}</p>
                      <p className="text-xs text-slate-500">{category.color}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteCategory(category.id, category.name)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {categories.length === 0 && !showAddForm && (
              <p className="text-center py-8 text-slate-500">Aucune catégorie par défaut définie</p>
            )}

            {categories.length > 0 && (
              <div className="pt-4 border-t border-slate-200">
                <Button
                  onClick={handleApplyToAllMonths}
                  className="w-full bg-gradient-to-r from-blue-400 to-indigo-400 hover:from-blue-500 hover:to-indigo-500 text-white"
                >
                  Appliquer à tous les mois existants
                </Button>
                <p className="text-xs text-slate-500 text-center mt-2">
                  Ajoute les catégories manquantes à tous les mois déjà créés
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
