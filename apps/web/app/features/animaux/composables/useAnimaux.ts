import { useProfiles } from "../../profiles/composables/useProfiles";

export interface Garde {
  id: string;
  typeAnimal: string;
  nomAnimal: string;
  nomClient: string;
  contact?: string;
  source?: string;
  dateDebut: Date | string;
  dateFin: Date | string;
  duree?: string;
  tarif: number;
  typeGarde: string;
  statut: "confirmé" | "en_cours" | "terminé" | "annulé";
  notes?: string;
  photos: string[];
  isShared: boolean;
  profileId: string;
}

export function useAnimaux() {
  const config = useRuntimeConfig();
  const apiUrl = config.public.apiUrl || 'http://localhost:4491';
  const BASE_URL = `${apiUrl}/api/gardes`;
  const { selectedProfile } = useProfiles();

  function getHeaders() {
    return {
      "X-Profile-Id": selectedProfile.value?.id || "",
    };
  }

  async function getGardes(showShared: boolean = false) {
    const params = new URLSearchParams();
    if (showShared) params.append("shared", "true");

    const url = params.toString() ? `${BASE_URL}?${params.toString()}` : BASE_URL;

    const response = await $fetch<Garde[]>(url, {
      headers: getHeaders(),
      credentials: "include",
    });
    return response;
  }

  async function getGarde(id: string) {
    const response = await $fetch<Garde>(`${BASE_URL}/${id}`, {
      headers: getHeaders(),
      credentials: "include",
    });
    return response;
  }

  async function createGarde(data: {
    typeAnimal: string;
    nomAnimal: string;
    nomClient: string;
    contact?: string;
    source?: string;
    dateDebut: string;
    dateFin: string;
    duree?: string;
    tarif: number;
    typeGarde: string;
    statut?: "confirmé" | "en_cours" | "terminé" | "annulé";
    notes?: string;
    photos?: string[];
    isShared?: boolean;
  }) {
    const response = await $fetch<{ id: string }>(`${BASE_URL}`, {
      method: "POST",
      headers: getHeaders(),
      body: data,
      credentials: "include",
    });
    return response;
  }

  async function updateGarde(id: string, data: Partial<{
    typeAnimal: string;
    nomAnimal: string;
    nomClient: string;
    contact?: string;
    source?: string;
    dateDebut: string;
    dateFin: string;
    duree?: string;
    tarif: number;
    typeGarde: string;
    statut: "confirmé" | "en_cours" | "terminé" | "annulé";
    notes?: string;
    photos?: string[];
    isShared?: boolean;
  }>) {
    const response = await $fetch<{ success: boolean }>(`${BASE_URL}/${id}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: data,
      credentials: "include",
    });
    return response;
  }

  async function deleteGarde(id: string) {
    const response = await $fetch<{ success: boolean }>(`${BASE_URL}/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
      credentials: "include",
    });
    return response;
  }

  return {
    getGardes,
    getGarde,
    createGarde,
    updateGarde,
    deleteGarde,
  };
}
