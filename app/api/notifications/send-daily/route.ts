import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { sendMonthlyBalanceNotification, getMonthlyBalance } from "@/lib/notifications";

/**
 * DEPRECATED: Utilisez /api/cron?job=monthly_balance à la place
 * Cette route est conservée pour rétrocompatibilité
 */
export async function POST(req: NextRequest) {
  try {
    // Vérifier l'authentification
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret) {
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    } else {
      const session = await getServerSession();
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // Utiliser la nouvelle fonction de lib
    const result = await sendMonthlyBalanceNotification();
    const balance = await getMonthlyBalance();

    return NextResponse.json({
      success: true,
      message: `Daily notification sent to ${result.sent} device(s)`,
      balance,
      notifications: result,
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
    const balance = await getMonthlyBalance();

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
