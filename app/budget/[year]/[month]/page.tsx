"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, TrendingUp, TrendingDown, Euro, ChevronDown, ChevronUp, Edit2, Trash2, Check, X, ShoppingCart } from "lucide-react"
import Header from "@/components/header"

interface BudgetIncome {
  id: string
  description: string
  amount: number
  date: string
}

interface BudgetExpense {
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
  const [newCategory, setNewCategory] = useState({ name: "", color: "#10b981", icon: "📁" })

  // États pour l'accordéon
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null)
  const [categoryExpenses, setCategoryExpenses] = useState<Record<string, BudgetExpense[]>>({})
  const [loadingExpenses, setLoadingExpenses] = useState<Record<string, boolean>>({})

  // États pour les dépenses
  const [showExpenseForm, setShowExpenseForm] = useState<string | null>(null)
  const [newExpense, setNewExpense] = useState({ description: "", amount: "" })
  const [editingExpense, setEditingExpense] = useState<{ id: string; description: string; amount: string } | null>(null)

  // États pour l'édition des revenus
  const [editingIncome, setEditingIncome] = useState<{ id: string; description: string; amount: string } | null>(null)

  // États pour les accordéons des sections principales
  const [isRevenusOpen, setIsRevenusOpen] = useState(false)
  const [isDepensesOpen, setIsDepensesOpen] = useState(false)

  const loadMonthData = useCallback(async (pid?: string) => {
    const id = pid || profileId
    if (!id) return

    try {
      const response = await fetch(`/api/budget/years/${year}/months/${month}?profileId=${id}`)
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
  }, [year, month, profileId])

  useEffect(() => {
    const initializeProfile = async (profileName: string) => {
      try {
        await fetch("/api/init", { method: "POST" })
        const profilesRes = await fetch("/api/profiles")
        const profilesList = await profilesRes.json()
        const currentProfile = profilesList.find((p: { name: string; id: string }) => p.name === profileName)

        if (currentProfile) {
          setProfileId(currentProfile.id)
          loadMonthData(currentProfile.id)
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
  }, [router, loadMonthData])

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
        setIsRevenusOpen(true) // Ouvrir la section après ajout
        loadMonthData(profileId)
      }
    } catch (error) {
      console.error("Error adding income:", error)
    }
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategory.name) return

    try {
      // Créer la catégorie pour ce mois
      const response = await fetch(`/api/budget/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCategory.name,
          color: newCategory.color,
          icon: newCategory.icon,
          monthId,
        }),
      })

      if (response.ok) {
        setNewCategory({ name: "", color: "#10b981", icon: "📁" })
        setShowCategoryForm(false)
        loadMonthData(profileId)
      }
    } catch (error) {
      console.error("Error adding category:", error)
    }
  }

  const handleUpdateIncome = async () => {
    if (!editingIncome) return

    try {
      const response = await fetch(`/api/budget/incomes/${editingIncome.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: editingIncome.description,
          amount: parseFloat(editingIncome.amount),
        }),
      })

      if (response.ok) {
        setEditingIncome(null)
        loadMonthData(profileId)
      }
    } catch (error) {
      console.error("Error updating income:", error)
    }
  }

  const handleDeleteIncome = async (incomeId: string) => {
    if (!confirm("Supprimer cette entrée ?")) return

    try {
      const response = await fetch(`/api/budget/incomes/${incomeId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        loadMonthData(profileId)
      }
    } catch (error) {
      console.error("Error deleting income:", error)
    }
  }

  // Charger les dépenses d'une catégorie
  const loadCategoryExpenses = async (categoryId: string, forceReload = false) => {
    if (categoryExpenses[categoryId] && !forceReload) return // Déjà chargées

    setLoadingExpenses(prev => ({ ...prev, [categoryId]: true }))
    try {
      const response = await fetch(`/api/budget/categories/${categoryId}`)
      if (response.ok) {
        const data = await response.json()
        setCategoryExpenses(prev => ({
          ...prev,
          [categoryId]: data.expenses
        }))
      }
    } catch (error) {
      console.error("Error loading expenses:", error)
    } finally {
      setLoadingExpenses(prev => ({ ...prev, [categoryId]: false }))
    }
  }

  // Toggle accordéon
  const handleToggleCategory = (categoryId: string) => {
    if (openCategoryId === categoryId) {
      setOpenCategoryId(null)
    } else {
      setOpenCategoryId(categoryId)
      loadCategoryExpenses(categoryId)
    }
  }

  // Ajouter une dépense
  const handleAddExpense = async (categoryId: string) => {
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
        setShowExpenseForm(null)
        setIsDepensesOpen(true) // Ouvrir la section après ajout
        loadCategoryExpenses(categoryId, true) // Force reload
        loadMonthData(profileId) // Recharger pour mettre à jour le total
      }
    } catch (error) {
      console.error("Error adding expense:", error)
    }
  }

  // Éditer une dépense
  const handleUpdateExpense = async (categoryId: string) => {
    if (!editingExpense) return

    try {
      const response = await fetch(`/api/budget/expenses/${editingExpense.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: editingExpense.description,
          amount: parseFloat(editingExpense.amount),
        }),
      })

      if (response.ok) {
        setEditingExpense(null)
        loadCategoryExpenses(categoryId, true) // Force reload
        loadMonthData(profileId)
      }
    } catch (error) {
      console.error("Error updating expense:", error)
    }
  }

  // Supprimer une dépense
  const handleDeleteExpense = async (expenseId: string, categoryId: string) => {
    if (!confirm("Supprimer cette dépense ?")) return

    try {
      const response = await fetch(`/api/budget/expenses/${expenseId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        loadCategoryExpenses(categoryId, true) // Force reload
        loadMonthData(profileId)
      }
    } catch (error) {
      console.error("Error deleting expense:", error)
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
                <div className="text-sm text-slate-500">
                  <p>Revenus: {totalIncome.toFixed(2)}€</p>
                  <p>Dépenses: {totalExpenses.toFixed(2)}€</p>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Revenus */}
        <Card className="bg-white/50 backdrop-blur-sm border border-white/60 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader
            className="border-b border-slate-100 bg-gradient-to-r from-blue-50/30 to-indigo-50/30 cursor-pointer hover:bg-blue-50/50 transition-colors"
            onClick={() => setIsRevenusOpen(!isRevenusOpen)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Euro className="h-5 w-5 text-blue-500" />
                <div className="flex flex-col">
                  <CardTitle className="text-lg font-bold text-slate-800">Revenus</CardTitle>
                  <span className="text-sm text-slate-500">({totalIncome.toFixed(2)}€)</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowIncomeForm(!showIncomeForm)
                    setIsRevenusOpen(true)
                  }}
                  size="sm"
                  className="bg-gradient-to-r from-blue-400 to-indigo-400 hover:from-blue-500 hover:to-indigo-500 text-white border-0 shadow-md"
                >
                  <Plus className="h-4 w-4 mr-0.5" />
                  Ajouter
                </Button>
                {isRevenusOpen ? (
                  <ChevronUp className="h-5 w-5 text-slate-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                )}
              </div>
            </div>
          </CardHeader>
          {isRevenusOpen && (
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
                  <div key={income.id}>
                    {editingIncome?.id === income.id ? (
                      // Mode édition
                      <div className="p-3 bg-white rounded-lg border-2 border-blue-200 shadow-sm space-y-2">
                        <input
                          type="text"
                          value={editingIncome.description}
                          onChange={(e) => setEditingIncome({ ...editingIncome, description: e.target.value })}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <input
                          type="number"
                          step="0.01"
                          value={editingIncome.amount}
                          onChange={(e) => setEditingIncome({ ...editingIncome, amount: e.target.value })}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleUpdateIncome}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Valider
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingIncome(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // Mode affichage
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <div>
                          <p className="font-medium text-slate-800">{income.description}</p>
                          <p className="text-xs text-slate-500">
                            {new Date(income.date).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-blue-600">+{income.amount.toFixed(2)}€</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingIncome({
                              id: income.id,
                              description: income.description,
                              amount: income.amount.toString()
                            })}
                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-1"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteIncome(income.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            </CardContent>
          )}
        </Card>

        {/* Dépenses */}
        <Card className="bg-white/50 backdrop-blur-sm border border-white/60 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader
            className="border-b border-slate-100 bg-gradient-to-r from-rose-50/30 to-pink-50/30 cursor-pointer hover:bg-rose-50/50 transition-colors"
            onClick={() => setIsDepensesOpen(!isDepensesOpen)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-rose-500" />
                <div className="flex flex-col">
                  <CardTitle className="text-lg font-bold text-slate-800">Dépenses</CardTitle>
                  <span className="text-sm text-slate-500">({totalExpenses.toFixed(2)}€)</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowCategoryForm(!showCategoryForm)
                    setIsDepensesOpen(true)
                  }}
                  size="sm"
                  className="bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white border-0 shadow-md"
                >
                  <Plus className="h-4 w-4 mr-0.5" />
                  Ajouter
                </Button>
                {isDepensesOpen ? (
                  <ChevronUp className="h-5 w-5 text-slate-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                )}
              </div>
            </div>
          </CardHeader>
          {isDepensesOpen && (
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
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Icône (emoji)</label>
                    <input
                      type="text"
                      placeholder="📁"
                      value={newCategory.icon}
                      onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-center text-2xl"
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
                  <Button type="submit" className="bg-rose-500 hover:bg-rose-600 text-white">
                    Confirmer
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCategoryForm(false)
                      setNewCategory({ name: "", color: "#10b981", icon: "📁" })
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
                  <div key={category.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {/* En-tête de la catégorie */}
                    <div
                      className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => handleToggleCategory(category.id)}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shadow-sm text-xl"
                          style={{ backgroundColor: category.color || "#10b981" }}
                        >
                          {category.icon || category.name.charAt(0)}
                        </div>
                        <p className="font-medium text-slate-800">{category.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-slate-800">{category.total.toFixed(2)}€</span>
                        {openCategoryId === category.id ? (
                          <ChevronUp className="h-5 w-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Contenu accordéon - Liste des dépenses */}
                    {openCategoryId === category.id && (
                      <div className="border-t border-slate-100 p-3 bg-slate-50/50 space-y-2">
                        {loadingExpenses[category.id] ? (
                          <div className="text-center py-4">
                            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-rose-400"></div>
                          </div>
                        ) : (
                          <>
                            {/* Bouton ajouter une dépense */}
                            {showExpenseForm !== category.id && (
                              <Button
                                onClick={() => setShowExpenseForm(category.id)}
                                size="sm"
                                variant="outline"
                                className="w-full border-dashed"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Ajouter une dépense
                              </Button>
                            )}

                            {/* Formulaire d'ajout */}
                            {showExpenseForm === category.id && (
                              <div className="p-3 bg-white rounded-lg border-2 border-rose-200 space-y-2">
                                <input
                                  type="text"
                                  placeholder="Description"
                                  value={newExpense.description}
                                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                                />
                                <input
                                  type="number"
                                  step="0.01"
                                  placeholder="Montant"
                                  value={newExpense.amount}
                                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                                />
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleAddExpense(category.id)}
                                    className="flex-1 bg-rose-500 hover:bg-rose-600 text-white"
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Valider
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setShowExpenseForm(null)
                                      setNewExpense({ description: "", amount: "" })
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            )}

                            {/* Liste des dépenses */}
                            {categoryExpenses[category.id]?.length === 0 ? (
                              <p className="text-center py-4 text-sm text-slate-500">Aucune dépense</p>
                            ) : (
                              <div className="space-y-2">
                                {categoryExpenses[category.id]?.map((expense) => (
                                  <div key={expense.id}>
                                    {editingExpense?.id === expense.id ? (
                                      // Mode édition
                                      <div className="p-3 bg-white rounded-lg border-2 border-blue-200 space-y-2">
                                        <input
                                          type="text"
                                          value={editingExpense.description}
                                          onChange={(e) => setEditingExpense({ ...editingExpense, description: e.target.value })}
                                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        />
                                        <input
                                          type="number"
                                          step="0.01"
                                          value={editingExpense.amount}
                                          onChange={(e) => setEditingExpense({ ...editingExpense, amount: e.target.value })}
                                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        />
                                        <div className="flex gap-2">
                                          <Button
                                            size="sm"
                                            onClick={() => handleUpdateExpense(category.id)}
                                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                                          >
                                            <Check className="h-4 w-4 mr-1" />
                                            Valider
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setEditingExpense(null)}
                                          >
                                            <X className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      // Mode affichage
                                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                                        <div className="flex-1">
                                          <p className="text-sm font-medium text-slate-800">{expense.description}</p>
                                          <p className="text-xs text-slate-500">
                                            {new Date(expense.date).toLocaleDateString("fr-FR")}
                                          </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-base font-bold text-slate-800">{expense.amount.toFixed(2)}€</span>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setEditingExpense({
                                              id: expense.id,
                                              description: expense.description,
                                              amount: expense.amount.toString()
                                            })}
                                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-1"
                                          >
                                            <Edit2 className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteExpense(expense.id, category.id)}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            </CardContent>
          )}
        </Card>
      </main>
    </div>
  )
}
