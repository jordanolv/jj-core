interface Profile {
  id: string;
  name: string;
  avatar?: string;
}

export function useProfiles() {
  const config = useRuntimeConfig();
  const apiUrl = config.public.apiUrl || 'http://localhost:4491';
  const selectedProfile = useState<Profile | null>("selected-profile", () => null);

  async function fetchProfiles(): Promise<Profile[]> {
    const response = await $fetch<{ profiles: Profile[] }>(`${apiUrl}/api/profiles`, {
      credentials: "include",
    });
    return response.profiles;
  }

  async function createProfile(data: { name: string; avatar?: string }): Promise<Profile> {
    const response = await $fetch<{ profile: Profile }>(`${apiUrl}/api/profiles`, {
      method: "POST",
      body: data,
      credentials: "include",
    });
    return response.profile;
  }

  function selectProfile(profile: Profile) {
    selectedProfile.value = profile;

    if (process.client) {
      localStorage.setItem("selected-profile", JSON.stringify(profile));
    }
  }

  function loadSelectedProfile() {
    if (process.client) {
      const stored = localStorage.getItem("selected-profile");
      if (stored) {
        selectedProfile.value = JSON.parse(stored);
      }
    }
  }

  return {
    selectedProfile,
    fetchProfiles,
    createProfile,
    selectProfile,
    loadSelectedProfile,
  };
}

