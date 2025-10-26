# JJ Platform

Plateforme web personnalisée pour Jordan & Juliette - Une alternative simplifiée à Notion.

## 🚀 Fonctionnalités

### 🔐 Authentification
- Compte unique avec mot de passe
- Sélection de profil (Jordan ou Juliette)

### 📦 Modules

#### 🍳 Cuisine
- Créer et gérer vos recettes personnelles
- Temps de préparation et cuisson
- Catégories et favoris
- Recherche de recettes

#### 💰 Argent
- Suivi des abonnements (mensuel, annuel, hebdomadaire)
- Calcul automatique des coûts mensuels et annuels
- Catégorisation (streaming, sport, logiciel, etc.)
- Statistiques détaillées

#### 🐾 Animaux
- Gestion des gardes d'animaux
- Suivi des revenus
- Graphiques et statistiques (revenus mensuels, répartition par type d'animal)
- Filtrage par statut (confirmé, terminé, annulé)

## 🛠️ Stack technique

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: PostgreSQL + Prisma ORM
- **Charts**: Recharts
- **Icons**: Lucide React

## 📦 Installation

### Prérequis
- Node.js 18+
- PostgreSQL

### Étapes

1. **Installer les dépendances**
```bash
npm install
```

2. **Configurer la base de données**

Modifier le fichier `.env` avec vos informations PostgreSQL :
```env
DATABASE_URL="postgresql://user:password@localhost:5432/jj_platform?schema=public"
```

3. **Initialiser la base de données**
```bash
npx prisma generate
npx prisma db push
```

4. **Créer les profils initiaux (optionnel)**

Vous pouvez créer les profils Jordan et Juliette via Prisma Studio :
```bash
npx prisma studio
```

Ou via un script seed (à créer).

5. **Lancer le serveur de développement**
```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 🔑 Connexion

**Mot de passe par défaut**: `jjplatform`

⚠️ **Important**: Changez ce mot de passe en production !

## 📁 Structure du projet

```
jj-platform/
├── app/
│   ├── page.tsx              # Page de login et sélection profil
│   ├── dashboard/            # Dashboard principal
│   ├── cuisine/              # Module Cuisine
│   ├── argent/               # Module Argent
│   └── animaux/              # Module Animaux
├── components/
│   └── ui/                   # Composants UI réutilisables
├── lib/
│   ├── db.ts                 # Configuration Prisma
│   └── utils.ts              # Utilitaires
└── prisma/
    └── schema.prisma         # Schéma de base de données
```

## 🎨 Design

L'interface est conçue pour être :
- **Moderne**: Design type application avec dégradés et animations
- **Responsive**: Fonctionne sur mobile, tablette et desktop
- **Intuitive**: Navigation simple et claire

## 📝 À faire

- [ ] Implémenter NextAuth pour une vraie authentification
- [ ] Ajouter les formulaires complets pour créer/éditer les données
- [ ] Implémenter les API routes pour persister en BDD
- [ ] Ajouter l'édition et suppression des items
- [ ] Upload d'images pour les recettes
- [ ] Export des données (PDF, Excel)
- [ ] Thème sombre
- [ ] Notifications pour les gardes à venir
- [ ] Rappels pour les renouvellements d'abonnements

## 🔧 Développement

### Commandes utiles

```bash
# Développement
npm run dev

# Build production
npm run build
npm start

# Prisma
npx prisma studio          # Interface graphique BDD
npx prisma generate        # Générer le client Prisma
npx prisma db push         # Pousser le schéma vers la BDD
npx prisma migrate dev     # Créer une migration

# Linter
npm run lint
```

## 📄 Licence

Projet personnel - Tous droits réservés
