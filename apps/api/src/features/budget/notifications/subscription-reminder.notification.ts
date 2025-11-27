import type { NotificationDefinition } from '../../notifications/types';
import { budgetCollections } from '../db';

export const subscriptionReminderNotification: NotificationDefinition = {
  type: 'subscription_reminder',
  label: 'Rappel d\'abonnements',
  description: 'Rappel des abonnements actifs envoyé le 1er de chaque mois à 9h',
  category: 'budget',
  schedule: '0 9 1 * *',
  userSubscribable: true,
  defaultEnabled: true,

  handler: async (profileId?: string) => {
    if (!profileId) {
      throw new Error('profileId requis pour subscription_reminder');
    }

    const { subscriptions } = await budgetCollections();

    const activeSubscriptions = await subscriptions
      .find({
        profileId,
        active: true,
      })
      .toArray();

    if (activeSubscriptions.length === 0) {
      return {
        title: '📝 Aucun abonnement actif',
        body: 'Vous n\'avez pas d\'abonnements enregistrés',
        data: {
          count: 0,
        },
        icon: '/icon.png',
        tag: 'subscription-reminder',
      };
    }

    const totalMonthly = activeSubscriptions
      .filter((s) => s.frequency === 'monthly')
      .reduce((sum, s) => sum + s.amount, 0);

    const monthlyCount = activeSubscriptions.filter((s) => s.frequency === 'monthly').length;
    const yearlyCount = activeSubscriptions.filter((s) => s.frequency === 'yearly').length;

    return {
      title: `📝 Rappel abonnements (${activeSubscriptions.length})`,
      body: `${monthlyCount} mensuels (${totalMonthly}€/mois), ${yearlyCount} annuels`,
      data: {
        count: activeSubscriptions.length,
        monthlyCount,
        yearlyCount,
        totalMonthly,
        subscriptions: activeSubscriptions.map((s) => ({
          name: s.name,
          amount: s.amount,
          frequency: s.frequency,
        })),
      },
      icon: '/icon.png',
      tag: 'subscription-reminder',
    };
  },
};
