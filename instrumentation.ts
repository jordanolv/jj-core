/**
 * Fichier d'instrumentation Next.js
 * Permet d'exécuter du code au démarrage du serveur
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // S'exécute uniquement côté serveur
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initCronJobs } = await import("./lib/cron-scheduler");
    initCronJobs();
  }
}
