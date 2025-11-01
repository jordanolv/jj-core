"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImagePlus, X, Phone, MessageCircle, Instagram, Mail, ArrowLeft } from "lucide-react"
import Image from "next/image"

interface MobileGardeFormProps {
  profileId: string
  garde?: {
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
    photos: string[]
    notes?: string
    isShared?: boolean
  } | null
  onCancel: () => void
  onSuccess: () => void
}

// Parse contact field: "type:value" format
const parseContact = (contact: string) => {
  if (!contact) return { type: "phone", value: "" }
  const [type, ...valueParts] = contact.split(":")
  return { type, value: valueParts.join(":") }
}

// Contact type icon component
const ContactIcon = ({ type }: { type: string }) => {
  const iconClass = "h-5 w-5"
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

export function MobileGardeForm({ profileId, garde, onCancel, onSuccess }: MobileGardeFormProps) {
  const [loading, setLoading] = useState(false)
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [photos, setPhotos] = useState<string[]>(garde?.photos || [])
  
  const initialContact = parseContact(garde?.contact || "")
  
  const [formData, setFormData] = useState({
    typeAnimal: garde?.typeAnimal || "",
    nomAnimal: garde?.nomAnimal || "",
    nomClient: garde?.nomClient || "",
    contactType: initialContact.type,
    contactValue: initialContact.value,
    source: garde?.source || "",
    dateDebut: garde?.dateDebut ? new Date(garde.dateDebut).toISOString().split('T')[0] : "",
    dateFin: garde?.dateFin ? new Date(garde.dateFin).toISOString().split('T')[0] : "",
    duree: garde?.duree || "",
    tarif: garde?.tarif?.toString() || "",
    typeGarde: garde?.typeGarde || "",
    statut: garde?.statut || "confirmé",
    notes: garde?.notes || "",
    isShared: garde?.isShared || false,
  })

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingPhotos(true)
    try {
      const formData = new FormData()
      Array.from(files).forEach(file => {
        formData.append("files", file)
      })
      formData.append("type", "pets") // Spécifier le type pour les photos d'animaux

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const { urls } = await response.json()
        setPhotos(prev => [...prev, ...urls])
      } else {
        alert("Erreur lors de l'upload des photos")
      }
    } catch (error) {
      console.error("Error uploading photos:", error)
      alert("Erreur lors de l'upload des photos")
    } finally {
      setUploadingPhotos(false)
    }
  }

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!profileId) {
      alert("Erreur: Profile ID manquant. Reconnectez-vous.")
      setLoading(false)
      return
    }

    try {
      const { contactType, contactValue, ...restFormData } = formData
      const contact = contactValue ? `${contactType}:${contactValue}` : ""
      
      const payload = { ...restFormData, contact: contact || undefined, profileId, photos }

      const isEditing = !!garde
      const url = isEditing ? `/api/gardes/${garde.id}` : "/api/gardes"
      const method = isEditing ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        onSuccess()
      } else {
        const error = await response.json()
        alert(`Erreur: ${error.error || "Erreur inconnue"}`)
      }
    } catch (error) {
      console.error(`Error ${garde ? "updating" : "creating"} garde:`, error)
      alert(`Erreur lors de ${garde ? "la modification" : "la création"} de la garde`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-20">
      {/* Header Mobile */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">
            {garde ? "Modifier la garde" : "Nouvelle garde"}
          </h1>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Animal */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-600 uppercase">Animal</h2>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Type d&apos;animal*</label>
            <Select
              required
              value={formData.typeAnimal}
              onValueChange={(value) => setFormData({ ...formData, typeAnimal: value })}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Sélectionner..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Chien">🐕 Chien</SelectItem>
                <SelectItem value="Chat">🐈 Chat</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Nom de l&apos;animal*</label>
            <Input
              required
              placeholder="Rex, Minou..."
              value={formData.nomAnimal}
              onChange={(e) => setFormData({ ...formData, nomAnimal: e.target.value })}
              className="h-12"
            />
          </div>
        </div>

        {/* Client */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-600 uppercase">Client</h2>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Nom du client*</label>
            <Input
              required
              placeholder="Marie Dupont"
              value={formData.nomClient}
              onChange={(e) => setFormData({ ...formData, nomClient: e.target.value })}
              className="h-12"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Contact</label>
            <div className="flex h-12 w-full rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
              <Select
                value={formData.contactType}
                onValueChange={(value) => setFormData({ ...formData, contactType: value })}
              >
                <SelectTrigger className="h-full w-[70px] border-0 border-r rounded-r-none focus:ring-0 focus:ring-offset-0 bg-transparent">
                  <ContactIcon type={formData.contactType} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>Téléphone</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="whatsapp">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      <span>WhatsApp</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="instagram">
                    <div className="flex items-center gap-2">
                      <Instagram className="h-4 w-4" />
                      <span>Instagram</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="email">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <input
                type="text"
                placeholder={
                  formData.contactType === "phone" ? "06.12.34.56.78" :
                  formData.contactType === "whatsapp" ? "06.12.34.56.78" :
                  formData.contactType === "instagram" ? "@username" :
                  "email@example.com"
                }
                value={formData.contactValue}
                onChange={(e) => setFormData({ ...formData, contactValue: e.target.value })}
                className="flex-1 px-3 py-2 text-base bg-transparent outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Comment nous avez-vous connu ?</label>
            <Select
              value={formData.source}
              onValueChange={(value) => setFormData({ ...formData, source: value })}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Sélectionner..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Rover">🐕 Rover</SelectItem>
                <SelectItem value="Animaute">🐾 Animaute</SelectItem>
                <SelectItem value="Facebook">👥 Facebook</SelectItem>
                <SelectItem value="Instagram">📷 Instagram</SelectItem>
                <SelectItem value="Autre">📝 Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Garde */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-600 uppercase">Garde</h2>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Type de garde</label>
            <Select
              value={formData.typeGarde}
              onValueChange={(value) => setFormData({ ...formData, typeGarde: value })}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Sélectionner..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Garde chez moi">🏠 Garde chez moi</SelectItem>
                <SelectItem value="Visite à domicile">🚪 Visite à domicile</SelectItem>
                <SelectItem value="Promenade">🐾 Promenade</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Date de début*</label>
            <Input
              required
              type="date"
              value={formData.dateDebut}
              onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
              className="h-12"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Date de fin*</label>
            <Input
              required
              type="date"
              value={formData.dateFin}
              onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
              className="h-12"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Durée</label>
            <Input
              placeholder="2 jours, 1 semaine..."
              value={formData.duree}
              onChange={(e) => setFormData({ ...formData, duree: e.target.value })}
              className="h-12"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Tarif (€)*</label>
            <Input
              required
              type="number"
              step="0.01"
              placeholder="50.00"
              value={formData.tarif}
              onChange={(e) => setFormData({ ...formData, tarif: e.target.value })}
              className="h-12"
            />
          </div>
        </div>

        {/* Photos */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-600 uppercase">Photos</h2>
          
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              disabled={uploadingPhotos}
              className="hidden"
              id="photo-upload"
            />
            <label
              htmlFor="photo-upload"
              className="flex items-center gap-2 px-4 py-3 border border-input rounded-md cursor-pointer hover:bg-accent transition-colors w-full justify-center"
            >
              <ImagePlus className="h-5 w-5" />
              {uploadingPhotos ? "Upload en cours..." : "Ajouter des photos"}
            </label>
          </div>

          {photos.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {photos.map((photo, index) => (
                <div key={index} className="relative group aspect-square">
                  <Image
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-2 shadow-lg"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  {index === 0 && (
                    <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                      Couverture
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-600 uppercase">Notes</h2>
          <textarea
            className="flex w-full rounded-md border border-input bg-background px-4 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
            placeholder="Informations supplémentaires..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        {/* Garde commune */}
        <div className="flex items-center gap-3 p-4 rounded-lg border border-purple-200 bg-purple-50/50">
          <input
            type="checkbox"
            id="isShared"
            checked={formData.isShared}
            onChange={(e) => setFormData({ ...formData, isShared: e.target.checked })}
            className="h-5 w-5 rounded border-purple-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
          />
          <label htmlFor="isShared" className="text-sm font-medium text-purple-900 cursor-pointer flex-1">
            <div className="flex flex-col gap-1">
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gradient-to-r from-purple-400 to-violet-400 text-white inline-block w-fit">
                Garde commune
              </span>
              <span className="text-xs text-purple-700">
                Revenus partagés entre Jordan et Juliette
              </span>
            </div>
          </label>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 h-12"
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 h-12"
          >
            {loading ? "Enregistrement..." : garde ? "Modifier" : "Enregistrer"}
          </Button>
        </div>
      </form>
    </div>
  )
}

