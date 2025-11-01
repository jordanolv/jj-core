"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Dog, Cat, CalendarDays, User, Phone, MessageCircle, Instagram, Mail, MapPin, Clock, Sparkles, PawPrint } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

interface Garde {
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
  statut: string
  notes?: string
  photos: string[]
  isShared: boolean
  profile: {
    name: string
  }
}

const ContactIcon = ({ type }: { type: string }) => {
  const iconClass = "h-4 w-4"
  switch (type) {
    case "phone":
      return <Phone className={iconClass} />
    case "whatsapp":
      return <MessageCircle className={iconClass} />
    case "instagram":
      return <Instagram className={iconClass} />
    case "email":
      return <Mail className={iconClass} />
    default:
      return <Phone className={iconClass} />
  }
}

const parseContact = (contact: string) => {
  if (!contact) return { type: "phone", value: "" }
  const [type, ...valueParts] = contact.split(":")
  return { type, value: valueParts.join(":") }
}

export default function GardeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [garde, setGarde] = useState<Garde | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGarde = async () => {
      try {
        const response = await fetch(`/api/gardes/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setGarde(data)
        } else {
          console.error("Erreur lors de la récupération de la garde")
        }
      } catch (error) {
        console.error("Erreur:", error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchGarde()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-violet-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    )
  }

  if (!garde) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-violet-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Garde introuvable</h2>
          <Button onClick={() => router.push("/animaux")} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la liste
          </Button>
        </div>
      </div>
    )
  }

  const contact = parseContact(garde.contact || "")
  const statusColors = {
    confirmé: { bg: "bg-green-100", text: "text-green-800", border: "border-green-300" },
    en_cours: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-300" },
    terminé: { bg: "bg-slate-100", text: "text-slate-800", border: "border-slate-300" },
    annulé: { bg: "bg-red-100", text: "text-red-800", border: "border-red-300" }
  }
  const currentStatut = statusColors[garde.statut as keyof typeof statusColors] || statusColors.confirmé

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-violet-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            onClick={() => router.push("/animaux")}
            variant="ghost"
            size="icon"
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2 flex-1">
            {garde.typeAnimal.toLowerCase() === "chien" ? (
              <Dog className="h-5 w-5 text-slate-600" />
            ) : (
              <Cat className="h-5 w-5 text-slate-600" />
            )}
            <h1 className="text-xl font-bold text-slate-800 truncate">{garde.nomAnimal}</h1>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${currentStatut.bg} ${currentStatut.text} border ${currentStatut.border}`}>
            {garde.statut === "confirmé" ? "Confirmé" : garde.statut === "en_cours" ? "En cours" : garde.statut === "terminé" ? "Terminé" : "Annulé"}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Badge créateur */}
        <div className="flex justify-center">
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
            garde.isShared
              ? "bg-gradient-to-r from-purple-400 to-violet-400 text-white"
              : garde.profile.name === "jordan"
                ? "bg-gradient-to-r from-blue-400 to-indigo-400 text-white"
                : "bg-gradient-to-r from-rose-400 to-pink-400 text-white"
          }`}>
            {garde.isShared ? "Garde partagée JJ" : `Garde de ${garde.profile.name === "jordan" ? "Jordan" : "Juliette"}`}
          </span>
        </div>

        {/* Photos */}
        {garde.photos && garde.photos.length > 0 && (
          <Card className="overflow-hidden border-0 shadow-lg">
            <CardContent className="p-0">
              {garde.photos.length === 1 ? (
                <div className="relative w-full h-64 sm:h-96">
                  <Image
                    src={garde.photos[0]}
                    alt={garde.nomAnimal}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 p-2">
                  {garde.photos.map((photo, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                      <Image
                        src={photo}
                        alt={`${garde.nomAnimal} - Photo ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tarif */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-rose-500 to-pink-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                <span className="text-sm font-medium">Tarif de la garde</span>
              </div>
              <div className="text-3xl font-bold">{garde.tarif} €</div>
            </div>
          </CardContent>
        </Card>

        {/* Informations principales */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <PawPrint className="h-5 w-5 text-rose-500" />
              Informations
            </h2>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                {garde.typeAnimal.toLowerCase() === "chien" ? (
                  <Dog className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <Cat className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <p className="text-xs text-slate-500">Type d&apos;animal</p>
                  <p className="text-sm font-medium text-slate-800">{garde.typeAnimal}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-500">Client</p>
                  <p className="text-sm font-medium text-slate-800">{garde.nomClient}</p>
                </div>
              </div>

              {contact.value && (
                <div className="flex items-start gap-3">
                  <ContactIcon type={contact.type} />
                  <div>
                    <p className="text-xs text-slate-500">Contact</p>
                    <p className="text-sm font-medium text-slate-800">{contact.value}</p>
                  </div>
                </div>
              )}

              {garde.source && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Source</p>
                    <p className="text-sm font-medium text-slate-800">{garde.source}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <CalendarDays className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-500">Type de garde</p>
                  <p className="text-sm font-medium text-slate-800">{garde.typeGarde}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dates */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-rose-500" />
              Période
            </h2>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-slate-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-slate-500">Du</p>
                  <p className="text-sm font-medium text-slate-800">
                    {new Date(garde.dateDebut).toLocaleDateString("fr-FR", {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-slate-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-slate-500">Au</p>
                  <p className="text-sm font-medium text-slate-800">
                    {new Date(garde.dateFin).toLocaleDateString("fr-FR", {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {garde.duree && (
                <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">Durée</p>
                  <p className="text-sm font-semibold text-slate-800">{garde.duree}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {garde.notes && (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-3">Notes</h2>
              <p className="text-sm text-slate-600 whitespace-pre-wrap">{garde.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
