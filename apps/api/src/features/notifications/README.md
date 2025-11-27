# Système de Notifications

Architecture hybride : infrastructure globale + notifications définies dans chaque feature.

## Structure

```
features/
  notifications/          # Infrastructure globale
    types.ts             # Types et interfaces
    registry.ts          # Scan et enregistrement automatique
    service.ts           # Service d'envoi (push notifications)
    db.ts                # Couche base de données
    routes.ts            # API REST

  budget/
    notifications/       # Notifications métier Budget
      monthly-balance.notification.ts
      daily-expenses.notification.ts
      subscription-reminder.notification.ts

  gardes/
    notifications/       # Notifications métier Gardes (à venir)
      garde-today.notification.ts
      garde-tomorrow.notification.ts
```

## Créer une nouvelle notification

### 1. Créer un fichier `.notification.ts` dans votre feature

```typescript
// features/budget/notifications/example.notification.ts
import type { NotificationDefinition } from '../../notifications/types';

export const exampleNotification: NotificationDefinition = {
  type: 'example_notif',
  label: 'Exemple de notification',
  description: 'Description pour l\'utilisateur',
  category: 'budget',
  schedule: '0 8 * * *',        // Cron (optionnel)
  userSubscribable: true,       // L'utilisateur peut s'abonner
  defaultEnabled: false,        // Désactivé par défaut

  handler: async (profileId?: string, context?: Record<string, any>) => {
    // Logique métier ici
    const data = await fetchSomeData(profileId);

    return {
      title: '💰 Titre de la notification',
      body: 'Corps du message',
      data: { custom: 'data' },
      icon: '/icon.png',
      tag: 'example',
    };
  },
};
```

### 2. C'est tout !

Le système scanne automatiquement tous les fichiers `**/notifications/*.notification.ts` au démarrage et les enregistre.

## API Endpoints

### Public (pas d'auth)
- `GET /notifications/types` - Liste des types de notifications disponibles
- `GET /notifications/vapid-public-key` - Clé publique VAPID pour push

### Protégés (auth + X-Profile-Id)
- `GET /notifications/subscriptions` - Abonnements du profil
- `POST /notifications/subscriptions` - S'abonner/se désabonner
- `POST /notifications/push-subscription` - Sauvegarder une subscription push
- `DELETE /notifications/push-subscription?endpoint=...` - Supprimer une subscription
- `POST /notifications/send` - Envoyer une notification manuellement
- `GET /notifications/logs?limit=50` - Historique des notifications

## Variables d'environnement

```bash
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:email@example.com
```

Générer des clés VAPID :
```bash
npx web-push generate-vapid-keys
```

## Collections MongoDB

- `notification_subscriptions` - Abonnements des utilisateurs
- `push_subscriptions` - Subscriptions push (endpoints)
- `notification_logs` - Historique des envois

## Utilisation programmatique

```typescript
import { notificationService } from './features/notifications/service';

// Envoyer à un utilisateur
await notificationService.send({
  profileId: 'profile-123',
  notificationType: 'monthly_balance',
  context: { additionalData: 'value' }
});

// Broadcast à tous les abonnés
await notificationService.sendToAllSubscribers('daily_expenses');

// Abonner un utilisateur
await notificationService.subscribe('profile-123', 'monthly_balance', true);
```

## Notifications existantes

### Budget
- `monthly_balance` - Solde du mois (8h tous les jours)
- `daily_expenses` - Dépenses du jour (20h tous les jours)
- `subscription_reminder` - Rappel abonnements (9h le 1er du mois)

## TODO
- [ ] Scheduler cron pour les notifications automatiques
- [ ] Notifications email (en plus du push)
- [ ] Template system pour les notifications
- [ ] Préférences avancées (horaires personnalisés)
