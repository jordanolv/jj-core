import { Hono } from 'hono';
import { z } from 'zod';
import { notificationRegistry } from './registry';
import { notificationService } from './service';
import { notificationDb } from './db';
import { betterAuthMiddleware, AuthUser } from '../../middleware/better-auth';

const router = new Hono<{ Variables: { user: AuthUser; profileId: string } }>();

router.get('/types', (c) => {
  const types = notificationRegistry.getAll().map((n) => ({
    type: n.type,
    label: n.label,
    description: n.description,
    category: n.category,
    userSubscribable: n.userSubscribable ?? true,
    defaultEnabled: n.defaultEnabled ?? false,
    hasSchedule: !!n.schedule,
  }));

  return c.json({ types });
});

router.get('/vapid-public-key', (c) => {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  if (!publicKey) {
    return c.json({ error: 'VAPID keys not configured' }, 503);
  }
  return c.json({ publicKey });
});

router.use('*', betterAuthMiddleware);

router.use('*', async (c, next) => {
  const profileId = c.req.header('X-Profile-Id');
  if (!profileId) {
    return c.json({ error: 'Profile ID requis' }, 400);
  }
  c.set('profileId', profileId);
  await next();
});

router.get('/subscriptions', async (c) => {
  const profileId = c.get('profileId');
  const subscriptions = await notificationDb.getProfileSubscriptions(profileId);
  return c.json({ subscriptions });
});

const subscribeSchema = z.object({
  notificationType: z.string(),
  enabled: z.boolean().default(true),
});

router.post('/subscriptions', async (c) => {
  const profileId = c.get('profileId');
  const body = await c.req.json();
  const result = subscribeSchema.safeParse(body);

  if (!result.success) {
    return c.json({ error: 'Invalid request', details: result.error }, 400);
  }

  const { notificationType, enabled } = result.data;

  try {
    await notificationService.subscribe(profileId, notificationType, enabled);
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Subscription failed' }, 400);
  }
});

const pushSubscriptionSchema = z.object({
  endpoint: z.string(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});

router.post('/push-subscription', async (c) => {
  const profileId = c.get('profileId');
  const body = await c.req.json();
  const result = pushSubscriptionSchema.safeParse(body);

  if (!result.success) {
    return c.json({ error: 'Invalid push subscription', details: result.error }, 400);
  }

  await notificationService.savePushSubscription(profileId, result.data as PushSubscriptionJSON);
  return c.json({ success: true });
});

router.delete('/push-subscription', async (c) => {
  const endpoint = c.req.query('endpoint');
  if (!endpoint) {
    return c.json({ error: 'endpoint query parameter required' }, 400);
  }

  await notificationDb.deletePushSubscription(endpoint);
  return c.json({ success: true });
});

const sendSchema = z.object({
  notificationType: z.string(),
  context: z.record(z.any()).optional(),
});

router.post('/send', async (c) => {
  const profileId = c.get('profileId');
  const body = await c.req.json();
  const result = sendSchema.safeParse(body);

  if (!result.success) {
    return c.json({ error: 'Invalid request', details: result.error }, 400);
  }

  const { notificationType, context } = result.data;

  try {
    const success = await notificationService.send({
      profileId,
      notificationType,
      context,
    });
    return c.json({ success });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Send failed' }, 500);
  }
});

router.get('/logs', async (c) => {
  const profileId = c.get('profileId');
  const limit = parseInt(c.req.query('limit') || '50');
  const logs = await notificationDb.getNotificationLogs(profileId, limit);

  return c.json({ logs });
});

export const notificationRouter = router;
