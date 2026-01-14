# 🔧 CORRECTION URGENTE - Variables d'environnement Vercel

## ❌ PROBLÈME IDENTIFIÉ

L'erreur que vous voyez:
```
Failed to load resource: the server responded with a status of 500 ()
Erreur 500: request to https://cdn.glitch.global/afba7f9d-6291-40ea-92bb-fe72daac96fd/...
failed, reason: getaddrinfo ENOTFOUND cdn.glitch.global
```

**Cause:** Les variables d'environnement sur Vercel pointent encore vers Glitch au lieu de Google Docs!

---

## ✅ SOLUTION IMMÉDIATE

### Option 1: Supprimer les variables Vercel (RECOMMANDÉ)

1. **Allez sur:** https://vercel.com/dashboard
2. **Sélectionnez votre projet:** Livret-IB
3. **Allez dans:** Settings → Environment Variables
4. **Supprimez ces 2 variables:**
   - ❌ `TEMPLATE_URL`
   - ❌ `TEMPLATE_URL_DP`
5. **Cliquez:** Save
6. **Redéployez:** Deployments → Plus récent → ... → Redeploy

**Résultat:** Le code utilisera automatiquement l'URL Google Docs par défaut.

---

### Option 2: Remplacer les valeurs (Alternative)

Si vous préférez garder les variables, remplacez leurs valeurs:

1. **Allez sur:** https://vercel.com/dashboard
2. **Sélectionnez:** Livret-IB → Settings → Environment Variables
3. **Modifiez:**

   **TEMPLATE_URL:**
   ```
   https://docs.google.com/document/d/18eo_E2ex8K5xu5ce6BQhN8MWi5mL_Nga/export?format=docx
   ```

   **TEMPLATE_URL_DP:**
   ```
   https://docs.google.com/document/d/18eo_E2ex8K5xu5ce6BQhN8MWi5mL_Nga/export?format=docx
   ```

4. **Cochez:** Production, Preview, Development
5. **Cliquez:** Save
6. **Redéployez**

---

## 📋 EXPLICATION

### Pourquoi cette erreur?

Le code a 2 sources pour l'URL du template:

```javascript
// Si TEMPLATE_URL_DP existe sur Vercel → utilise cette valeur
// Sinon → utilise Google Docs par défaut
const templateUrl = process.env.TEMPLATE_URL_DP 
    || 'https://docs.google.com/document/d/18eo_E2ex8K5xu5ce6BQhN8MWi5mL_Nga/export?format=docx';
```

**Le problème:** Vercel a encore l'ancienne URL Glitch dans `TEMPLATE_URL_DP`, donc le code utilise Glitch au lieu de Google Docs!

---

## 🎯 ÉTAPES PRÉCISES

### 1. Accéder aux variables Vercel

![Vercel Dashboard](https://vercel.com/dashboard)

1. Connectez-vous à Vercel
2. Cliquez sur votre projet **Livret-IB**
3. Cliquez sur **Settings** (onglet en haut)
4. Dans le menu de gauche, cliquez sur **Environment Variables**

### 2. Identifier les variables à modifier

Vous devriez voir:
- ✅ `MONGODB_URI` (à garder)
- ✅ `DB_NAME` (à garder)
- ❌ `TEMPLATE_URL` (à supprimer ou modifier)
- ❌ `TEMPLATE_URL_DP` (à supprimer ou modifier)

### 3. Supprimer ou modifier

**Pour supprimer:**
- Cliquez sur le bouton **...** à droite de la variable
- Sélectionnez **Delete**
- Confirmez

**Pour modifier:**
- Cliquez sur **Edit**
- Collez la nouvelle URL Google Docs:
  ```
  https://docs.google.com/document/d/18eo_E2ex8K5xu5ce6BQhN8MWi5mL_Nga/export?format=docx
  ```
- Cliquez **Save**

### 4. Redéployer

1. Allez dans **Deployments** (onglet en haut)
2. Trouvez le déploiement le plus récent (en haut de la liste)
3. Cliquez sur le bouton **...** à droite
4. Sélectionnez **Redeploy**
5. Attendez 2-3 minutes

---

## ✅ VÉRIFICATION

Après le redéploiement, testez:

1. Ouvrez: https://livret-ib.vercel.app
2. Sélectionnez: DP2 → garçons → Habib
3. Cliquez: Générer le livret
4. **Le fichier devrait se télécharger sans erreur!** ✅

---

## 🆘 SI VOUS AVEZ DES DIFFICULTÉS

### Captures d'écran à me fournir:

1. **Page des variables d'environnement Vercel**
   - Montrez-moi les variables actuelles
   - Masquez les valeurs sensibles (MONGODB_URI)

2. **Console de votre navigateur** (après redéploiement)
   - Ouvrez les outils développeur (F12)
   - Onglet Console
   - Tentez de générer un livret
   - Envoyez-moi la capture des erreurs

---

## 📞 RÉSUMÉ

**Action requise:** Modifier les variables Vercel

**Durée:** 5 minutes

**Étapes:**
1. ✅ Vercel Dashboard → Settings → Environment Variables
2. ✅ Supprimer `TEMPLATE_URL` et `TEMPLATE_URL_DP`
3. ✅ Redéployer
4. ✅ Tester

**Résultat attendu:** Le système utilisera Google Docs et tout fonctionnera!

---

**Date:** 2026-01-09  
**Urgence:** HAUTE  
**Action:** Modifier variables Vercel immédiatement
