import { prisma } from "@/lib/db";
import webpush from "web-push";

// Types de notifications
export enum NotificationType {
  MONTHLY_BALANCE = "monthly_balance",
  DAILY_EXPENSES = "daily_expenses",
  GARDE_TOMORROW = "garde_tomorrow",
  GARDE_TODAY = "garde_today",
}

// Interface pour les données de notification
export interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
}

/**
 * Configuration de web-push avec les clés VAPID
 */
export function configureWebPush() {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:contact@jj-core.app",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
}

/**
 * Envoie une notification à tous les utilisateurs abonnés
 */
export async function sendNotificationToAll(data: NotificationData) {
  configureWebPush();

  // Récupérer toutes les subscriptions actives
  const subscriptions = await prisma.pushSubscription.findMany();

  if (subscriptions.length === 0) {
    return { sent: 0, failed: 0 };
  }

  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        await webpush.sendNotification(
          pushSubscription,
          JSON.stringify(data)
        );

        return { success: true, endpoint: sub.endpoint };
      } catch (error) {
        console.error(`Failed to send notification to ${sub.endpoint}:`, error);

        // Si l'endpoint n'est plus valide (410 Gone), supprimer la subscription
        if (error instanceof Error && "statusCode" in error && error.statusCode === 410) {
          await prisma.pushSubscription.delete({
            where: { endpoint: sub.endpoint },
          });
        }

        return { success: false, endpoint: sub.endpoint, error };
      }
    })
  );

  const sent = results.filter((r) => r.status === "fulfilled" && r.value.success).length;
  const failed = results.length - sent;

  return { sent, failed, total: subscriptions.length };
}

/**
 * Calcule le solde du mois en cours (revenus - dépenses)
 */
export async function getMonthlyBalance() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  // Récupérer le mois du budget avec ses revenus et dépenses
  const budgetYear = await prisma.budgetYear.findFirst({
    where: { year },
    include: {
      months: {
        where: { month },
        include: {
          incomes: true,
          expenses: true,
        },
      },
    },
  });

  const budgetMonth = budgetYear?.months[0];

  if (!budgetMonth) {
    return {
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0,
      year,
      month,
    };
  }

  const totalIncome = budgetMonth.incomes.reduce((sum, income) => sum + income.amount, 0);
  const totalExpenses = budgetMonth.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const balance = totalIncome - totalExpenses;

  return {
    totalIncome,
    totalExpenses,
    balance,
    year,
    month,
  };
}

/**
 * Calcule les dépenses de la journée
 */
export async function getDailyExpenses() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  // Récupérer les dépenses du jour (filtrer par date)
  const expenses = await prisma.budgetExpense.findMany({
    where: {
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const count = expenses.length;

  return {
    totalAmount,
    count,
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
}

/**
 * Envoie la notification du solde mensuel (8h)
 */
export async function sendMonthlyBalanceNotification() {
  const balance = await getMonthlyBalance();

  const formatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  });

  const notification: NotificationData = {
    title: `💰 Solde de ${new Date().toLocaleDateString("fr-FR", { month: "long" })}`,
    body: `Solde: ${formatter.format(balance.balance)}\nDépensé: ${formatter.format(balance.totalExpenses)} sur ${formatter.format(balance.totalIncome)}`,
    icon: "/icon-192x192.png",
    badge: "/icon-192x192.png",
    tag: "monthly-balance",
    data: {
      type: NotificationType.MONTHLY_BALANCE,
      ...balance,
    },
  };

  return await sendNotificationToAll(notification);
}

/**
 * Envoie la notification des dépenses quotidiennes (21h)
 */
export async function sendDailyExpensesNotification() {
  const expenses = await getDailyExpenses();

  const formatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  });

  const notification: NotificationData = {
    title: "📊 Dépenses du jour",
    body: `${expenses.count} achat${expenses.count > 1 ? "s" : ""} pour ${formatter.format(expenses.totalAmount)}`,
    icon: "/icon-192x192.png",
    badge: "/icon-192x192.png",
    tag: "daily-expenses",
    data: {
      type: NotificationType.DAILY_EXPENSES,
      ...expenses,
    },
  };

  return await sendNotificationToAll(notification);
}

/**
 * Récupère les gardes qui commencent demain
 */
export async function getGardesTomorrow() {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const startOfTomorrow = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 0, 0, 0);
  const endOfTomorrow = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 23, 59, 59);

  const gardes = await prisma.gardeAnimaux.findMany({
    where: {
      dateDebut: {
        gte: startOfTomorrow,
        lte: endOfTomorrow,
      },
    },
  });

  return gardes;
}

/**
 * Récupère les gardes qui commencent aujourd'hui
 */
export async function getGardesToday() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  const gardes = await prisma.gardeAnimaux.findMany({
    where: {
      dateDebut: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  return gardes;
}

/**
 * Envoie la notification de garde pour demain (21h)
 */
export async function sendGardeTomorrowNotification() {
  const gardes = await getGardesTomorrow();

  if (gardes.length === 0) {
    return { sent: 0, failed: 0, total: 0, message: "No gardes tomorrow" };
  }

  // Envoyer une notification pour chaque garde
  const results = await Promise.all(
    gardes.map(async (garde) => {
      const notification: NotificationData = {
        title: "🐕 Garde demain",
        body: `Votre garde avec ${garde.nomAnimal} commence demain`,
        icon: "/icon-192x192.png",
        badge: "/icon-192x192.png",
        tag: `garde-tomorrow-${garde.id}`,
        data: {
          type: NotificationType.GARDE_TOMORROW,
          gardeId: garde.id,
          nomAnimal: garde.nomAnimal,
          dateDebut: garde.dateDebut,
        },
      };

      return await sendNotificationToAll(notification);
    })
  );

  // Agréger les résultats
  const totalSent = results.reduce((sum, r) => sum + r.sent, 0);
  const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);
  const totalSubscriptions = results[0]?.total || 0;

  return {
    sent: totalSent,
    failed: totalFailed,
    total: totalSubscriptions,
    gardesCount: gardes.length,
  };
}

/**
 * Envoie la notification de garde pour aujourd'hui (8h)
 */
export async function sendGardeTodayNotification() {
  const gardes = await getGardesToday();

  if (gardes.length === 0) {
    return { sent: 0, failed: 0, total: 0, message: "No gardes today" };
  }

  // Envoyer une notification pour chaque garde
  const results = await Promise.all(
    gardes.map(async (garde) => {
      const notification: NotificationData = {
        title: "🐕 Garde aujourd'hui",
        body: `Votre garde avec ${garde.nomAnimal} commence aujourd'hui`,
        icon: "/icon-192x192.png",
        badge: "/icon-192x192.png",
        tag: `garde-today-${garde.id}`,
        data: {
          type: NotificationType.GARDE_TODAY,
          gardeId: garde.id,
          nomAnimal: garde.nomAnimal,
          dateDebut: garde.dateDebut,
        },
      };

      return await sendNotificationToAll(notification);
    })
  );

  // Agréger les résultats
  const totalSent = results.reduce((sum, r) => sum + r.sent, 0);
  const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);
  const totalSubscriptions = results[0]?.total || 0;

  return {
    sent: totalSent,
    failed: totalFailed,
    total: totalSubscriptions,
    gardesCount: gardes.length,
  };
}
