export const useAuthClient = () => {
  if (typeof window === "undefined") {
    throw new Error("Auth client is only available on the client side.");
  }
  
  const nuxtApp = useNuxtApp();
  if (!nuxtApp.$auth) {
    throw new Error("Auth client is not available. Make sure the auth plugin is loaded.");
  }
  return nuxtApp.$auth;
};
