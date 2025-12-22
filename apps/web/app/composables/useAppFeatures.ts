export interface Feature {
  id: string;
  name: string;
  description: string;
  icon: string;
  route: string;
  gradient: string;
  hasSettings?: boolean;
}

export const useAppFeatures = () => {
  const features: Feature[] = [
    {
      id: 'budget',
      name: 'Budget',
      description: 'Gérer vos finances',
      icon: '💰',
      route: '/budget',
      gradient: 'from-emerald-500 to-green-600',
      hasSettings: true
    },
    {
      id: 'animaux',
      name: 'Animaux',
      description: 'Suivi des animaux',
      icon: '🐾',
      route: '/animaux',
      gradient: 'from-orange-500 to-amber-600',
      hasSettings: false
    },
    {
      id: 'cuisine',
      name: 'Cuisine',
      description: 'Recettes et repas',
      icon: '🍳',
      route: '/cuisine',
      gradient: 'from-rose-500 to-pink-600',
      hasSettings: false
    }
  ];

  const featuresWithSettings = computed(() =>
    features.filter(f => f.hasSettings)
  );

  return {
    features,
    featuresWithSettings,
  };
};
