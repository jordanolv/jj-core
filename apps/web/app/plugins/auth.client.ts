import { createAuthClient } from "better-auth/vue";
import { authWrapper } from "~/lib/auth-wrapper";

export default defineNuxtPlugin(() => {
  if (typeof window === "undefined") {
    return {
      provide: {
        auth: null,
      },
    };
  }

  const config = useRuntimeConfig();
  const apiUrl = config.public.apiUrl || "http://localhost:4491";

  const authClient = createAuthClient({
    baseURL: apiUrl,
    fetchOptions: {
      customFetchImpl: async (url, options) => {
        const token = authWrapper.getToken();
        const headers = new Headers(options?.headers);

        if (token) {
          headers.set('Authorization', `Bearer ${token}`);
        }

        return fetch(url, {
          ...options,
          headers,
        });
      },
    },
  });

  return {
    provide: {
      auth: authClient,
      authWrapper,
    },
  };
});

