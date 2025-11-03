# 🔔 Notifications Push - Guide

Ce document explique comment fonctionnent les notifications push dans l'application JJ-Core.

## ✨ Fonctionnalités

- 📱 **Notifications quotidiennes** : Chaque matin à 8h, recevez le solde de votre budget du mois en cours
- 🔐 **Sécurisé** : Utilise Web Push API natif avec des clés VAPID
- 🌐 **Cross-platform** : Fonctionne sur iOS (via PWA installée) et Android
- 🎯 **Simple** : Activation/désactivation en un clic depuis les paramètres

## 📋 Configuration (déjà faite)

### 1. Clés VAPID générées
Les clés sont déjà dans `.env` :
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` : Clé publique (accessible côté client)
- `VAPID_PRIVATE_KEY` : Clé privée (serveur uniquement)
- `VAPID_SUBJECT` : Email de contact

### 2. Base de données
Le modèle `PushSubscription` a été ajouté à Prisma pour stocker les abonnements.

### 3. API Routes
- **POST /api/notifications/subscribe** : S'abonner aux notifications
- **DELETE /api/notifications/subscribe** : Se désabonner
- **GET /api/notifications/subscribe** : Lister les abonnements
- **POST /api/notifications/send** : Envoyer une notification manuelle
- **POST /api/notifications/send-daily** : Endpoint pour le cron quotidien
- **GET /api/notifications/send-daily** : Tester le calcul du solde sans envoyer

### 4. Cron Job (Vercel)
Configuré dans `vercel.json` :
```json
{
  "crons": [
    {
      "path": "/api/notifications/send-daily",
      "schedule": "0 8 * * *"
    }
  ]
}
```

## 🚀 Utilisation

### Pour l'utilisateur final

1. **Ouvrir l'application** sur mobile (iOS ou Android)
2. **Aller dans Paramètres** (icône ⚙️ dans le header)
3. **Cliquer sur "Activer les notifications"**
4. **Accepter la permission** dans le popup du navigateur
5. **C'est tout !** Vous recevrez chaque matin une notification avec votre solde

### Pour iOS (important)
Sur iOS/Safari, les notifications push nécessitent que l'application soit **installée sur l'écran d'accueil** :
1. Ouvrir Safari et aller sur votre app
2. Cliquer sur le bouton "Partager" (carré avec flèche)
3. Choisir "Sur l'écran d'accueil"
4. Ouvrir l'app depuis l'écran d'accueil
5. Activer les notifications dans les paramètres

### Pour Android
Fonctionne directement dans Chrome/Firefox sans installation obligatoire.

## 🧪 Tests en développement

### Tester l'abonnement
1. Lancer l'app : `npm run dev`
2. Aller sur `http://localhost:4490/settings`
3. Cliquer sur "Activer les notifications"
4. Vérifier dans la console que la subscription est créée

### Envoyer une notification de test
Vous pouvez utiliser l'API directement :

```bash
# Envoyer une notification manuelle
curl -X POST http://localhost:4490/api/notifications/send \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "title": "Test notification",
    "body": "Ceci est un test",
    "url": "/budget"
  }'
```

### Tester le calcul du solde (sans envoyer)
```bash
curl http://localhost:4490/api/notifications/send-daily \
  -H "Cookie: your-session-cookie"
```

### Envoyer la notification quotidienne manuellement
```bash
curl -X POST http://localhost:4490/api/notifications/send-daily \
  -H "Cookie: your-session-cookie"
```

## 🌐 Déploiement sur Vercel

### Variables d'environnement à configurer

Dans les settings Vercel de votre projet, ajouter :

```env
# Notifications Push
NEXT_PUBLIC_VAPID_PUBLIC_KEY="BMrjMwEYLYC4tb2sVq66JxqcvmttLoCy-wS2SkCQrI7W2WPO52pfQk6dKLdjrOEG-uAWIoIrj8-h8icY0ASv2w8"
VAPID_PRIVATE_KEY="Bk047OkqEMvHdFo704l7H9oGQlHd6e7ykZFUq3cpIL0"
VAPID_SUBJECT="mailto:contact@jj-core.app"

# (Optionnel) Secret pour sécuriser le cron
# Vercel ajoute automatiquement un header d'authentification pour les crons
# Vous pouvez donc laisser cette variable vide en production
```

### Vérifier que le cron fonctionne

1. Déployer sur Vercel
2. Aller dans l'onglet "Cron Jobs" de votre projet
3. Vérifier que le job `0 8 * * *` apparaît
4. Vous pouvez le déclencher manuellement pour tester

## 📊 Format de la notification quotidienne

Exemple de notification envoyée chaque matin :

```
💰 Solde Novembre
Revenus: 2 500,00 € | Dépenses: 1 850,00 € | Solde: 650,00 €
```

Si le solde est négatif, l'emoji change en ⚠️ :

```
⚠️ Solde Novembre
Revenus: 2 500,00 € | Dépenses: 2 750,00 € | Solde: -250,00 €
```

## 🔧 Architecture technique

### Service Worker
- `public/sw.js` : Service worker principal (généré par next-pwa)
- `public/sw-push.js` : Gestionnaire de notifications push (custom)

### Composants React
- `components/NotificationSubscription.tsx` : Composant d'abonnement

### API Backend
- `app/api/notifications/subscribe/route.ts` : Gestion des abonnements
- `app/api/notifications/send/route.ts` : Envoi de notifications
- `app/api/notifications/send-daily/route.ts` : Notification quotidienne + calcul du solde

### Base de données
```prisma
model PushSubscription {
  id         String   @id @default(cuid())
  endpoint   String   @unique
  p256dh     String
  auth       String
  profileId  String?
  userAgent  String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

## ⚠️ Limitations connues

1. **iOS Safari** : Nécessite que la PWA soit installée sur l'écran d'accueil
2. **Notifications en arrière-plan** : Fonctionne uniquement si le service worker est actif
3. **Permissions** : L'utilisateur doit accepter les permissions navigateur

## 🐛 Debugging

### Les notifications ne s'affichent pas

1. Vérifier que le service worker est actif :
   ```javascript
   navigator.serviceWorker.ready.then(reg => console.log(reg))
   ```

2. Vérifier la subscription :
   ```javascript
   navigator.serviceWorker.ready.then(reg =>
     reg.pushManager.getSubscription().then(sub => console.log(sub))
   )
   ```

3. Vérifier les permissions :
   ```javascript
   console.log(Notification.permission) // devrait être "granted"
   ```

4. Regarder la console du service worker dans DevTools :
   - Chrome : DevTools > Application > Service Workers
   - Safari : Develop > Service Workers

### Le cron ne se déclenche pas

1. Vérifier que `vercel.json` est bien présent à la racine
2. Vérifier dans les logs Vercel que le cron s'exécute
3. S'assurer que les variables d'environnement sont définies

## 📝 Notes importantes

- **Rechargement du Service Worker** : En développement, pensez à "Update on reload" dans DevTools
- **Cache** : Si vous modifiez `sw-push.js`, pensez à vider le cache et recharger
- **Production** : Sur Vercel, le service worker est automatiquement mis à jour à chaque déploiement

## 🎉 C'est prêt !

Le système de notifications est maintenant opérationnel. Vous recevrez chaque matin à 8h une notification avec le solde de votre budget du mois en cours ! 🚀
