"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, TrendingUp, TrendingDown, DollarSign } from "lucide-react"
import Header from "@/components/header"

interface BudgetIncome {
  id: string
  description: string
  amount: number
  date: string
}

interface BudgetCategory {
  id: string
  name: string
  color?: string
  icon?: string
  total: number
}

const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
]

export default function BudgetMonthPage() {
  const router = useRouter()
  const params = useParams()
  const year = params.year as string
  const month = parseInt(params.month as string)
  const [profileId, setProfileId] = useState<string>("")
  const [monthId, setMonthId] = useState<string>("")
  const [incomes, setIncomes] = useState<BudgetIncome[]>([])
  const [categories, setCategories] = useState<BudgetCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [showIncomeForm, setShowIncomeForm] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [newIncome, setNewIncome] = useState({ description: "", amount: "" })
  const [newCategory, setNewCategory] = useState({ name: "", color: "#10b981" })

  useEffect(() => {
    const initializeProfile = async (profileName: string) => {
      try {
        await fetch("/api/init", { method: "POST" })
        const profilesRes = await fetch("/api/profiles")
        const profilesList = await profilesRes.json()
        const currentProfile = profilesList.find((p: { name: string; id: string }) => p.name === profileName)

        if (currentProfile) {
          setProfileId(currentProfile.id)
          loadMonthData()
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

  const loadMonthData = async () => {
    try {
      const response = await fetch(`/api/budget/years/${year}/months/${month}`)
      if (response.ok) {
        const data = await response.json()
        setMonthId(data.monthId)
        setIncomes(data.incomes)
        setCategories(data.categories)
      }
    } catch (error) {
      console.error("Error loading month data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddIncome = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newIncome.description || !newIncome.amount) return

    try {
      const response = await fetch(`/api/budget/incomes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: newIncome.description,
          amount: parseFloat(newIncome.amount),
          monthId,
          profileId,
          date: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        setNewIncome({ description: "", amount: "" })
        setShowIncomeForm(false)
        loadMonthData()
      }
    } catch (error) {
      console.error("Error adding income:", error)
    }
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategory.name) return

    try {
      const response = await fetch(`/api/budget/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCategory.name,
          color: newCategory.color,
          monthId,
        }),
      })

      if (response.ok) {
        setNewCategory({ name: "", color: "#10b981" })
        setShowCategoryForm(false)
        loadMonthData()
      }
    } catch (error) {
      console.error("Error adding category:", error)
    }
  }

  const handleDeleteIncome = async (incomeId: string) => {
    if (!confirm("Supprimer cette entrée ?")) return

    try {
      const response = await fetch(`/api/budget/incomes/${incomeId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        loadMonthData()
      }
    } catch (error) {
      console.error("Error deleting income:", error)
    }
  }

  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0)
  const totalExpenses = categories.reduce((sum, cat) => sum + cat.total, 0)
  const solde = totalIncome - totalExpenses

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
        title={`${MONTH_NAMES[month - 1]} ${year}`}
        description="Gérez vos revenus et dépenses"
        showBack={true}
        backHref={`/budget/${year}`}
      />

      <main className="container mx-auto px-4 py-8 relative z-10 space-y-6">
        {/* Solde */}
        <Card className="relative bg-white/50 backdrop-blur-sm border border-white/60 shadow-lg rounded-2xl overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${solde >= 0 ? 'from-emerald-400/10 to-teal-400/10' : 'from-red-400/10 to-rose-400/10'} opacity-50`}></div>
          <CardHeader className="relative">
            <CardTitle className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-2">Solde</CardTitle>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl ${solde >= 0 ? 'bg-gradient-to-br from-emerald-400 to-teal-500' : 'bg-gradient-to-br from-red-400 to-rose-500'} flex items-center justify-center shadow-md`}>
                {solde >= 0 ? <TrendingUp className="h-6 w-6 text-white" /> : <TrendingDown className="h-6 w-6 text-white" />}
              </div>
              <div>
                <div className={`text-3xl font-bold ${solde >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                  {solde.toFixed(2)} €
                </div>
                <p className="text-sm text-slate-500">
                  Entrées: {totalIncome.toFixed(2)}€ - Dépenses: {totalExpenses.toFixed(2)}€
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Entrées (Revenus) */}
        <Card className="bg-white/50 backdrop-blur-sm border border-white/60 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-blue-50/30 to-indigo-50/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-lg font-bold text-slate-800">Entrées</CardTitle>
                <span className="text-sm text-slate-500">({totalIncome.toFixed(2)}€)</span>
              </div>
              <Button
                onClick={() => setShowIncomeForm(!showIncomeForm)}
                size="sm"
                className="bg-gradient-to-r from-blue-400 to-indigo-400 hover:from-blue-500 hover:to-indigo-500 text-white border-0 shadow-md"
              >
                <Plus className="h-4 w-4 mr-1" />
                Ajouter
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {showIncomeForm && (
              <form onSubmit={handleAddIncome} className="mb-4 p-4 bg-blue-50/50 rounded-xl space-y-3">
                <input
                  type="text"
                  placeholder="Description (ex: Salaire, CAF...)"
                  value={newIncome.description}
                  onChange={(e) => setNewIncome({ ...newIncome, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Montant"
                  value={newIncome.amount}
                  onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
                <div className="flex gap-2">
                  <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">
                    Confirmer
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowIncomeForm(false)
                      setNewIncome({ description: "", amount: "" })
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            )}
            {incomes.length === 0 ? (
              <p className="text-center py-6 text-slate-500">Aucune entrée pour ce mois</p>
            ) : (
              <div className="space-y-2">
                {incomes.map((income) => (
                  <div
                    key={income.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div>
                      <p className="font-medium text-slate-800">{income.description}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(income.date).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-blue-600">+{income.amount.toFixed(2)}€</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteIncome(income.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Catégories de dépenses */}
        <Card className="bg-white/50 backdrop-blur-sm border border-white/60 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-rose-50/30 to-pink-50/30">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-slate-800">Catégories de dépenses</CardTitle>
              <Button
                onClick={() => setShowCategoryForm(!showCategoryForm)}
                size="sm"
                className="bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white border-0 shadow-md"
              >
                <Plus className="h-4 w-4 mr-1" />
                Ajouter
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {showCategoryForm && (
              <form onSubmit={handleAddCategory} className="mb-4 p-4 bg-rose-50/50 rounded-xl space-y-3">
                <input
                  type="text"
                  placeholder="Nom de la catégorie (ex: Alimentation, Santé...)"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  required
                />
                <div className="flex gap-2">
                  <Button type="submit" className="bg-rose-500 hover:bg-rose-600 text-white">
                    Confirmer
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCategoryForm(false)
                      setNewCategory({ name: "", color: "#10b981" })
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            )}
            {categories.length === 0 ? (
              <p className="text-center py-6 text-slate-500">Aucune catégorie pour ce mois</p>
            ) : (
              <div className="space-y-2">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer"
                    onClick={() => router.push(`/budget/${year}/${month}/${category.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shadow-sm"
                        style={{ backgroundColor: category.color || "#10b981" }}
                      >
                        {category.name.charAt(0)}
                      </div>
                      <p className="font-medium text-slate-800">{category.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-slate-800">{category.total.toFixed(2)}€</span>
                      <span className="text-slate-400">→</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
