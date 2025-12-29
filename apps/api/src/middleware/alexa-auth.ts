import { Context, Next } from "hono";

/**
 * Middleware pour vérifier le secret Alexa
 * Permet à Alexa d'accéder aux routes sans authentification utilisateur
 */
export async function alexaAuthMiddleware(c: Context, next: Next) {
  const alexaSecret = c.req.header("X-Alexa-Secret");
  const expectedSecret = process.env.ALEXA_SECRET;

  if (!expectedSecret) {
    console.error("[Alexa Auth] ALEXA_SECRET environment variable not set");
    return c.json({ error: "Service configuration error" }, 500);
  }

  if (!alexaSecret) {
    return c.json({ error: "Missing X-Alexa-Secret header" }, 401);
  }

  if (alexaSecret !== expectedSecret) {
    console.warn("[Alexa Auth] Invalid secret attempt");
    return c.json({ error: "Invalid Alexa secret" }, 401);
  }

  // Secret valide, continuer
  await next();
}
