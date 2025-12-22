import { useAuthClient } from "../../../lib/auth-client";

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  email: string;
  password: string;
  name: string;
}

// État global partagé pour éviter de recréer les refs à chaque appel
let authState: ReturnType<typeof createAuthState> | null = null;

function createAuthState() {
  const authClient = useAuthClient();
  const session = authClient.useSession();

  // Debug logs
  watch(session, (newSession) => {
    console.log('[useAuth] Session changed:', {
      data: newSession?.data,
      isPending: newSession?.isPending,
      isAuthenticated: newSession?.data !== null
    });
  }, { immediate: true });

  const isAuthenticated = computed(() => session.value?.data !== null);
  const isPending = computed(() => session.value?.isPending ?? false);

  async function login(payload: LoginPayload) {
    const result = await authClient.signIn.email(payload);
    if (result.error) {
      throw new Error(result.error.message || "Erreur de connexion");
    }
    return result.data;
  }

  async function register(payload: RegisterPayload) {
    const result = await authClient.signUp.email(payload);
    if (result.error) {
      throw new Error(result.error.message || "Erreur lors de l'inscription");
    }
    return result.data;
  }

  async function logout() {
    await authClient.signOut();
  }

  return {
    session,
    user: computed(() => session.value?.data?.user ?? null),
    isAuthenticated,
    isPending,
    login,
    register,
    logout,
  };
}

export function useAuth() {
  if (import.meta.server) {
    return {
      session: ref({ data: null, isPending: false }),
      user: computed(() => null),
      isAuthenticated: computed(() => false),
      isPending: computed(() => false),
      login: async () => {},
      register: async () => {},
      logout: async () => {},
    };
  }

  // Réutiliser l'état existant ou en créer un nouveau
  if (!authState) {
    authState = createAuthState();
  }

  return authState;
}

