import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import webpush from "web-push";

// Fonction pour calculer le solde du mois en cours
async function calculateCurrentMonthBalance() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed

  // Récupérer l'année budget
  const budgetYear = await prisma.budgetYear.findFirst({
    where: { year: currentYear },
    include: {
      months: {
        where: { month: currentMonth },
        include: {
          incomes: true,
          expenses: true,
        },
      },
    },
  });

  if (!budgetYear || budgetYear.months.length === 0) {
    return {
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0,
      monthName: getMonthName(currentMonth),
    };
  }

  const monthData = budgetYear.months[0];

  // Calculer les revenus totaux
  const totalIncome = monthData.incomes.reduce(
    (sum, income) => sum + income.amount,
    0
  );

  // Calculer les dépenses totales
  const totalExpenses = monthData.expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  // Calculer le solde
  const balance = totalIncome - totalExpenses;

  return {
    totalIncome,
    totalExpenses,
    balance,
    monthName: getMonthName(currentMonth),
  };
}

// Fonction utilitaire pour obtenir le nom du mois en français
function getMonthName(month: number): string {
  const months = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];
  return months[month - 1] || "Inconnu";
}

// Fonction pour formater un montant en euros
function formatAmount(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export async function POST(req: NextRequest) {
  try {
    // Configuration de web-push avec les clés VAPID (au moment de l'exécution)
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || "mailto:contact@jj-core.app",
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    );

    // Vérifier l'authentification (ou utiliser un token secret pour le cron)
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Si un secret cron est défini, l'utiliser pour l'authentification
    if (cronSecret) {
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    } else {
      // Sinon, vérifier la session utilisateur
      const session = await getServerSession();
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // Calculer le solde du mois en cours
    const { totalIncome, totalExpenses, balance, monthName } =
      await calculateCurrentMonthBalance();

    // Récupérer toutes les subscriptions actives
    const subscriptions = await prisma.pushSubscription.findMany();

    if (subscriptions.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No subscriptions found",
      });
    }

    // Créer le message de notification
    const balanceEmoji = balance >= 0 ? "💰" : "⚠️";
    const title = `${balanceEmoji} Solde ${monthName}`;
    const body = `Revenus: ${formatAmount(totalIncome)} | Dépenses: ${formatAmount(totalExpenses)} | Solde: ${formatAmount(balance)}`;

    // Payload de la notification
    const payload = JSON.stringify({
      title,
      body,
      icon: "/icon-192x192.png",
      badge: "/icon-192x192.png",
      url: "/budget",
      timestamp: Date.now(),
      data: {
        totalIncome,
        totalExpenses,
        balance,
        monthName,
      },
    });

    // Envoyer la notification à toutes les subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        try {
          await webpush.sendNotification(pushSubscription, payload);
          return { success: true, endpoint: sub.endpoint };
        } catch (error: unknown) {
          // Si la subscription est expirée ou invalide (410 Gone), la supprimer
          const err = error as { statusCode?: number; message?: string };
          if (err.statusCode === 410) {
            await prisma.pushSubscription.delete({
              where: { endpoint: sub.endpoint },
            });
          }
          return {
            success: false,
            endpoint: sub.endpoint,
            error: err.message || "Unknown error",
          };
        }
      })
    );

    // Compter les succès et échecs
    const successful = results.filter(
      (r) => r.status === "fulfilled" && r.value.success
    ).length;
    const failed = results.length - successful;

    return NextResponse.json({
      success: true,
      message: `Daily notification sent to ${successful} device(s)`,
      balance: {
        totalIncome,
        totalExpenses,
        balance,
        monthName,
      },
      notifications: {
        total: results.length,
        successful,
        failed,
      },
    });
  } catch (error) {
    console.error("Error sending daily notification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Endpoint GET pour tester manuellement
export async function GET() {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Calculer et retourner le solde sans envoyer de notification
    const balance = await calculateCurrentMonthBalance();

    return NextResponse.json({
      success: true,
      balance,
    });
  } catch (error) {
    console.error("Error calculating balance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
