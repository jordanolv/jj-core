import { useProfiles } from "../../profiles/composables/useProfiles";

export interface List {
  id: string;
  name: string;
  isShared: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function useLists() {
  const config = useRuntimeConfig();
  const apiUrl = config.public.apiUrl || 'http://localhost:4491';
  const BASE_URL = `${apiUrl}/api/lists`;
  const { selectedProfile } = useProfiles();

  function getHeaders() {
    return {
      "X-Profile-Id": selectedProfile.value?.id || "",
    };
  }

  async function getLists() {
    const response = await $fetch<{ lists: List[] }>(`${BASE_URL}`, {
      headers: getHeaders(),
      credentials: "include",
    });
    return response.lists;
  }

  async function getList(listId: string) {
    const response = await $fetch<{ list: List; items: ListItem[] }>(`${BASE_URL}/${listId}`, {
      headers: getHeaders(),
      credentials: "include",
    });
    return response;
  }

  async function createList(data: { name: string; isShared: boolean }) {
    const response = await $fetch<List>(`${BASE_URL}`, {
      method: "POST",
      headers: getHeaders(),
      body: data,
      credentials: "include",
    });
    return response;
  }

  async function updateList(listId: string, data: { name?: string; isShared?: boolean }) {
    const response = await $fetch<List>(`${BASE_URL}/${listId}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: data,
      credentials: "include",
    });
    return response;
  }

  async function deleteList(listId: string) {
    const response = await $fetch<{ success: boolean }>(`${BASE_URL}/${listId}`, {
      method: "DELETE",
      headers: getHeaders(),
      credentials: "include",
    });
    return response;
  }

  async function createItem(listId: string, text: string) {
    const response = await $fetch<ListItem>(`${BASE_URL}/${listId}/items`, {
      method: "POST",
      headers: getHeaders(),
      body: { text },
      credentials: "include",
    });
    return response;
  }

  async function updateItem(listId: string, itemId: string, data: { text?: string; completed?: boolean }) {
    const response = await $fetch<ListItem>(`${BASE_URL}/${listId}/items/${itemId}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: data,
      credentials: "include",
    });
    return response;
  }

  async function deleteItem(listId: string, itemId: string) {
    const response = await $fetch<{ success: boolean }>(`${BASE_URL}/${listId}/items/${itemId}`, {
      method: "DELETE",
      headers: getHeaders(),
      credentials: "include",
    });
    return response;
  }

  return {
    getLists,
    getList,
    createList,
    updateList,
    deleteList,
    createItem,
    updateItem,
    deleteItem,
  };
}
