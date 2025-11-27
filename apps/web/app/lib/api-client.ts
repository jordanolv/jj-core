import type { NitroFetchRequest } from "nitropack";
import type { $Fetch } from "ofetch";

type FetchOptions<T> = Parameters<$Fetch<T, NitroFetchRequest>>[1];

export function useApiClient() {
  const config = useRuntimeConfig();
  const token = useState<string | null>("auth-token", () => null);

  async function fetch<T>(path: string, options?: FetchOptions<T>) {
    return await $fetch<T>(`${config.public.apiUrl}${path}`, {
      ...options,
      headers: {
        ...(options?.headers || {}),
        ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
      },
    });
  }

  return { fetch };
}

