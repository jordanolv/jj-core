import { prisma } from "@/lib/db";
import webpush from "web-push";

// Types de notifications
export enum NotificationType {
  MONTHLY_BALANCE = "monthly_balance",
  DAILY_EXPENSES = "daily_expenses",
}

// Interface pour les données de notification
interface NotificationData {
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
  const budgetMonth = await prisma.budgetMonth.findFirst({
    where: {
      year: {
        year,
      },
      month,
    },
    include: {
      incomes: true,
      expenses: true,
    },
  });

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
