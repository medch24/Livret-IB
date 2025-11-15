# 🚀 Guide de Déploiement Vercel - Livret IB

## ⚠️ Problème rencontré

Erreur sur Vercel : **"Cannot save contribution: Database not connected"**

### Cause

Les fichiers `.env.local` ne sont **PAS lus par Vercel**. Les variables d'environnement doivent être configurées dans le **dashboard Vercel**.

---

## ✅ Solution : Configuration des variables d'environnement

### Étape 1 : Accéder au Dashboard Vercel

1. Allez sur : **https://vercel.com/dashboard**
2. Connectez-vous avec votre compte
3. Sélectionnez le projet **`livret-ib2026`**

### Étape 2 : Configurer les variables

1. Cliquez sur **Settings** (dans le menu du projet)
2. Allez dans **Environment Variables**
3. Cliquez sur **Add New** pour chaque variable

| Nom de la variable | Valeur |
|-------------------|--------|
| `MONGODB_URI` | `mongodb+srv://mohamedsherif:Mmedch86@livret2026.9owu7hs.mongodb.net/?appName=Livret2026` |
| `DB_NAME` | `teacherContributionsDB` |

### Étape 3 : Choisir les environnements

Pour chaque variable, cochez :
- ✅ **Production**
- ✅ **Preview**
- ✅ **Development**

### Étape 4 : Sauvegarder

Cliquez sur **Save** pour chaque variable.

### Étape 5 : Redéployer

Vercel va automatiquement redéployer l'application. Si ce n'est pas le cas :

1. Allez dans l'onglet **Deployments**
2. Cliquez sur les **trois points (...)** du dernier déploiement
3. Sélectionnez **Redeploy**

---

## 🧪 Vérification

Une fois déployé :

1. Ouvrez votre site : **https://livret-ib2026.vercel.app**
2. Ouvrez la **console développeur** (F12)
3. Allez dans l'onglet **Network**
4. Testez l'enregistrement d'une contribution
5. Vérifiez qu'il n'y a plus d'erreur HTTP 500

### Vérifier les logs

Dans Vercel :
1. Allez dans **Deployments**
2. Cliquez sur le dernier déploiement
3. Allez dans **Functions** > Cliquez sur votre fonction
4. Vérifiez les logs pour voir :
   ```
   ✅ Successfully connected to MongoDB.
   ✅ Server initialized successfully
   ```

---

## 🔒 Sécurité MongoDB Atlas

Assurez-vous que votre base de données MongoDB Atlas autorise les connexions depuis Vercel :

1. Allez sur **https://cloud.mongodb.com**
2. Sélectionnez votre cluster **`livret2026`**
3. Allez dans **Network Access**
4. Ajoutez l'IP : **`0.0.0.0/0`** (autorise toutes les IPs)
   - ⚠️ **Note** : En production, vous pouvez restreindre aux IPs de Vercel

---

## 📝 Fichiers importants

- **`.env.production`** : Template des variables (RÉFÉRENCE UNIQUEMENT)
- **`VERCEL_SETUP.md`** : Guide détaillé de configuration
- **`api/index.js`** : Code backend avec logs d'erreur améliorés

---

## ❌ Dépannage

### Erreur persiste après configuration

1. **Vérifiez les variables** : Settings > Environment Variables
2. **Vérifiez l'orthographe** : `MONGODB_URI` (pas MONGO_URI)
3. **Redéployez manuellement** : Deployments > Redeploy
4. **Vérifiez MongoDB Atlas** : Network Access doit autoriser `0.0.0.0/0`

### Comment tester localement

```bash
# Créez un fichier .env.local (ignoré par Git)
echo "MONGODB_URI=mongodb+srv://mohamedsherif:Mmedch86@livret2026.9owu7hs.mongodb.net/?appName=Livret2026" > .env.local
echo "DB_NAME=teacherContributionsDB" >> .env.local

# Démarrez le serveur
node api/index.js
```

---

## 🎯 Résumé

| ❌ Ne PAS faire | ✅ À faire |
|----------------|-----------|
| Compter sur `.env.local` | Configurer dans Vercel Dashboard |
| Commiter les mots de passe | Utiliser les Environment Variables |
| Oublier de redéployer | Redéployer après chaque changement |

---

## 📞 Support

En cas de problème, vérifiez :
1. Les logs Vercel (Deployments > Function Logs)
2. La console navigateur (F12 > Network)
3. MongoDB Atlas (Database > Network Access)
