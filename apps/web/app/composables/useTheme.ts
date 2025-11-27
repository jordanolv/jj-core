export type Theme = "light" | "dark";

export function useTheme() {
  const theme = ref<Theme>("light");
  const profileId = ref<string | null>(null);

  const applyTheme = (newTheme: Theme) => {
    theme.value = newTheme;
    if (import.meta.client) {
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  const loadTheme = (currentProfileId: string) => {
    profileId.value = currentProfileId;
    if (import.meta.client) {
      const stored = localStorage.getItem(`theme-${currentProfileId}`);
      const savedTheme = (stored as Theme) || "light";
      applyTheme(savedTheme);
    }
  };

  const setTheme = (newTheme: Theme) => {
    applyTheme(newTheme);
    if (import.meta.client && profileId.value) {
      localStorage.setItem(`theme-${profileId.value}`, newTheme);
    }
  };

  const toggleTheme = () => {
    setTheme(theme.value === "light" ? "dark" : "light");
  };

  return {
    theme: readonly(theme),
    loadTheme,
    setTheme,
    toggleTheme,
  };
}

