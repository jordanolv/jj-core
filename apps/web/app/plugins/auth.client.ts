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
  });

  return {
    provide: {
      auth: authClient,
      authWrapper,
    },
  };
});

