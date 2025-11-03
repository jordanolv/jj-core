import cron from "node-cron";
import {
  sendMonthlyBalanceNotification,
  sendDailyExpensesNotification,
} from "./notifications";

let isInitialized = false;

/**
 * Initialise les tâches cron
 * À appeler une seule fois au démarrage de l'application
 */
export function initCronJobs() {
  // Éviter la double initialisation
  if (isInitialized) {
    console.log("[Cron] Already initialized, skipping...");
    return;
  }

  // En développement, ne pas lancer les crons
  if (process.env.NODE_ENV === "development") {
    console.log("[Cron] Development mode, cron jobs disabled");
    return;
  }

  console.log("[Cron] Initializing cron jobs...");

  // Cron 1: Notification du solde mensuel - Chaque jour à 8h00 (heure locale)
  cron.schedule(
    "0 8 * * *",
    async () => {
      try {
        console.log("[Cron] Running monthly balance notification...");
        const result = await sendMonthlyBalanceNotification();
        console.log(
          `[Cron] Monthly balance notification sent: ${result.sent} success, ${result.failed} failed`
        );
      } catch (error) {
        console.error("[Cron] Error sending monthly balance notification:", error);
      }
    },
    {
      timezone: "Europe/Paris", // Ajuste selon ta timezone
    }
  );

  // Cron 2: Notification des dépenses quotidiennes - Chaque jour à 21h00
  cron.schedule(
    "0 21 * * *",
    async () => {
      try {
        console.log("[Cron] Running daily expenses notification...");
        const result = await sendDailyExpensesNotification();
        console.log(
          `[Cron] Daily expenses notification sent: ${result.sent} success, ${result.failed} failed`
        );
      } catch (error) {
        console.error("[Cron] Error sending daily expenses notification:", error);
      }
    },
    {
      timezone: "Europe/Paris",
    }
  );

  isInitialized = true;
  console.log("[Cron] ✅ Cron jobs initialized successfully");
  console.log("[Cron] - Monthly balance: Every day at 8:00 AM");
  console.log("[Cron] - Daily expenses: Every day at 9:00 PM");
}

/**
 * Arrête tous les crons (pour les tests ou le shutdown)
 */
export function stopCronJobs() {
  if (!isInitialized) {
    return;
  }

  console.log("[Cron] Stopping all cron jobs...");
  cron.getTasks().forEach((task) => task.stop());
  isInitialized = false;
  console.log("[Cron] ✅ All cron jobs stopped");
}

/**
 * Vérifie si les crons sont initialisés
 */
export function areCronJobsRunning() {
  return isInitialized;
}
