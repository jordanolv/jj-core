import cron from "node-cron";
import {
  sendMonthlyBalanceNotification,
  sendDailyExpensesNotification,
  sendGardeTomorrowNotification,
  sendGardeTodayNotification,
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

  // En développement, lancer un cron de test toutes les 10 secondes
  if (process.env.NODE_ENV === "development") {
    console.log("[Cron] Development mode - starting test cron every 10 seconds");

    cron.schedule("*/10 * * * * *", async () => {
      try {
        console.log("[Cron Test] Running test notification...");
        const result = await sendMonthlyBalanceNotification();
        console.log(
          `[Cron Test] Sent to ${result.sent} devices. Balance notification.`
        );
      } catch (error) {
        console.error("[Cron Test] Error:", error);
      }
    });

    isInitialized = true;
    console.log("[Cron] ✅ Test cron initialized (every 10 seconds)");
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

  // Cron 3: Notification de garde pour demain - Chaque jour à 21h00
  cron.schedule(
    "0 21 * * *",
    async () => {
      try {
        console.log("[Cron] Running garde tomorrow notification...");
        const result = await sendGardeTomorrowNotification();
        console.log(
          `[Cron] Garde tomorrow notification sent: ${result.sent} success, ${result.failed} failed, ${result.gardesCount} gardes`
        );
      } catch (error) {
        console.error("[Cron] Error sending garde tomorrow notification:", error);
      }
    },
    {
      timezone: "Europe/Paris",
    }
  );

  // Cron 4: Notification de garde pour aujourd'hui - Chaque jour à 8h00
  cron.schedule(
    "0 8 * * *",
    async () => {
      try {
        console.log("[Cron] Running garde today notification...");
        const result = await sendGardeTodayNotification();
        console.log(
          `[Cron] Garde today notification sent: ${result.sent} success, ${result.failed} failed, ${result.gardesCount} gardes`
        );
      } catch (error) {
        console.error("[Cron] Error sending garde today notification:", error);
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
  console.log("[Cron] - Garde tomorrow: Every day at 9:00 PM");
  console.log("[Cron] - Garde today: Every day at 8:00 AM");
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
