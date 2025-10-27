"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { ImagePlus, X } from "lucide-react"
import Image from "next/image"

interface GardeFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  profileId: string
  garde?: {
    id: string
    typeAnimal: string
    nomAnimal: string
    nomClient: string
    contact: string
    dateDebut: string
    dateFin: string
    duree: string
    tarif: number
    typeGarde: string
    statut: string
    photos: string[]
    notes?: string
    isShared?: boolean
  } | null
}

export function GardeForm({ open, onOpenChange, onSuccess, profileId, garde }: GardeFormProps) {
  const [loading, setLoading] = useState(false)
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [photos, setPhotos] = useState<string[]>(garde?.photos || [])
  const [formData, setFormData] = useState({
    typeAnimal: garde?.typeAnimal || "",
    nomAnimal: garde?.nomAnimal || "",
    nomClient: garde?.nomClient || "",
    contact: garde?.contact || "",
    dateDebut: garde?.dateDebut ? new Date(garde.dateDebut).toISOString().split('T')[0] : "",
    dateFin: garde?.dateFin ? new Date(garde.dateFin).toISOString().split('T')[0] : "",
    duree: garde?.duree || "",
    tarif: garde?.tarif?.toString() || "",
    typeGarde: garde?.typeGarde || "",
    statut: garde?.statut || "confirmé",
    notes: garde?.notes || "",
    isShared: garde?.isShared || false,
  })

  // Réinitialiser le formulaire quand la garde change
  useEffect(() => {
    if (garde) {
      setFormData({
        typeAnimal: garde.typeAnimal,
        nomAnimal: garde.nomAnimal,
        nomClient: garde.nomClient,
        contact: garde.contact,
        dateDebut: new Date(garde.dateDebut).toISOString().split('T')[0],
        dateFin: new Date(garde.dateFin).toISOString().split('T')[0],
        duree: garde.duree,
        tarif: garde.tarif.toString(),
        typeGarde: garde.typeGarde,
        statut: garde.statut,
        notes: garde.notes || "",
        isShared: garde.isShared || false,
      })
      setPhotos(garde.photos)
    } else {
      setFormData({
        typeAnimal: "",
        nomAnimal: "",
        nomClient: "",
        contact: "",
        dateDebut: "",
        dateFin: "",
        duree: "",
        tarif: "",
        typeGarde: "",
        statut: "confirmé",
        notes: "",
        isShared: false,
      })
      setPhotos([])
    }
  }, [garde])

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingPhotos(true)
    try {
      const formData = new FormData()
      Array.from(files).forEach(file => {
        formData.append("files", file)
      })

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

    console.log("Form data:", formData)
    console.log("Profile ID:", profileId)

    if (!profileId) {
      alert("Erreur: Profile ID manquant. Reconnectez-vous.")
      setLoading(false)
      return
    }

    try {
      const payload = { ...formData, profileId, photos }
      console.log("Sending payload:", payload)

      const isEditing = !!garde
      const url = isEditing ? `/api/gardes/${garde.id}` : "/api/gardes"
      const method = isEditing ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      console.log("Response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("Success:", data)
        onSuccess()
        onOpenChange(false)
        // Reset form
        setFormData({
          typeAnimal: "",
          nomAnimal: "",
          nomClient: "",
          contact: "",
          dateDebut: "",
          dateFin: "",
          duree: "",
          tarif: "",
          typeGarde: "",
          statut: "confirmé",
          notes: "",
          isShared: false,
        })
        setPhotos([])
      } else {
        const error = await response.json()
        console.error("Error response:", error)
        alert(`Erreur: ${error.error || "Erreur inconnue"}`)
      }
    } catch (error) {
      console.error(`Error ${garde ? "updating" : "creating"} garde:`, error)
      alert(`Erreur lors de ${garde ? "la modification" : "la création"} de la garde: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <Card className="border-0 shadow-none">
          <CardContent className="p-0">
            <DialogHeader className="mb-4">
              <DialogTitle>{garde ? "Modifier la garde" : "Nouvelle garde"}</DialogTitle>
              <DialogDescription>
                {garde ? "Modifiez les informations de la garde" : "Enregistrez une nouvelle garde d&apos;animaux"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Type d&apos;animal*</label>
                  <Input
                    required
                    placeholder="Chien, Chat..."
                    value={formData.typeAnimal}
                    onChange={(e) => setFormData({ ...formData, typeAnimal: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Nom de l&apos;animal*</label>
                  <Input
                    required
                    placeholder="Rex, Minou..."
                    value={formData.nomAnimal}
                    onChange={(e) => setFormData({ ...formData, nomAnimal: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Nom du client*</label>
                  <Input
                    required
                    placeholder="Marie Dupont"
                    value={formData.nomClient}
                    onChange={(e) => setFormData({ ...formData, nomClient: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Contact*</label>
                  <Input
                    required
                    placeholder="06.12.34.56.78"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Date de début*</label>
                  <Input
                    required
                    type="date"
                    value={formData.dateDebut}
                    onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Date de fin*</label>
                  <Input
                    required
                    type="date"
                    value={formData.dateFin}
                    onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Durée</label>
                <Input
                  placeholder="2 jours, 1 visite..."
                  value={formData.duree}
                  onChange={(e) => setFormData({ ...formData, duree: e.target.value })}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Tarif (€)*</label>
                  <Input
                    required
                    type="number"
                    step="0.01"
                    placeholder="50.00"
                    value={formData.tarif}
                    onChange={(e) => setFormData({ ...formData, tarif: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Type de garde</label>
                  <Input
                    placeholder="Garde chez moi, Visite..."
                    value={formData.typeGarde}
                    onChange={(e) => setFormData({ ...formData, typeGarde: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Notes</label>
                <textarea
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  rows={3}
                  placeholder="Informations supplémentaires..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-2 p-4 rounded-lg border border-purple-200 bg-purple-50/50">
                <input
                  type="checkbox"
                  id="isShared"
                  checked={formData.isShared}
                  onChange={(e) => setFormData({ ...formData, isShared: e.target.checked })}
                  className="h-4 w-4 rounded border-purple-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
                <label htmlFor="isShared" className="text-sm font-medium text-purple-900 cursor-pointer flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gradient-to-r from-purple-400 to-violet-400 text-white">
                      Garde commune
                    </span>
                    <span className="text-purple-700">
                      Les revenus seront partagés entre Jordan et Juliette
                    </span>
                  </div>
                </label>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Photos de l&apos;animal</label>
                <div className="space-y-3">
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
                      className="flex items-center gap-2 px-4 py-2 border border-input rounded-md cursor-pointer hover:bg-accent transition-colors"
                    >
                      <ImagePlus className="h-4 w-4" />
                      {uploadingPhotos ? "Upload en cours..." : "Ajouter des photos"}
                    </label>
                    {photos.length > 0 && (
                      <span className="text-sm text-muted-foreground">
                        {photos.length} photo{photos.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  {photos.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {photos.map((photo, index) => (
                        <div key={index} className="relative group aspect-square">
                          <Image
                            src={photo}
                            alt={`Photo ${index + 1}`}
                            fill
                            className="object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          {index === 0 && (
                            <div className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded">
                              Miniature
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Enregistrement..." : garde ? "Modifier" : "Enregistrer"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
