"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Calendar, DollarSign, PawPrint, CalendarDays, List, Edit2 } from "lucide-react"
import { GardeForm } from "./garde-form"
import { CalendarView } from "./calendar-view"
import Image from "next/image"
import Header from "@/components/header"

interface GardeAnimaux {
  id: string
  typeAnimal: string
  nomAnimal: string
  nomClient: string
  contact?: string
  source?: string
  dateDebut: string
  dateFin: string
  tarif: number
  typeGarde: string
  statut: "confirmé" | "terminé" | "annulé"
  photos: string[]
  notes?: string
  isShared: boolean
  profile: {
    id: string
    name: string
  }
}

export default function AnimauxPage() {
  const router = useRouter()
  const [profileId, setProfileId] = useState<string>("")
  const [gardes, setGardes] = useState<GardeAnimaux[]>([])
  const [showForm, setShowForm] = useState(false)
  const [selectedGarde, setSelectedGarde] = useState<GardeAnimaux | null>(null)
  const [filter] = useState<"tous" | "confirmé" | "terminé">("tous")
  const [filterJordan, setFilterJordan] = useState<boolean>(false)
  const [filterJuliette, setFilterJuliette] = useState<boolean>(false)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list")

  const loadGardes = async (showJordan: boolean, showJuliette: boolean) => {
    try {
      // Aucun filtre = uniquement les gardes communes
      // Jordan coché = gardes de Jordan + communes
      // Juliette coché = gardes de Juliette + communes
      // Les deux cochés = toutes les gardes
      const params = new URLSearchParams()
      if (showJordan) params.append('jordan', 'true')
      if (showJuliette) params.append('juliette', 'true')
      
      const url = `/api/gardes${params.toString() ? '?' + params.toString() : ''}`
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setGardes(data)
      }
    } catch (error) {
      console.error("Error loading gardes:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const initializeProfile = async (profileName: string) => {
      try {
        await fetch("/api/init", { method: "POST" })
        const profilesRes = await fetch("/api/profiles")
        const profilesList = await profilesRes.json()
        const currentProfile = profilesList.find((p: { name: string; id: string }) => p.name === profileName)
        
        if (currentProfile) {
          setProfileId(currentProfile.id)
          loadGardes(false, false) // Par défaut, uniquement les gardes communes
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

  // Recharger les gardes quand les filtres changent
  useEffect(() => {
    if (profileId) {
      loadGardes(filterJordan, filterJuliette)
    }
  }, [filterJordan, filterJuliette, profileId])

  const handleGardeCreated = () => {
    loadGardes(filterJordan, filterJuliette)
    setSelectedGarde(null)
  }

  const handleEditGarde = (garde: GardeAnimaux) => {
    setSelectedGarde(garde)
    setShowForm(true)
  }

  const handleNewGarde = () => {
    setSelectedGarde(null)
    setShowForm(true)
  }

  const handleCloseForm = (open: boolean) => {
    setShowForm(open)
    if (!open) {
      setSelectedGarde(null)
    }
  }

  const handleStatusChange = async (gardeId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/gardes/${gardeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut: newStatus }),
      })

      if (response.ok) {
        loadGardes(filterJordan, filterJuliette)
      } else {
        alert("Erreur lors de la mise à jour du statut")
      }
    } catch (error) {
      console.error("Error updating status:", error)
      alert("Erreur lors de la mise à jour du statut")
    }
  }

  const filteredGardes = filter === "tous" ? gardes : gardes.filter((g) => g.statut === filter)
  const totalRevenu = gardes.filter((g) => g.statut === "terminé").reduce((sum, g) => sum + g.tarif, 0)

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-rose-50 to-blue-50">
      <Header 
        profile={profileId}
        title="Animaux"
        description="Gérez vos gardes d'animaux"
        showBack={true}
        actions={
          <Button onClick={handleNewGarde} className="bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white border-0 shadow-md mr-2">
            <Plus className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="sm:hidden">New</span>
            <span className="hidden sm:inline">Nouvelle garde</span>
          </Button>
        }
      />

      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Filtre par créateur */}
        <div className="mb-6 flex justify-end">
          <div className="inline-flex gap-1 rounded-lg border border-slate-200 bg-white/50 backdrop-blur-sm p-1 shadow-sm">
            <label className="cursor-pointer">
              <input
                type="checkbox"
                checked={filterJordan}
                onChange={(e) => setFilterJordan(e.target.checked)}
                className="hidden"
              />
              <span className={`block px-4 py-2 text-sm font-medium rounded-md transition-all ${
                filterJordan
                  ? "bg-gradient-to-r from-blue-400 to-indigo-400 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-800"
              }`}>
                Jordan
              </span>
            </label>
            <label className="cursor-pointer">
              <input
                type="checkbox"
                checked={filterJuliette}
                onChange={(e) => setFilterJuliette(e.target.checked)}
                className="hidden"
              />
              <span className={`block px-4 py-2 text-sm font-medium rounded-md transition-all ${
                filterJuliette
                  ? "bg-gradient-to-r from-rose-400 to-pink-400 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-800"
              }`}>
                Juliette
              </span>
            </label>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="relative bg-white/50 backdrop-blur-sm border border-white/60 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 rounded-2xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 opacity-50 group-hover:opacity-70 transition-opacity"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Revenu total</CardTitle>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold text-emerald-900">{totalRevenu.toFixed(2)} €</div>
              <p className="text-xs text-emerald-600 mt-1">
                {gardes.filter((g) => g.statut === "terminé").length} gardes terminées
              </p>
            </CardContent>
          </Card>

          <Card className="relative bg-white/50 backdrop-blur-sm border border-white/60 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 rounded-2xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 opacity-50 group-hover:opacity-70 transition-opacity"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Gardes à venir</CardTitle>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <Calendar className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold text-blue-900">
                {gardes.filter((g) => g.statut === "confirmé").length}
              </div>
              <p className="text-xs text-blue-600 mt-1">confirmées</p>
            </CardContent>
          </Card>

          <Card className="relative bg-white/50 backdrop-blur-sm border border-white/60 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 rounded-2xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-400/10 to-pink-400/10 opacity-50 group-hover:opacity-70 transition-opacity"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold text-rose-700 uppercase tracking-wide">Total gardes</CardTitle>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <PawPrint className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold text-rose-900">{gardes.length}</div>
              <p className="text-xs text-rose-600 mt-1">toutes périodes</p>
            </CardContent>
          </Card>
        </div>

        {/* Boutons de vue */}
        <div className="flex gap-2 mb-6 bg-white/50 backdrop-blur-sm p-1.5 rounded-xl border border-white/60 shadow-md w-fit">
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            onClick={() => setViewMode("list")}
            size="sm"
            className={viewMode === "list" 
              ? "bg-gradient-to-r from-rose-400 to-pink-400 text-white border-0 shadow-md hover:from-rose-500 hover:to-pink-500 rounded-lg" 
              : "text-slate-600 hover:bg-white/60 rounded-lg"}
          >
            <List className="mr-1.5 h-3.5 w-3.5" />
            Liste
          </Button>
          <Button
            variant={viewMode === "calendar" ? "default" : "ghost"}
            onClick={() => setViewMode("calendar")}
            size="sm"
            className={viewMode === "calendar" 
              ? "bg-gradient-to-r from-rose-400 to-pink-400 text-white border-0 shadow-md hover:from-rose-500 hover:to-pink-500 rounded-lg" 
              : "text-slate-600 hover:bg-white/60 rounded-lg"}
          >
            <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
            Calendrier
          </Button>
        </div>

        {viewMode === "calendar" ? (
          <CalendarView gardes={gardes} />
        ) : (
          <Card className="bg-white/50 backdrop-blur-sm border border-white/60 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-rose-50/30 to-blue-50/30">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <PawPrint className="h-5 w-5 text-rose-500" />
                Liste des gardes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {filteredGardes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="relative inline-block mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center mx-auto">
                      <PawPrint className="h-8 w-8 text-rose-500" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Aucune garde pour le moment</h3>
                  <p className="text-sm text-slate-500 mb-4">Commencez par créer votre première garde d&apos;animaux</p>
                  <Button 
                    className="bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white border-0 shadow-md" 
                    onClick={handleNewGarde}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Créer votre première garde
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredGardes.map((garde) => {
                    const statutStyles: Record<string, { bg: string; text: string }> = {
                      confirmé: {
                        bg: "bg-gradient-to-r from-blue-500 to-indigo-500",
                        text: "text-white"
                      },
                      en_cours: {
                        bg: "bg-gradient-to-r from-amber-500 to-orange-500",
                        text: "text-white"
                      },
                      terminé: {
                        bg: "bg-gradient-to-r from-emerald-500 to-teal-500",
                        text: "text-white"
                      },
                      annulé: {
                        bg: "bg-gradient-to-r from-red-500 to-rose-500",
                        text: "text-white"
                      },
                    }

                    const currentStatut = statutStyles[garde.statut] || statutStyles.confirmé

                    return (
                      <div key={garde.id} className="relative bg-white/50 backdrop-blur-sm border border-white/60 rounded-2xl shadow-md overflow-hidden">
                        {/* Badge créateur uniquement pour les gardes personnelles */}
                        {!garde.isShared && (
                          <div className="absolute top-3 left-3 z-10 flex gap-1">
                            <span className={`px-2 py-1 rounded-md text-[10px] font-semibold shadow-sm ${
                              garde.profile.name === "jordan" 
                                ? "bg-gradient-to-r from-blue-400 to-indigo-400 text-white"
                                : "bg-gradient-to-r from-rose-400 to-pink-400 text-white"
                            }`}>
                              {garde.profile.name === "jordan" ? "Jordan" : "Juliette"}
                            </span>
                          </div>
                        )}

                        {/* Icône Edit en haut à droite */}
                        <button
                          onClick={() => handleEditGarde(garde)}
                          className="absolute top-3 right-3 z-10 p-0 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600" />
                        </button>

                        <div className="relative flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4">
                          {/* Layout mobile: Photo + Titre + Prix sur la première ligne */}
                          <div className="flex items-center gap-3 sm:contents">
                            {/* Miniature de la première photo */}
                            {garde.photos && garde.photos.length > 0 ? (
                              <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-xl overflow-hidden ring-2 ring-white shadow-md">
                                <Image
                                  src={garde.photos[0]}
                                  alt={garde.nomAnimal}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center ring-2 ring-white shadow-md">
                                <PawPrint className="h-6 w-6 sm:h-8 sm:w-8 text-rose-500" />
                              </div>
                            )}

                            {/* Prix visible uniquement sur mobile */}
                            <div className="sm:hidden text-right ml-auto">
                              <p className="text-xl font-bold text-slate-800">
                                {garde.tarif} €
                              </p>
                            </div>
                          </div>

                          {/* Informations animal, client et dates */}
                          <div className="flex-1 min-w-0 space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500">Type:</span>
                              <span className="text-sm font-medium text-slate-700 truncate">{garde.typeAnimal}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500">Nom:</span>
                              <span className="text-sm font-medium text-slate-700 truncate">{garde.nomAnimal}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500">Client:</span>
                              <span className="text-sm font-medium text-slate-700 truncate">{garde.nomClient}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <CalendarDays className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                              <span className="truncate">
                                {new Date(garde.dateDebut).toLocaleDateString("fr-FR")} → {new Date(garde.dateFin).toLocaleDateString("fr-FR")}
                              </span>
                            </div>
                          </div>
                          
                          {/* Prix et statut (desktop) */}
                          <div className="hidden sm:flex sm:flex-col items-center sm:items-end gap-2 mt-auto">
                            {/* Prix visible uniquement sur desktop */}
                            <div className="text-right">
                              <p className="text-2xl font-bold text-slate-800">
                                {garde.tarif} €
                              </p>
                            </div>
                            <select
                              value={garde.statut}
                              onChange={(e) => handleStatusChange(garde.id, e.target.value)}
                              className={`${currentStatut.bg} ${currentStatut.text} px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shadow-md hover:shadow-lg transition-all border-0`}
                            >
                              <option value="confirmé">Confirmé</option>
                              <option value="en_cours">En cours</option>
                              <option value="terminé">Terminé</option>
                              <option value="annulé">Annulé</option>
                            </select>
                          </div>

                          {/* Statut (mobile) */}
                          <div className="sm:hidden w-full">
                            <select
                              value={garde.statut}
                              onChange={(e) => handleStatusChange(garde.id, e.target.value)}
                              className={`${currentStatut.bg} ${currentStatut.text} px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shadow-md hover:shadow-lg transition-all border-0 w-full`}
                            >
                              <option value="confirmé">Confirmé</option>
                              <option value="en_cours">En cours</option>
                              <option value="terminé">Terminé</option>
                              <option value="annulé">Annulé</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      <GardeForm 
        open={showForm} 
        onOpenChange={handleCloseForm} 
        onSuccess={handleGardeCreated} 
        profileId={profileId}
        garde={selectedGarde}
      />
    </div>
  )
}
