import { NextRequest, NextResponse } from "next/server";
import {
  sendMonthlyBalanceNotification,
  sendDailyExpensesNotification,
  sendGardeTomorrowNotification,
  sendGardeTodayNotification,
  NotificationType,
} from "@/lib/notifications";

// Sécuriser les cron jobs avec un secret
const CRON_SECRET = process.env.CRON_SECRET;

/**
 * Route API unifiée pour tous les cron jobs
 *
 * Usage:
 * POST /api/cron?job=monthly_balance&secret=xxx
 * POST /api/cron?job=daily_expenses&secret=xxx
 */
export async function POST(req: NextRequest) {
  try {
    // Vérifier l'authentification
    const secret = req.nextUrl.searchParams.get("secret");
    const jobType = req.nextUrl.searchParams.get("job");

    // Si un secret est configuré, le vérifier
    if (CRON_SECRET && secret !== CRON_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!jobType) {
      return NextResponse.json(
        { error: "Missing 'job' parameter" },
        { status: 400 }
      );
    }

    let result;

    switch (jobType) {
      case NotificationType.MONTHLY_BALANCE:
        result = await sendMonthlyBalanceNotification();
        break;

      case NotificationType.DAILY_EXPENSES:
        result = await sendDailyExpensesNotification();
        break;

      case NotificationType.GARDE_TOMORROW:
        result = await sendGardeTomorrowNotification();
        break;

      case NotificationType.GARDE_TODAY:
        result = await sendGardeTodayNotification();
        break;

      default:
        return NextResponse.json(
          { error: `Unknown job type: ${jobType}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      job: jobType,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Cron] Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET pour tester manuellement (sans secret en dev)
 */
export async function GET(req: NextRequest) {
  // En production, exiger le secret même pour GET
  if (process.env.NODE_ENV === "production") {
    const secret = req.nextUrl.searchParams.get("secret");
    if (CRON_SECRET && secret !== CRON_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
  }

  const jobType = req.nextUrl.searchParams.get("job");

  return NextResponse.json({
    message: "Cron API is running",
    availableJobs: Object.values(NotificationType),
    usage: `/api/cron?job=${jobType || "JOB_TYPE"}&secret=YOUR_SECRET`,
    example: `/api/cron?job=monthly_balance&secret=xxx`,
  });
}
