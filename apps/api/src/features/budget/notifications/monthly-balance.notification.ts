import type { NotificationDefinition } from '../../notifications/types';
import { budgetCollections } from '../db';

export const monthlyBalanceNotification: NotificationDefinition = {
  type: 'monthly_balance',
  label: 'Solde mensuel',
  description: 'Résumé du budget du mois en cours envoyé chaque matin à 8h',
  category: 'budget',
  schedule: '0 8 * * *',
  userSubscribable: true,
  defaultEnabled: false,

  handler: async (profileId?: string) => {
    if (!profileId) {
      throw new Error('profileId requis pour monthly_balance');
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const { expenses, incomes } = await budgetCollections();

    const expenseList = await expenses.find({ profileId, year, month }).toArray();
    const incomeList = await incomes.find({ profileId, year, month }).toArray();

    const totalExpenses = expenseList.reduce((sum, e) => sum + e.amount, 0);
    const totalIncomes = incomeList.reduce((sum, i) => sum + i.amount, 0);
    const balance = totalIncomes - totalExpenses;

    const monthName = new Date(year, month - 1).toLocaleDateString('fr-FR', { month: 'long' });

    return {
      title: `💰 Solde de ${monthName}`,
      body: `Revenus: ${totalIncomes}€ | Dépenses: ${totalExpenses}€ | Solde: ${balance}€`,
      data: {
        year,
        month,
        totalIncomes,
        totalExpenses,
        balance,
      },
      icon: '/icon.png',
      tag: 'monthly-balance',
    };
  },
};
