# ⚡ GUIDE DE CONFIGURATION RAPIDE - VERCEL

## 🎯 OBJECTIF

Configurer la variable d'environnement `TEMPLATE_URL_DP` pour activer le modèle Word séparé des classes DP1 et DP2.

---

## 📋 ÉTAPES (5 minutes)

### Étape 1 : Accéder à Vercel

1. Ouvrir : **https://vercel.com**
2. Se connecter avec votre compte
3. Chercher le projet : **Livret-IB** ou **livret-scolaire-vercel**

### Étape 2 : Aller dans les paramètres

1. Cliquer sur le projet **Livret-IB**
2. Cliquer sur l'onglet **Settings** (en haut)
3. Dans le menu latéral, cliquer sur **Environment Variables**

### Étape 3 : Ajouter la nouvelle variable

1. Cliquer sur le bouton **Add New**
2. Remplir les champs :

```
┌─────────────────────────────────────────────────────────────┐
│ Key (Name)                                                  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ TEMPLATE_URL_DP                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Value                                                       │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ https://docs.google.com/document/d/10x3kKNk9TgCnlHKY... │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Valeur complète à copier-coller :**
```
https://docs.google.com/document/d/10x3kKNk9TgCnlHKY7SyZADB6ZCGeUhGd/export?format=docx
```

3. Cocher les environnements :
   - ✅ **Production**
   - ✅ **Preview**
   - ✅ **Development**

4. Cliquer sur **Save**

### Étape 4 : Redéployer

Vercel va vous proposer de redéployer automatiquement.

**Option A : Redéploiement automatique**
- Cliquer sur **Redeploy** quand Vercel le propose

**Option B : Redéploiement manuel**
1. Aller dans l'onglet **Deployments**
2. Cliquer sur les 3 points `...` du dernier déploiement
3. Cliquer sur **Redeploy**
4. Confirmer

### Étape 5 : Vérifier

Après le redéploiement (environ 2-3 minutes) :

1. Aller sur votre site
2. Sélectionner une section et la classe **DP2**
3. Sélectionner un élève (ex: Habib Lteif)
4. Cliquer sur **Générer le livret Word**
5. ✅ Le système va maintenant utiliser le modèle DP !

---

## 🔍 VÉRIFICATION DES LOGS

Pour vérifier que tout fonctionne :

1. Dans Vercel, aller dans **Deployments**
2. Cliquer sur le dernier déploiement (Status: Ready)
3. Cliquer sur **View Function Logs**
4. Générer un livret pour une classe DP2
5. Chercher dans les logs :

```
🎓 Class: DP2, isDP: true
✅ Template URL selected for DP class
🔄 Attempting to fetch Word template from: https://docs.google.com/document/d/10x3kKNk9TgCnlHKY7SyZADB6ZCGeUhGd/export?format=docx
✅ Successfully connected to template URL
```

---

## 📊 RÉCAPITULATIF DES VARIABLES

Après cette configuration, vous devriez avoir **4 variables** dans Vercel :

| Variable | Valeur | Utilisation |
|----------|--------|-------------|
| `MONGODB_URI` | mongodb+srv://... | Base de données |
| `DB_NAME` | teacherContributionsDB | Nom de la base |
| `TEMPLATE_URL` | ...18eo_E2ex8... | Modèle PEI (PEI1-PEI4) |
| `TEMPLATE_URL_DP` ⭐ | ...10x3kKNk9Tg... | Modèle DP (DP1-DP2) |

---

## ✅ CHECKLIST DE CONFIGURATION

- [ ] Connecté à Vercel
- [ ] Projet "Livret-IB" ouvert
- [ ] Onglet "Settings" → "Environment Variables" ouvert
- [ ] Variable `TEMPLATE_URL_DP` ajoutée
- [ ] Valeur : `https://docs.google.com/document/d/10x3kKNk9TgCnlHKY7SyZADB6ZCGeUhGd/export?format=docx`
- [ ] Environnements cochés : Production, Preview, Development
- [ ] Variable sauvegardée
- [ ] Projet redéployé
- [ ] Test avec DP2 réussi

---

## 🎨 CRÉER LE MODÈLE WORD DP

Maintenant que la variable est configurée, il faut créer le modèle :

### 1. Ouvrir le document Google Docs

```
https://docs.google.com/document/d/10x3kKNk9TgCnlHKY7SyZADB6ZCGeUhGd/edit
```

### 2. Suivre le guide

Ouvrir le fichier : **MODELE_DP1_DP2.md**

Ce guide contient :
- ✅ Liste complète des balises pour DP
- ✅ Matières à inclure (sans CAS, TDC, Mémoire)
- ✅ Structure du document
- ✅ Critères AO1-AO4 (au lieu de A-D)
- ✅ Note sur 7 (au lieu de 8)
- ✅ Exemples et checklist

### 3. Points clés à respecter

**À INCLURE :**
- ✅ Photo : `{image}`
- ✅ Nom : `{studentSelected}`
- ✅ Classe : `{className}`
- ✅ Date de naissance : `{studentBirthdate}`
- ✅ Critères : AO1, AO2, AO3, AO4
- ✅ Note finale : sur 7
- ✅ Matière : "Physique chimie" (pas "Physique")
- ✅ Matière : "Histoire géographie" (pas "Géographie")

**À EXCLURE :**
- ❌ CAS (Créativité, Activité, Service)
- ❌ TDC (Théorie de la Connaissance)
- ❌ Mémoire

### 4. Exemple de tableau des critères DP

```
┌────────────────────────────────────────────────────────────┐
│                    ÉVALUATION PAR CRITÈRES                 │
├───────────┬──────────────┬──────────────┬──────────────────┤
│ Critère   │ Semestre 1   │ Semestre 2   │ Niveau final    │
├───────────┼──────────────┼──────────────┼──────────────────┤
│ AO1       │              │              │                  │
│ {criteria │ {criteriaAO1 │ {criteriaAO1 │ {finalLevel.AO1} │
│ Name AO1} │    .sem1}    │    .sem2}    │                  │
├───────────┼──────────────┼──────────────┼──────────────────┤
│ AO2       │              │              │                  │
│ {criteria │ {criteriaAO2 │ {criteriaAO2 │ {finalLevel.AO2} │
│ Name AO2} │    .sem1}    │    .sem2}    │                  │
├───────────┼──────────────┼──────────────┼──────────────────┤
│ AO3       │              │              │                  │
│ {criteria │ {criteriaAO3 │ {criteriaAO3 │ {finalLevel.AO3} │
│ Name AO3} │    .sem1}    │    .sem2}    │                  │
├───────────┼──────────────┼──────────────┼──────────────────┤
│ AO4       │              │              │                  │
│ {criteria │ {criteriaAO4 │ {criteriaAO4 │ {finalLevel.AO4} │
│ Name AO4} │    .sem1}    │    .sem2}    │                  │
├───────────┴──────────────┴──────────────┴──────────────────┤
│ Seuil : {seuil}                                            │
│ Note finale : {note} / 7                                   │
└────────────────────────────────────────────────────────────┘
```

---

## 🚀 TESTS RECOMMANDÉS

### Test 1 : Classe PEI (vérifier que ça marche toujours)

1. Sélectionner : **Section A**, **PEI 2**
2. Sélectionner : **Ali Kutbi**
3. Générer le livret
4. ✅ Vérifier : Nom complet "Ali Kutbi", Photo 150x150

### Test 2 : Classe DP (nouveau modèle)

1. Sélectionner : **Section A**, **DP 2**
2. Sélectionner : **Habib Lteif**
3. Générer le livret
4. ✅ Vérifier : 
   - Nom complet "Habib Lteif"
   - Photo 150x150
   - Critères AO1-AO4 (pas A-D)
   - Note sur 7 (pas 8)
   - Matières : "Physique chimie", "Histoire géographie"
   - PAS de CAS, TDC, Mémoire

### Test 3 : Génération multiple

1. Sélectionner : **Section A**, **DP 2**
2. Cliquer sur **Générer tous les livrets (Word)**
3. ✅ Vérifier : 2 fichiers générés (Habib et Salah)

---

## 📞 SUPPORT ET DÉPANNAGE

### Problème 1 : Variable non prise en compte

**Symptôme :** Le système utilise toujours l'ancien modèle pour DP

**Solution :**
1. Vérifier que la variable existe dans Vercel
2. Vérifier qu'elle est activée pour "Production"
3. Redéployer le projet
4. Vider le cache du navigateur (Ctrl+Shift+R)

### Problème 2 : Erreur 500 pour DP

**Symptôme :** Erreur lors de la génération pour DP1 ou DP2

**Solution :**
1. Vérifier l'URL dans Vercel (copier-coller complet)
2. Vérifier que le document Google Docs est accessible publiquement
3. Tester l'URL directement dans le navigateur
4. Consulter les logs Vercel

### Problème 3 : Balises non remplacées

**Symptôme :** Le document contient `{criteriaAO1.sem1}` au lieu des valeurs

**Solution :**
1. Ouvrir le modèle Google Docs
2. Vérifier qu'il n'y a pas de soulignement rouge sur les balises
3. Retaper les balises problématiques manuellement
4. Enregistrer et attendre 1 minute (cache Google)
5. Retester la génération

### Problème 4 : Document vide ou incomplet

**Symptôme :** Le document est généré mais certaines sections sont vides

**Solution :**
1. Vérifier que les contributions existent dans la base de données
2. Vérifier que les boucles sont bien fermées : `{/contributionsBySubject}`
3. Consulter MODELE_DP1_DP2.md pour la structure correcte

---

## 📚 DOCUMENTATION DE RÉFÉRENCE

| Document | Description |
|----------|-------------|
| **RECAPITULATIF_FINAL_V2.md** | Vue d'ensemble complète |
| **MODELE_DP1_DP2.md** | Guide création modèle DP |
| **BALISES_MODELE_WORD.md** | Liste complète des balises |
| **CONFIGURATION_GOOGLE_DOCS.md** | Configuration avancée |
| **MODIFICATIONS_PHOTOS_NOMS.md** | Changements photos et noms |

---

## ✨ RÉSULTAT ATTENDU

Après configuration :

```
┌─────────────────────────────────────────────────────────────┐
│                     SYSTÈME LIVRET IB                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PEI1 ──┐                                                   │
│  PEI2 ──┤                                                   │
│  PEI3 ──┼──→  TEMPLATE_URL  ──→  Modèle PEI               │
│  PEI4 ──┘                         (A, B, C, D)             │
│                                   Note /8                   │
│                                                             │
│  DP1 ───┐                                                   │
│  DP2 ───┴──→  TEMPLATE_URL_DP ──→  Modèle DP              │
│                                     (AO1-AO4)               │
│                                     Note /7                 │
│                                     Sans CAS/TDC/Mémoire    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

**Configuration prête en 5 minutes ! ⚡**

**Besoin d'aide ?** Consultez **RECAPITULATIF_FINAL_V2.md** pour plus de détails.

---

**Date :** 2026-01-08  
**Version :** 1.0  
**Dépôt GitHub :** https://github.com/medch24/Livret-IB
