import { useProfiles } from "../../profiles/composables/useProfiles";

export function useBudget() {
  const config = useRuntimeConfig();
  const apiUrl = config.public.apiUrl || 'http://localhost:4491';
  const BASE_URL = `${apiUrl}/api/budget`;
  const { selectedProfile } = useProfiles();

  function getHeaders() {
    return {
      "X-Profile-Id": selectedProfile.value?.id || "",
    };
  }

  async function getYears() {
    const response = await $fetch<{ years: number[] }>(`${BASE_URL}/years`, {
      headers: getHeaders(),
      credentials: "include",
    });
    return response.years;
  }

  async function getMonths(year: number) {
    const response = await $fetch<{ months: number[] }>(`${BASE_URL}/years/${year}/months`, {
      headers: getHeaders(),
      credentials: "include",
    });
    return response.months;
  }

  async function getMonthDetails(year: number, month: number) {
    const response = await $fetch<{
      expenses: any[];
      incomes: any[];
      categories: any[];
    }>(`${BASE_URL}/years/${year}/months/${month}`, {
      headers: getHeaders(),
      credentials: "include",
    });
    return response;
  }

  async function createExpense(data: {
    categoryId?: string;
    description: string;
    amount: number;
    date: string;
  }) {
    const response = await $fetch<{ id: string }>(`${BASE_URL}/expenses`, {
      method: "POST",
      headers: getHeaders(),
      body: data,
      credentials: "include",
    });
    return response;
  }

  async function updateExpense(id: string, data: {
    categoryId?: string;
    description?: string;
    amount?: number;
    date?: string;
  }) {
    const response = await $fetch<{ success: boolean }>(`${BASE_URL}/expenses/${id}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: data,
      credentials: "include",
    });
    return response;
  }

  async function deleteExpense(id: string) {
    const response = await $fetch<{ success: boolean }>(`${BASE_URL}/expenses/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
      credentials: "include",
    });
    return response;
  }

  async function createIncome(data: {
    categoryId?: string;
    description: string;
    amount: number;
    date: string;
  }) {
    const response = await $fetch<{ id: string }>(`${BASE_URL}/incomes`, {
      method: "POST",
      headers: getHeaders(),
      body: data,
      credentials: "include",
    });
    return response;
  }

  async function getGlobalCategories() {
    const response = await $fetch<{ categories: any[] }>(`${BASE_URL}/global-categories`, {
      headers: getHeaders(),
      credentials: "include",
    });
    return response.categories;
  }

  async function createGlobalCategory(data: {
    name: string;
    type: "income" | "expense";
    color?: string;
    icon?: string;
  }) {
    const response = await $fetch<{ id: string }>(`${BASE_URL}/global-categories`, {
      method: "POST",
      headers: getHeaders(),
      body: data,
      credentials: "include",
    });
    return response;
  }

  async function getSubscriptions() {
    const response = await $fetch<{ subscriptions: any[] }>(`${BASE_URL}/subscriptions`, {
      headers: getHeaders(),
      credentials: "include",
    });
    return response.subscriptions;
  }

  async function createSubscription(data: {
    categoryId?: string;
    name: string;
    amount: number;
    frequency: "monthly" | "yearly";
    startDate: string;
  }) {
    const response = await $fetch<{ id: string }>(`${BASE_URL}/subscriptions`, {
      method: "POST",
      headers: getHeaders(),
      body: data,
      credentials: "include",
    });
    return response;
  }

  async function deleteSubscription(id: string) {
    const response = await $fetch<{ success: boolean }>(`${BASE_URL}/subscriptions/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
      credentials: "include",
    });
    return response;
  }

  async function convertExpenseToSubscription(data: {
    expenseId: string;
    name: string;
    frequency: "monthly" | "yearly";
  }) {
    const response = await $fetch<{ id: string }>(`${BASE_URL}/subscriptions/from-expense`, {
      method: "POST",
      headers: getHeaders(),
      body: data,
      credentials: "include",
    });
    return response;
  }

  async function generateSubscriptionExpenses() {
    const response = await $fetch<{ generated: number; expenses: any[] }>(`${BASE_URL}/subscriptions/generate`, {
      method: "POST",
      headers: getHeaders(),
      credentials: "include",
    });
    return response;
  }

  return {
    getYears,
    getMonths,
    getMonthDetails,
    createExpense,
    updateExpense,
    deleteExpense,
    createIncome,
    getGlobalCategories,
    createGlobalCategory,
    getSubscriptions,
    createSubscription,
    deleteSubscription,
    convertExpenseToSubscription,
    generateSubscriptionExpenses,
  };
}

