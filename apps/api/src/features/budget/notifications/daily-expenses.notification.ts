import type { NotificationDefinition } from '../../notifications/types';
import { budgetCollections } from '../db';

export const dailyExpensesNotification: NotificationDefinition = {
  type: 'daily_expenses',
  label: 'Dépenses du jour',
  description: 'Résumé des dépenses de la journée envoyé chaque soir à 20h',
  category: 'budget',
  schedule: '0 20 * * *',
  userSubscribable: true,
  defaultEnabled: false,

  handler: async (profileId?: string) => {
    if (!profileId) {
      throw new Error('profileId requis pour daily_expenses');
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    const startOfDay = new Date(year, month - 1, day, 0, 0, 0);
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59);

    const { expenses } = await budgetCollections();

    const todayExpenses = await expenses
      .find({
        profileId,
        year,
        month,
        date: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      })
      .toArray();

    if (todayExpenses.length === 0) {
      return {
        title: '🎉 Aucune dépense aujourd\'hui',
        body: 'Bonne gestion de budget !',
        data: {
          year,
          month,
          day,
          totalExpenses: 0,
          count: 0,
        },
        icon: '/icon.png',
        tag: 'daily-expenses',
      };
    }

    const totalExpenses = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

    return {
      title: `📊 Dépenses du jour`,
      body: `${todayExpenses.length} dépense(s) : ${totalExpenses}€`,
      data: {
        year,
        month,
        day,
        totalExpenses,
        count: todayExpenses.length,
        expenses: todayExpenses.map((e) => ({
          description: e.description,
          amount: e.amount,
          category: e.categoryId,
        })),
      },
      icon: '/icon.png',
      tag: 'daily-expenses',
    };
  },
};
