# Scripts de migration

## Migration depuis l'ancienne base de données

Ce script permet de migrer les données de l'ancienne base PostgreSQL (Prisma) vers la nouvelle base MongoDB.

### Prérequis

1. L'ancienne base PostgreSQL doit être accessible
2. La nouvelle base MongoDB doit être configurée dans `.env`

### Configuration

Ajoute cette variable dans ton `.env` à la racine du projet :

```env
# URL de l'ancienne base PostgreSQL (si différente)
OLD_DATABASE_URL="prisma+postgres://localhost:51213/..."
```

Si cette variable n'est pas définie, le script utilisera l'URL par défaut de l'ancien projet.

### Utilisation

```bash
# Depuis la racine du projet
npm run migrate:old --workspace apps/api

# OU directement depuis apps/api
cd apps/api
npm run migrate:old
```

### Ce qui est migré

Le script migre les données suivantes :

1. **Profils** (`Profile` → `profiles`)
   - Transformation : utilise le nom (jordan/juliette) comme `_id`
   - Conserve l'ancien ID dans le champ `oldId`

2. **Gardes d'animaux** (`GardeAnimaux` → `gardes`)
   - Toutes les gardes avec leurs informations
   - Association au bon profil via le nom
   - Photos, notes, statut, etc.

3. **Budget** (revenus, dépenses, catégories)
   - Catégories par défaut (`DefaultBudgetCategory` → `budget_global_categories`)
   - Dépenses (`BudgetExpense` → `budget_expenses`)
   - Revenus (`BudgetIncome` → `budget_incomes`)
   - Catégories mensuelles (`BudgetCategory` → `budget_month_categories`)

### Sécurité

- Le script ne supprime aucune donnée de l'ancienne base
- Les données déjà migrées sont ignorées (via le champ `oldId`)
- Tu peux relancer le script sans risque de doublons

### Vérification

Après la migration, tu peux vérifier dans MongoDB :

```bash
# Ouvrir MongoDB Compass ou utiliser mongosh
mongosh

use jj-core

# Compter les documents migrés
db.profiles.countDocuments()
db.gardes.countDocuments()
db.budget_expenses.countDocuments()
db.budget_incomes.countDocuments()
```

### En cas d'erreur

Si une erreur survient :
1. Vérifie que l'ancienne base est accessible
2. Vérifie que MongoDB tourne (`mongod`)
3. Regarde les logs pour identifier le problème
4. Tu peux relancer le script sans problème
