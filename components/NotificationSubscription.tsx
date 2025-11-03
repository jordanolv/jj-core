"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, BellOff, Loader2 } from "lucide-react";

interface NotificationSubscriptionProps {
  profileId?: string;
}

export function NotificationSubscription({ profileId }: NotificationSubscriptionProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    // Vérifier si les notifications push sont supportées
    if (
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window
    ) {
      setIsSupported(true);
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();
      setSubscription(existingSubscription);
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribe = async () => {
    if (!isSupported) {
      setMessage({
        type: "error",
        text: "Les notifications push ne sont pas supportées sur ce navigateur.",
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    // Timeout de 30 secondes
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
      setMessage({
        type: "error",
        text: "L'activation a pris trop de temps. Rafraîchissez la page et réessayez.",
      });
    }, 30000);

    try {
      console.log("[Notifications] Début de l'inscription...");

      // Demander la permission
      console.log("[Notifications] Demande de permission...");
      const permission = await Notification.requestPermission();
      console.log("[Notifications] Permission:", permission);

      if (permission !== "granted") {
        setMessage({
          type: "error",
          text: "Vous avez refusé les notifications. Veuillez les activer dans les paramètres de votre navigateur.",
        });
        setIsLoading(false);
        return;
      }

      // Enregistrer le service worker si nécessaire
      console.log("[Notifications] Récupération du service worker...");
      let registration = await navigator.serviceWorker.getRegistration();

      // En dev, utiliser sw-dev.js, en prod utiliser sw.js (généré par next-pwa)
      const isDev = process.env.NODE_ENV === "development";
      const swPath = isDev ? "/sw-dev.js" : "/sw.js";

      if (!registration) {
        console.log(`[Notifications] Enregistrement du service worker (${swPath})...`);
        registration = await navigator.serviceWorker.register(swPath, {
          scope: "/"
        });
      }

      // Attendre que le service worker soit installé et activé
      console.log("[Notifications] Attente du service worker...");

      if (registration.installing) {
        console.log("[Notifications] SW en cours d'installation...");
        await new Promise((resolve) => {
          registration!.installing!.addEventListener("statechange", function() {
            if (this.state === "activated") {
              resolve(undefined);
            }
          });
        });
      }

      registration = await navigator.serviceWorker.ready;
      console.log("[Notifications] Service worker prêt:", registration);

      // Récupérer la clé publique VAPID
      console.log("[Notifications] Récupération clé VAPID...");
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        throw new Error("VAPID public key not found");
      }
      console.log("[Notifications] Clé VAPID OK");

      // S'abonner aux notifications push
      console.log("[Notifications] Abonnement aux push...");
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
      console.log("[Notifications] Abonnement créé:", newSubscription);

      // Envoyer la subscription au serveur
      console.log("[Notifications] Envoi au serveur...");
      const response = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscription: newSubscription.toJSON(),
          profileId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("[Notifications] Erreur serveur:", errorData);
        throw new Error("Failed to subscribe");
      }

      const data = await response.json();
      console.log("[Notifications] Réponse serveur:", data);

      setSubscription(newSubscription);

      setMessage({
        type: "success",
        text: "Notifications activées ! Vous recevrez chaque matin le solde du mois.",
      });
      console.log("[Notifications] ✅ Inscription terminée avec succès !");
    } catch (error) {
      console.error("[Notifications] ❌ Erreur:", error);
      setMessage({
        type: "error",
        text: "Impossible d'activer les notifications. Veuillez réessayer.",
      });
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  const unsubscribe = async () => {
    if (!subscription) return;

    setIsLoading(true);
    setMessage(null);

    try {
      // Se désabonner côté client
      await subscription.unsubscribe();

      // Supprimer la subscription du serveur
      await fetch("/api/notifications/subscribe", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
        }),
      });

      setSubscription(null);

      setMessage({
        type: "success",
        text: "Notifications désactivées. Vous ne recevrez plus de notifications.",
      });
    } catch (error) {
      console.error("Error unsubscribing from push notifications:", error);
      setMessage({
        type: "error",
        text: "Impossible de désactiver les notifications. Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestNotification = async () => {
    setIsSendingTest(true);
    setMessage(null);

    try {
      const response = await fetch("/api/notifications/send-daily", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to send test notification");
      }

      const data = await response.json();

      setMessage({
        type: "success",
        text: `Notification de test envoyée ! Solde: ${new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "EUR",
        }).format(data.balance.balance)}`,
      });
    } catch (error) {
      console.error("Error sending test notification:", error);
      setMessage({
        type: "error",
        text: "Impossible d'envoyer la notification de test. Vérifiez que vous êtes bien abonné.",
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Notifications Push
          </CardTitle>
          <CardDescription>
            Les notifications push ne sont pas supportées sur ce navigateur ou appareil.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications Push
        </CardTitle>
        <CardDescription>
          Recevez une notification quotidienne avec le solde du mois en cours.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {message && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                message.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {message.type === "success" ? (
                <Bell className="h-4 w-4 flex-shrink-0" />
              ) : (
                <BellOff className="h-4 w-4 flex-shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}
          {subscription ? (
            <>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Bell className="h-4 w-4" />
                <span>Notifications activées</span>
              </div>
              <div className="space-y-2">
                <Button
                  onClick={sendTestNotification}
                  disabled={isSendingTest}
                  className="w-full"
                >
                  {isSendingTest ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Bell className="mr-2 h-4 w-4" />
                      Envoyer une notification de test
                    </>
                  )}
                </Button>
                <Button
                  onClick={unsubscribe}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Désactivation...
                    </>
                  ) : (
                    <>
                      <BellOff className="mr-2 h-4 w-4" />
                      Désactiver les notifications
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="text-sm text-muted-foreground">
                Cliquez sur le bouton ci-dessous pour activer les notifications.
                Vous recevrez chaque matin un résumé du solde de votre budget.
              </div>
              <Button
                onClick={subscribe}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Activation...
                  </>
                ) : (
                  <>
                    <Bell className="mr-2 h-4 w-4" />
                    Activer les notifications
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
