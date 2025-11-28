import { useAuthClient } from "../../../lib/auth-client";
import { authWrapper } from "../../../lib/auth-wrapper";

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  email: string;
  password: string;
  name: string;
}

export function useAuth() {
  if (import.meta.server) {
    return {
      session: ref({ data: null, isPending: true }),
      user: computed(() => null),
      isAuthenticated: computed(() => false),
      isPending: computed(() => true),
      login: async () => {},
      register: async () => {},
      logout: async () => {},
    };
  }

  const authClient = useAuthClient();
  const session = authClient.useSession();
  const isAuthenticated = computed(() => session.value?.data !== null);
  const isPending = computed(() => session.value?.isPending ?? true);

  async function login(payload: LoginPayload) {
    const result = await authClient.signIn.email(payload);
    if (result.error) {
      throw new Error(result.error.message || "Erreur de connexion");
    }
    if ((result.data as any)?.token) {
      authWrapper.setToken((result.data as any).token);
    }
    return result.data;
  }

  async function register(payload: RegisterPayload) {
    const result = await authClient.signUp.email(payload);
    if (result.error) {
      throw new Error(result.error.message || "Erreur lors de l'inscription");
    }
    if ((result.data as any)?.token) {
      authWrapper.setToken((result.data as any).token);
    }
    return result.data;
  }

  async function logout() {
    authWrapper.removeToken();
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

