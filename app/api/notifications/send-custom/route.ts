import { NextRequest, NextResponse } from "next/server";
import { sendNotificationToAll, NotificationData } from "@/lib/notifications";

// Sécuriser avec un secret
const CRON_SECRET = process.env.CRON_SECRET;

/**
 * Route API pour envoyer des notifications customisées
 *
 * Usage:
 * POST /api/notifications/send-custom?secret=xxx
 * Body: {
 *   "title": "Mon titre",
 *   "body": "Mon message",
 *   "icon": "/icon-192x192.png" (optional),
 *   "badge": "/icon-192x192.png" (optional),
 *   "tag": "custom-notif" (optional)
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // Vérifier l'authentification en production
    if (process.env.NODE_ENV === "production") {
      const secret = req.nextUrl.searchParams.get("secret");
      if (CRON_SECRET && secret !== CRON_SECRET) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
    }

    const body = await req.json();

    // Validation
    if (!body.title || !body.body) {
      return NextResponse.json(
        { error: "Missing 'title' or 'body' in request body" },
        { status: 400 }
      );
    }

    // Créer la notification avec les valeurs par défaut si non fournies
    const notification: NotificationData = {
      title: body.title,
      body: body.body,
      icon: body.icon || "/icon-192x192.png",
      badge: body.badge || "/icon-192x192.png",
      tag: body.tag || `custom-${Date.now()}`,
      data: {
        type: "custom",
        timestamp: new Date().toISOString(),
        ...body.data, // Permet d'ajouter des données custom
      },
    };

    // Envoyer à tous les appareils
    const result = await sendNotificationToAll(notification);

    return NextResponse.json({
      success: true,
      result,
      notification,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Custom Notification] Error:", error);
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
 * GET pour voir l'usage
 */
export async function GET() {
  return NextResponse.json({
    message: "Custom Notification API",
    usage: {
      method: "POST",
      endpoint: "/api/notifications/send-custom",
      body: {
        title: "Titre de la notification (required)",
        body: "Message de la notification (required)",
        icon: "/icon-192x192.png (optional)",
        badge: "/icon-192x192.png (optional)",
        tag: "custom-tag (optional)",
        data: {
          custom: "data (optional)",
        },
      },
    },
    example: `
curl -X POST http://localhost:4490/api/notifications/send-custom \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "🎉 Test",
    "body": "Ceci est un message custom!"
  }'
    `,
  });
}
