import { useAuth } from "../features/auth/composables/useAuth";

export default defineNuxtRouteMiddleware(async (to, from) => {
  // Ne rien faire côté serveur
  if (import.meta.server) {
    return;
  }

  const { isAuthenticated, isPending } = useAuth();

  // Attendre maximum 3 secondes que la session se charge
  let attempts = 0;
  while (isPending.value && attempts < 30) {
    await new Promise(resolve => setTimeout(resolve, 100));
    attempts++;
  }

  console.log('[Middleware] After wait:', {
    isAuthenticated: isAuthenticated.value,
    isPending: isPending.value,
    attempts
  });

  if (!isAuthenticated.value) {
    return navigateTo("/login");
  }
});

