import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import webpush from "web-push";

// Configuration de web-push avec les clés VAPID
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || "mailto:contact@jj-core.app",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, body: message, icon, badge, url, profileId } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: "Title and message are required" },
        { status: 400 }
      );
    }

    // Récupérer les subscriptions (filtrer par profileId si fourni)
    const subscriptions = await prisma.pushSubscription.findMany({
      where: profileId ? { profileId } : {},
    });

    if (subscriptions.length === 0) {
      return NextResponse.json(
        { error: "No subscriptions found" },
        { status: 404 }
      );
    }

    // Payload de la notification
    const payload = JSON.stringify({
      title,
      body: message,
      icon: icon || "/icon-192x192.png",
      badge: badge || "/icon-192x192.png",
      url: url || "/",
      timestamp: Date.now(),
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
          return { success: false, endpoint: sub.endpoint, error: err.message || "Unknown error" };
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
      message: `Notification sent to ${successful} device(s)`,
      total: results.length,
      successful,
      failed,
      results: results.map((r) =>
        r.status === "fulfilled" ? r.value : { success: false, error: r.reason }
      ),
    });
  } catch (error) {
    console.error("Error sending push notification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
