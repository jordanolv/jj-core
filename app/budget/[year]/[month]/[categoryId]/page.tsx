"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, ShoppingBag } from "lucide-react"
import Header from "@/components/header"

interface BudgetExpense {
  id: string
  description: string
  amount: number
  date: string
}

interface Category {
  id: string
  name: string
  color: string | null
}

const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
]

export default function CategoryDetailPage() {
  const router = useRouter()
  const params = useParams()
  const year = params.year as string
  const month = parseInt(params.month as string)
  const categoryId = params.categoryId as string
  const [profileId, setProfileId] = useState<string>("")
  const [category, setCategory] = useState<Category | null>(null)
  const [expenses, setExpenses] = useState<BudgetExpense[]>([])
  const [loading, setLoading] = useState(true)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [newExpense, setNewExpense] = useState({ description: "", amount: "" })

  const loadCategoryData = useCallback(async () => {
    try {
      const response = await fetch(`/api/budget/categories/${categoryId}`)
      if (response.ok) {
        const data = await response.json()
        setCategory(data.category)
        setExpenses(data.expenses)
      }
    } catch (error) {
      console.error("Error loading category data:", error)
    } finally {
      setLoading(false)
    }
  }, [categoryId])

  useEffect(() => {
    const initializeProfile = async (profileName: string) => {
      try {
        await fetch("/api/init", { method: "POST" })
        const profilesRes = await fetch("/api/profiles")
        const profilesList = await profilesRes.json()
        const currentProfile = profilesList.find((p: { name: string; id: string }) => p.name === profileName)

        if (currentProfile) {
          setProfileId(currentProfile.id)
          loadCategoryData()
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
  }, [router, loadCategoryData])

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newExpense.description || !newExpense.amount) return

    try {
      const response = await fetch(`/api/budget/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: newExpense.description,
          amount: parseFloat(newExpense.amount),
          categoryId,
          profileId,
          date: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        setNewExpense({ description: "", amount: "" })
        setShowExpenseForm(false)
        loadCategoryData()
      }
    } catch (error) {
      console.error("Error adding expense:", error)
    }
  }

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm("Supprimer cette dépense ?")) return

    try {
      const response = await fetch(`/api/budget/expenses/${expenseId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        loadCategoryData()
      }
    } catch (error) {
      console.error("Error deleting expense:", error)
    }
  }

  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-100 via-rose-50 to-blue-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-rose-400"></div>
          <p className="mt-4 text-slate-700">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-100 via-rose-50 to-blue-50">
        <p className="text-slate-700">Catégorie non trouvée</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-rose-50 to-blue-50">
      <Header
        profile={profileId}
        title={category.name}
        description={`${MONTH_NAMES[month - 1]} ${year}`}
        showBack={true}
        backHref={`/budget/${year}/${month}`}
        actions={
          <Button
            onClick={() => setShowExpenseForm(!showExpenseForm)}
            className="bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white border-0 shadow-md mr-2"
          >
            <Plus className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="sm:hidden">New</span>
            <span className="hidden sm:inline">Nouvelle dépense</span>
          </Button>
        }
      />

      <main className="container mx-auto px-4 py-8 relative z-10 space-y-6">
        {/* Total de la catégorie */}
        <Card className="relative bg-white/50 backdrop-blur-sm border border-white/60 shadow-lg rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-400/10 to-pink-400/10 opacity-50"></div>
          <CardHeader className="relative">
            <CardTitle className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-2">Total</CardTitle>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md text-white font-bold text-xl"
                style={{ backgroundColor: category.color || "#10b981" }}
              >
                {category.name.charAt(0)}
              </div>
              <div className="text-3xl font-bold text-slate-800">
                {total.toFixed(2)} €
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Formulaire d'ajout de dépense */}
        {showExpenseForm && (
          <Card className="bg-white/50 backdrop-blur-sm border border-white/60 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-4">
              <form onSubmit={handleAddExpense} className="space-y-3">
                <input
                  type="text"
                  placeholder="Description de la dépense"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  required
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Montant"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
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
                      setShowExpenseForm(false)
                      setNewExpense({ description: "", amount: "" })
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Liste des dépenses */}
        <Card className="bg-white/50 backdrop-blur-sm border border-white/60 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-rose-50/30 to-pink-50/30">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-rose-500" />
              <CardTitle className="text-lg font-bold text-slate-800">Dépenses</CardTitle>
              <span className="text-sm text-slate-500">({expenses.length})</span>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {expenses.length === 0 ? (
              <div className="text-center py-12">
                <div className="relative inline-block mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center mx-auto">
                    <ShoppingBag className="h-8 w-8 text-rose-500" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Aucune dépense</h3>
                <p className="text-sm text-slate-500 mb-4">Commencez par ajouter votre première dépense</p>
                <Button
                  className="bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white border-0 shadow-md"
                  onClick={() => setShowExpenseForm(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter une dépense
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div>
                      <p className="font-medium text-slate-800">{expense.description}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(expense.date).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-slate-800">{expense.amount.toFixed(2)}€</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteExpense(expense.id)}
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
      </main>
    </div>
  )
}
