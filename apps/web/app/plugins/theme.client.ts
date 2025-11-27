export default defineNuxtPlugin(() => {
  if (typeof window !== 'undefined') {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }
});
