# 📚 Documentation - Modèle Word Livret IB

## 🎯 Objectif

Cette documentation vous permet de **recréer le modèle Word** du Livret Scolaire IB sans affecter le code existant du site.

---

## 📁 Fichiers disponibles

### 1. `BALISES_MODELE_WORD.md` (📋 Guide complet)
**Le guide de référence principal**

- ✅ Liste exhaustive des **54 balises** à utiliser
- ✅ Descriptions détaillées de chaque balise
- ✅ Exemples de données générées
- ✅ Support PEI (A/B/C/D) et DP (AO1-AO4)
- ✅ Liste complète des matières supportées
- ✅ Conseils de mise en forme
- ✅ Checklist de validation

📖 **À lire en premier** pour comprendre le système complet.

---

### 2. `GUIDE_RAPIDE_CREATION.md` (🚀 Guide pratique)
**Le guide pas-à-pas pour créer le modèle**

- ✅ Étapes détaillées dans Word
- ✅ Instructions de création des tableaux
- ✅ Syntaxe des boucles DocxTemplater
- ✅ Modèle minimal fonctionnel
- ✅ Erreurs courantes à éviter
- ✅ Procédure de déploiement après création

📖 **À utiliser pendant** la création du modèle dans Word.

---

### 3. `EXEMPLE_MODELE_WORD.txt` (📄 Exemple visuel)
**Un modèle complet prêt à copier**

- ✅ Structure complète avec toutes les sections
- ✅ Mise en forme visuelle avec cadres
- ✅ Balises correctement placées
- ✅ Tableaux ATL et critères inclus
- ✅ Prêt à copier-coller dans Word

📖 **À copier-coller** comme base de départ.

---

### 4. `TABLEAU_RECAPITULATIF_BALISES.md` (📊 Référence rapide)
**Tableau compact de toutes les balises**

- ✅ Vue d'ensemble rapide
- ✅ Tableaux comparatifs PEI vs DP
- ✅ Exemples de valeurs
- ✅ Copier-coller rapide
- ✅ Checklist finale

📖 **À garder ouvert** pendant le travail pour référence rapide.

---

## 🔧 Comment recréer le modèle ?

### Option A : Méthode rapide (⚡ 15 minutes)

1. **Ouvrir** `EXEMPLE_MODELE_WORD.txt`
2. **Copier** tout le contenu
3. **Coller** dans un nouveau document Word
4. **Ajuster** la mise en forme (polices, couleurs, logos)
5. **Enregistrer** au format `.docx`
6. **Héberger** sur un CDN ou GitHub
7. **Mettre à jour** l'URL dans `api/index.js`

✅ **Avantage** : Modèle fonctionnel immédiatement

---

### Option B : Méthode personnalisée (🎨 1-2 heures)

1. **Lire** `BALISES_MODELE_WORD.md` pour comprendre le système
2. **Suivre** `GUIDE_RAPIDE_CREATION.md` étape par étape
3. **Créer** votre propre design dans Word
4. **Insérer** les balises selon vos préférences
5. **Référencer** `TABLEAU_RECAPITULATIF_BALISES.md` pour les balises
6. **Valider** avec la checklist
7. **Enregistrer** au format `.docx`
8. **Héberger** et mettre à jour l'URL

✅ **Avantage** : Modèle personnalisé à votre goût

---

## 🎯 Structure des balises

### Format général
```
{nomDeLaBalise}      → Balise simple
{#nomBoucle}         → Début de boucle
{/nomBoucle}         → Fin de boucle
```

### Exemple pratique
```
Élève : {studentSelected}
Classe : {className}

{#contributionsBySubject}
  Matière : {subjectSelected}
  Professeur : {teacherName}
  Note : {note}
{/contributionsBySubject}
```

---

## 📊 Types de données générées

### 1. Informations élève (3 balises)
- Nom complet
- Classe
- Date de naissance

### 2. Tableau ATL (1 boucle, 6 balises)
- Liste de toutes les matières
- 5 compétences ATL par matière

### 3. Détails par matière (1 boucle, 44+ balises)
- Informations générales (matière, prof, commentaire)
- Critères PEI (A, B, C, D) avec 5 balises chacun
- Objectifs DP (AO1-AO4) avec 5 balises chacun
- Notes finales et totaux

---

## ⚠️ Points importants

### ✅ Ce qui fonctionne automatiquement

- ✅ Détection PEI vs DP (le code adapte automatiquement)
- ✅ Calcul des notes finales
- ✅ Formatage des dates en français
- ✅ Remplacement des valeurs manquantes par "-"
- ✅ Boucles sur plusieurs matières

### ⚠️ Ce que vous devez faire

- ⚠️ Inclure TOUTES les balises (PEI + DP) dans le modèle
- ⚠️ Respecter exactement la casse des balises
- ⚠️ Fermer toutes les boucles ouvertes
- ⚠️ Enregistrer au format .docx (pas .doc)
- ⚠️ Héberger le fichier sur un CDN accessible

---

## 🚀 Après création du modèle

### Étape 1 : Héberger le fichier

**Options recommandées :**

#### A. GitHub Releases (gratuit, recommandé)
```bash
1. Aller sur https://github.com/medch24/Livret-IB
2. Cliquer sur "Releases" → "Create a new release"
3. Upload votre fichier .docx
4. Publier le release
5. Copier l'URL du fichier
```

#### B. Cloudinary (gratuit, CDN rapide)
```bash
1. Créer compte sur cloudinary.com
2. Upload le fichier .docx
3. Copier l'URL publique
```

#### C. Google Drive (gratuit, simple)
```bash
1. Upload sur Google Drive
2. Clic droit → Partager → Accès public
3. Copier le lien de partage
4. Convertir en lien direct avec des outils en ligne
```

---

### Étape 2 : Mettre à jour le code

Éditer le fichier `api/index.js` (lignes 332-336) :

```javascript
const templateURLs = [
    'VOTRE_URL_1',  // GitHub Release
    'VOTRE_URL_2',  // Cloudinary
    'VOTRE_URL_3'   // Backup URL
];
```

**Exemple :**
```javascript
const templateURLs = [
    'https://github.com/medch24/Livret-IB/releases/download/v1.0/Livret_Modele.docx',
    'https://res.cloudinary.com/votre-compte/raw/upload/v123/Livret_Modele.docx',
    'https://drive.google.com/uc?export=download&id=VOTRE_ID'
];
```

---

### Étape 3 : Déployer

```bash
git add api/index.js
git commit -m "chore: update Word template URL with new hosted file"
git push origin main
```

Vercel déploiera automatiquement les changements.

---

## 🧪 Tester le modèle

Après déploiement :

1. **Se connecter** au site
2. **Sélectionner** une section et classe
3. **Cliquer** sur "Générer Tous les Livrets (Word)"
4. **Vérifier** qu'un fichier .docx est téléchargé
5. **Ouvrir** le document et vérifier :
   - ✅ Nom de l'élève correct
   - ✅ Toutes les matières présentes
   - ✅ Notes et critères affichés
   - ✅ Commentaires des professeurs
   - ✅ Pas de balises non remplacées (ex: `{studentSelected}` visible)

---

## 🐛 Résolution de problèmes

### Problème : Balises visibles dans le document généré

**Cause :** Faute de frappe dans les balises ou balise non reconnue

**Solution :**
1. Ouvrir `TABLEAU_RECAPITULATIF_BALISES.md`
2. Vérifier l'orthographe exacte de la balise
3. Corriger dans le modèle Word
4. Re-héberger le fichier

---

### Problème : Tableaux vides ou manquants

**Cause :** Boucle mal fermée ou syntaxe incorrecte

**Solution :**
1. Vérifier que `{#nomBoucle}` est avant le contenu
2. Vérifier que `{/nomBoucle}` est après le contenu
3. Pas d'espace dans les noms de boucles

---

### Problème : Erreur 500 lors de la génération

**Cause :** URL du modèle inaccessible

**Solution :**
1. Tester l'URL dans un navigateur
2. Vérifier que le fichier est public
3. Essayer une autre option d'hébergement
4. Vérifier les logs Vercel pour détails

---

## 📞 Support

- 📖 **Documentation complète** : `BALISES_MODELE_WORD.md`
- 🚀 **Guide pratique** : `GUIDE_RAPIDE_CREATION.md`
- 📊 **Référence rapide** : `TABLEAU_RECAPITULATIF_BALISES.md`
- 📄 **Exemple** : `EXEMPLE_MODELE_WORD.txt`

---

## 🎓 Matières supportées

### Programme PEI (Critères A/B/C/D - Note sur 8)
- Acquisition de langues (Anglais)
- Langue et littérature (Français)
- Individus et sociétés
- Sciences
- Mathématiques
- Arts
- Éducation physique et à la santé
- Design

### Programme DP (Objectifs AO1-AO4 - Note sur 7)
- Langue et Littérature (Français NM)
- Langue Anglaise (NM)
- Géographie (NM)
- Mathématiques AA (NS)
- Biologie (NS)
- Physique (NS)
- Théorie de la Connaissance (TdC)
- Mémoire (EE)
- CAS (Créativité, Action, Service)

---

**Bonne création ! Si vous avez des questions, consultez les autres fichiers de documentation. 📚**
