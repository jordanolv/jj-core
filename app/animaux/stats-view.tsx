"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  LineChart, 
  Line, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts"
import { TrendingUp, DollarSign, Filter } from "lucide-react"

interface GardeAnimaux {
  id: string
  typeAnimal: string
  nomAnimal: string
  nomClient: string
  contact?: string
  source?: string
  dateDebut: string
  dateFin: string
  duree?: string
  tarif: number
  typeGarde: string
  statut: "confirmé" | "en_cours" | "terminé" | "annulé"
  photos: string[]
  notes?: string
  isShared: boolean
  profile: {
    id: string
    name: string
  }
}

interface StatsViewProps {
  gardes: GardeAnimaux[]
}

const COLORS = {
  Rover: "#FF6B6B",
  Animaute: "#4ECDC4",
  Facebook: "#4267B2",
  Instagram: "#E1306C",
  Autre: "#95A5A6",
  Chien: "#F39C12",
  Chat: "#9B59B6",
  confirmé: "#3498DB",
  terminé: "#2ECC71",
  annulé: "#E74C3C",
}

export function StatsView({ gardes }: StatsViewProps) {
  const [filterYear, setFilterYear] = useState<number | "all">("all")
  const [filterSource, setFilterSource] = useState<string | "all">("all")
  const [filterAnimal, setFilterAnimal] = useState<string | "all">("all")

  // Filtrer les gardes
  const filteredGardes = useMemo(() => {
    return gardes.filter((garde) => {
      const year = new Date(garde.dateDebut).getFullYear()
      const matchYear = filterYear === "all" || year === filterYear
      const matchSource = filterSource === "all" || garde.source === filterSource
      const matchAnimal = filterAnimal === "all" || garde.typeAnimal === filterAnimal
      return matchYear && matchSource && matchAnimal
    })
  }, [gardes, filterYear, filterSource, filterAnimal])

  // Années disponibles
  const availableYears = useMemo(() => {
    const years = new Set(gardes.map((g) => new Date(g.dateDebut).getFullYear()))
    return Array.from(years).sort((a, b) => b - a)
  }, [gardes])

  // Stats par source
  const sourceStats = useMemo(() => {
    const stats: Record<string, number> = {}
    filteredGardes.forEach((garde) => {
      const source = garde.source || "Non renseigné"
      stats[source] = (stats[source] || 0) + 1
    })
    return Object.entries(stats).map(([name, value]) => ({ name, value }))
  }, [filteredGardes])

  // Revenus par source
  const revenueBySource = useMemo(() => {
    const stats: Record<string, number> = {}
    filteredGardes
      .filter((g) => g.statut === "terminé")
      .forEach((garde) => {
        const source = garde.source || "Non renseigné"
        stats[source] = (stats[source] || 0) + garde.tarif
      })
    return Object.entries(stats)
      .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
      .sort((a, b) => b.value - a.value)
  }, [filteredGardes])

  // Stats par type d'animal
  const animalStats = useMemo(() => {
    const stats: Record<string, number> = {}
    filteredGardes.forEach((garde) => {
      stats[garde.typeAnimal] = (stats[garde.typeAnimal] || 0) + 1
    })
    return Object.entries(stats).map(([name, value]) => ({ name, value }))
  }, [filteredGardes])

  // Stats par statut
  const statutStats = useMemo(() => {
    const stats: Record<string, number> = {}
    filteredGardes.forEach((garde) => {
      stats[garde.statut] = (stats[garde.statut] || 0) + 1
    })
    return Object.entries(stats).map(([name, value]) => ({ name, value }))
  }, [filteredGardes])

  // Évolution des revenus par mois
  const monthlyRevenue = useMemo(() => {
    const stats: Record<string, number> = {}
    filteredGardes
      .filter((g) => g.statut === "terminé")
      .forEach((garde) => {
        const date = new Date(garde.dateDebut)
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
        stats[key] = (stats[key] || 0) + garde.tarif
      })
    return Object.entries(stats)
      .map(([month, value]) => ({ month, value: Math.round(value * 100) / 100 }))
      .sort((a, b) => a.month.localeCompare(b.month))
  }, [filteredGardes])

  // Stats par type de garde
  const typeGardeStats = useMemo(() => {
    const stats: Record<string, number> = {}
    filteredGardes.forEach((garde) => {
      stats[garde.typeGarde] = (stats[garde.typeGarde] || 0) + 1
    })
    return Object.entries(stats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [filteredGardes])

  // Stats globales - supprimées car déjà présentes dans la page principale

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <Card className="bg-white/50 backdrop-blur-sm border border-white/60 shadow-lg rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-rose-50/30 to-blue-50/30">
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Filter className="h-5 w-5 text-rose-500" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4">
            {/* Filtre année */}
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-2 block uppercase">Année</label>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value === "all" ? "all" : parseInt(e.target.value))}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
              >
                <option value="all">Toutes</option>
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtre source */}
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-2 block uppercase">Source</label>
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
              >
                <option value="all">Toutes</option>
                <option value="Rover">🐕 Rover</option>
                <option value="Animaute">🐾 Animaute</option>
                <option value="Facebook">👥 Facebook</option>
                <option value="Instagram">📷 Instagram</option>
                <option value="Autre">📝 Autre</option>
              </select>
            </div>

            {/* Filtre animal */}
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-2 block uppercase">Type d&apos;animal</label>
              <select
                value={filterAnimal}
                onChange={(e) => setFilterAnimal(e.target.value)}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
              >
                <option value="all">Tous</option>
                <option value="Chien">🐕 Chien</option>
                <option value="Chat">🐱 Chat</option>
              </select>
            </div>

            {/* Reset */}
            {(filterYear !== "all" || filterSource !== "all" || filterAnimal !== "all") && (
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilterYear("all")
                    setFilterSource("all")
                    setFilterAnimal("all")
                  }}
                  className="text-sm"
                >
                  Réinitialiser
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gardes par source */}
        <Card className="bg-white/50 backdrop-blur-sm border border-white/60 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-rose-50/30 to-blue-50/30">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-rose-500" />
              Gardes par plateforme
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sourceStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sourceStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.Autre} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenus par source */}
        <Card className="bg-white/50 backdrop-blur-sm border border-white/60 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-rose-50/30 to-blue-50/30">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-500" />
              Revenus par plateforme
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueBySource}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `${value} €`} />
                <Bar dataKey="value" fill="#10B981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Type d'animal */}
        <Card className="bg-white/50 backdrop-blur-sm border border-white/60 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-rose-50/30 to-blue-50/30">
            <CardTitle className="text-lg font-bold text-slate-800">
              Gardes par type d&apos;animal
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={animalStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {animalStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.Autre} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Statut des gardes */}
        <Card className="bg-white/50 backdrop-blur-sm border border-white/60 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-rose-50/30 to-blue-50/30">
            <CardTitle className="text-lg font-bold text-slate-800">
              Statut des gardes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statutStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]}>
                  {statutStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.confirmé} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Évolution mensuelle des revenus */}
        {monthlyRevenue.length > 0 && (
          <Card className="bg-white/50 backdrop-blur-sm border border-white/60 shadow-lg rounded-2xl overflow-hidden lg:col-span-2">
            <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-rose-50/30 to-blue-50/30">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                Évolution des revenus mensuels
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value} €`} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    name="Revenu (€)"
                    dot={{ fill: '#10B981', r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Type de garde */}
        <Card className="bg-white/50 backdrop-blur-sm border border-white/60 shadow-lg rounded-2xl overflow-hidden lg:col-span-2">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-rose-50/30 to-blue-50/30">
            <CardTitle className="text-lg font-bold text-slate-800">
              Gardes par type de prestation
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={typeGardeStats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip />
                <Bar dataKey="value" fill="#EC4899" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

