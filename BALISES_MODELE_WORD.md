# 📋 BALISES DU MODÈLE WORD - LIVRET SCOLAIRE IB

## 🎯 Instructions pour créer le nouveau modèle Word

Ce document liste **toutes les balises** à insérer dans votre modèle Word `.docx` pour que le système de génération automatique fonctionne correctement.

---

## 📝 INFORMATIONS DE L'ÉLÈVE

### Balises simples (texte)

```
{studentSelected}       → Nom complet de l'élève
{className}            → Classe (ex: PEI2, DP1, DP2)
{studentBirthdate}     → Date de naissance au format français (JJ/MM/AAAA)
{image}                → Photo de l'élève (actuellement désactivée)
```

**Exemple d'utilisation dans Word :**
```
Nom de l'élève : {studentSelected}
Classe : {className}
Date de naissance : {studentBirthdate}
```

---

## 📊 TABLEAU RÉCAPITULATIF ATL (Approches de l'apprentissage)

### Balise de boucle pour le tableau ATL

Cette section affiche un tableau récapitulatif de toutes les matières avec les évaluations ATL.

**Syntaxe de la boucle :**
```
{#atlSummaryTable}
    ... contenu répété pour chaque matière ...
{/atlSummaryTable}
```

**Balises disponibles dans la boucle :**
```
{subject}          → Nom de la matière
{communication}    → Note Communication (A, B, C, D ou -)
{collaboration}    → Note Collaboration (A, B, C, D ou -)
{autogestion}      → Note Autogestion (A, B, C, D ou -)
{recherche}        → Note Recherche (A, B, C, D ou -)
{reflexion}        → Note Réflexion (A, B, C, D ou -)
```

**Exemple de tableau ATL dans Word :**

| Matière | Communication | Collaboration | Autogestion | Recherche | Réflexion |
|---------|---------------|---------------|-------------|-----------|-----------|
| {#atlSummaryTable} |
| {subject} | {communication} | {collaboration} | {autogestion} | {recherche} | {reflexion} |
| {/atlSummaryTable} |

---

## 📚 CONTRIBUTIONS PAR MATIÈRE

### Balise de boucle principale

Cette section affiche les détails de chaque matière (critères, notes, commentaires).

**Syntaxe de la boucle :**
```
{#contributionsBySubject}
    ... contenu répété pour chaque matière ...
{/contributionsBySubject}
```

---

### 🔹 Balises générales par matière

```
{subjectSelected}      → Nom de la matière
{teacherName}          → Nom du professeur
{teacherComment}       → Commentaire du professeur
{note}                 → Note finale calculée (1-7 ou 1-8)
{seuil}                → Total des niveaux (somme des critères)
```

---

### 🔹 Balises pour les CRITÈRES (Matières PEI : A, B, C, D)

#### Pour le Critère A :
```
{criteriaKey.A}        → Affiche "A"
{criteriaName A}       → Nom du critère A (ex: "Analyse", "Listening", etc.)
{criteriaA.sem1}       → Note semestre 1 pour le critère A
{criteriaA.sem2}       → Note semestre 2 pour le critère A
{finalLevel.A}         → Niveau final pour le critère A
```

#### Pour le Critère B :
```
{criteriaKey.B}        → Affiche "B"
{criteriaName B}       → Nom du critère B
{criteriaB.sem1}       → Note semestre 1 pour le critère B
{criteriaB.sem2}       → Note semestre 2 pour le critère B
{finalLevel.B}         → Niveau final pour le critère B
```

#### Pour le Critère C :
```
{criteriaKey.C}        → Affiche "C"
{criteriaName C}       → Nom du critère C
{criteriaC.sem1}       → Note semestre 1 pour le critère C
{criteriaC.sem2}       → Note semestre 2 pour le critère C
{finalLevel.C}         → Niveau final pour le critère C
```

#### Pour le Critère D :
```
{criteriaKey.D}        → Affiche "D"
{criteriaName D}       → Nom du critère D
{criteriaD.sem1}       → Note semestre 1 pour le critère D
{criteriaD.sem2}       → Note semestre 2 pour le critère D
{finalLevel.D}         → Niveau final pour le critère D
```

---

### 🔹 Balises pour les OBJECTIFS (Matières DP : AO1, AO2, AO3, AO4)

#### Pour l'Objectif AO1 :
```
{criteriaKey.AO1}      → Affiche "AO1"
{criteriaName AO1}     → Nom de l'objectif AO1
{criteriaAO1.sem1}     → Note semestre 1 pour AO1
{criteriaAO1.sem2}     → Note semestre 2 pour AO1
{finalLevel.AO1}       → Niveau final pour AO1
```

#### Pour l'Objectif AO2 :
```
{criteriaKey.AO2}      → Affiche "AO2"
{criteriaName AO2}     → Nom de l'objectif AO2
{criteriaAO2.sem1}     → Note semestre 1 pour AO2
{criteriaAO2.sem2}     → Note semestre 2 pour AO2
{finalLevel.AO2}       → Niveau final pour AO2
```

#### Pour l'Objectif AO3 :
```
{criteriaKey.AO3}      → Affiche "AO3"
{criteriaName AO3}     → Nom de l'objectif AO3
{criteriaAO3.sem1}     → Note semestre 1 pour AO3
{criteriaAO3.sem2}     → Note semestre 2 pour AO3
{finalLevel.AO3}       → Niveau final pour AO3
```

#### Pour l'Objectif AO4 :
```
{criteriaKey.AO4}      → Affiche "AO4"
{criteriaName AO4}     → Nom de l'objectif AO4
{criteriaAO4.sem1}     → Note semestre 1 pour AO4
{criteriaAO4.sem2}     → Note semestre 2 pour AO4
{finalLevel.AO4}       → Niveau final pour AO4
```

---

## 📐 EXEMPLE COMPLET DE STRUCTURE

### Structure recommandée pour le modèle Word :

```
═══════════════════════════════════════════════════════
              LIVRET SCOLAIRE IB 2026
═══════════════════════════════════════════════════════

📋 INFORMATIONS ÉLÈVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Nom de l'élève : {studentSelected}
Classe : {className}
Date de naissance : {studentBirthdate}


📊 TABLEAU RÉCAPITULATIF ATL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌────────────────────┬──────────────┬───────────────┬─────────────┬───────────┬───────────┐
│ Matière            │ Communica.   │ Collabora.    │ Autogestion │ Recherche │ Réflexion │
├────────────────────┼──────────────┼───────────────┼─────────────┼───────────┼───────────┤
{#atlSummaryTable}
│ {subject}          │ {communication} │ {collaboration} │ {autogestion} │ {recherche} │ {reflexion} │
{/atlSummaryTable}
└────────────────────┴──────────────┴───────────────┴─────────────┴───────────┴───────────┘


📚 DÉTAILS PAR MATIÈRE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{#contributionsBySubject}

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  MATIÈRE : {subjectSelected}
┃  Professeur : {teacherName}
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

📝 Critères d'évaluation :

┌──────────────┬──────────────────────────────────┬────────────┬────────────┬──────────────┐
│ Critère      │ Description                      │ Semestre 1 │ Semestre 2 │ Niveau Final │
├──────────────┼──────────────────────────────────┼────────────┼────────────┼──────────────┤
│ {criteriaKey.A}  │ {criteriaName A}             │ {criteriaA.sem1} │ {criteriaA.sem2} │ {finalLevel.A} │
├──────────────┼──────────────────────────────────┼────────────┼────────────┼──────────────┤
│ {criteriaKey.B}  │ {criteriaName B}             │ {criteriaB.sem1} │ {criteriaB.sem2} │ {finalLevel.B} │
├──────────────┼──────────────────────────────────┼────────────┼────────────┼──────────────┤
│ {criteriaKey.C}  │ {criteriaName C}             │ {criteriaC.sem1} │ {criteriaC.sem2} │ {finalLevel.C} │
├──────────────┼──────────────────────────────────┼────────────┼────────────┼──────────────┤
│ {criteriaKey.D}  │ {criteriaName D}             │ {criteriaD.sem1} │ {criteriaD.sem2} │ {finalLevel.D} │
└──────────────┴──────────────────────────────────┴────────────┴────────────┴──────────────┘

📊 RÉSULTAT :
• Total des niveaux : {seuil}
• Note finale : {note} / 8

💬 Commentaire du professeur :
{teacherComment}

{/contributionsBySubject}

═══════════════════════════════════════════════════════
```

---

## 🎯 NOTES IMPORTANTES

### ✅ Compatibilité PEI vs DP

Le système **détecte automatiquement** le type de matière :

- **Matières PEI** : Utilisent les critères **A, B, C, D** (note sur 8)
- **Matières DP** : Utilisent les objectifs **AO1, AO2, AO3, AO4** (note sur 7)

⚠️ **Votre modèle doit inclure TOUTES les balises** (A/B/C/D ET AO1/AO2/AO3/AO4) pour être compatible avec les deux types de matières.

### ✅ Gestion des valeurs manquantes

Le système remplace automatiquement les valeurs manquantes par **"-"**, donc pas besoin de gérer les cas vides.

### ✅ Format des dates

Les dates sont automatiquement formatées en français : `JJ/MM/AAAA`

### ✅ Boucles DocxTemplater

- Utilisez `{#nomBoucle}` pour **commencer** une boucle
- Utilisez `{/nomBoucle}` pour **terminer** une boucle
- Les boucles peuvent contenir des tableaux, du texte, des images

---

## 📥 EXEMPLES DE DONNÉES GÉNÉRÉES

### Exemple pour "Mathématiques" (PEI)

```
Matière : Mathématiques
Professeur : M. Dupont
Critère A (Connaissances et compréhension) : Sem1=6, Sem2=7, Final=7
Critère B (Recherche de modèles) : Sem1=5, Sem2=6, Final=6
Critère C (Communication) : Sem1=7, Sem2=7, Final=7
Critère D (Application) : Sem1=6, Sem2=7, Final=7
Total : 27
Note finale : 7/8
```

### Exemple pour "Biologie (NS)" (DP)

```
Matière : Biologie (NS)
Professeur : Mme Martin
AO1 (Connaissances et compréhension) : Sem1=5, Sem2=6, Final=6
AO2 (Application) : Sem1=5, Sem2=5, Final=5
AO3 (Formulation et analyse) : Sem1=6, Sem2=6, Final=6
AO4 (Techniques expérimentales) : Sem1=5, Sem2=6, Final=6
Total : 23
Note finale : 6/7
```

---

## 🔧 MATIÈRES SUPPORTÉES

### Matières PEI (Critères A, B, C, D - Note sur 8)

1. **Acquisition de langues (Anglais)**
   - A: Listening
   - B: Reading
   - C: Speaking
   - D: Writing

2. **Langue et littérature (Français)**
   - A: Analyse
   - B: Organisation
   - C: Production de texte
   - D: Utilisation de la langue

3. **Individus et sociétés**
   - A: Connaissances et compréhension
   - B: Recherche
   - C: Communication
   - D: Pensée critique

4. **Sciences**
   - A: Connaissances et compréhension
   - B: Recherche et élaboration
   - C: Traitement et évaluation
   - D: Réflexion sur les répercussions

5. **Mathématiques**
   - A: Connaissances et compréhension
   - B: Recherche de modèles
   - C: Communication
   - D: Application des mathématiques

6. **Arts**
   - A: Connaissances et compréhension
   - B: Développement des compétences
   - C: Pensée créative
   - D: Réaction

7. **Éducation physique et à la santé**
   - A: Connaissances et compréhension
   - B: Planification
   - C: Application et exécution
   - D: Réflexion et amélioration

8. **Design**
   - A: Recherche et analyse
   - B: Développement des idées
   - C: Création de la solution
   - D: Évaluation

### Matières DP (Objectifs AO1-AO4 - Note sur 7)

1. **Langue et Littérature (Français NM)**
   - AO1: Connaissances et compréhension des œuvres littéraires
   - AO2: Application des compétences d'analyse
   - AO3: Communication claire et efficace
   - AO4: Maîtrise de l'usage de la langue

2. **Langue Anglaise (NM)**
   - AO1: Communication d'idées
   - AO2: Compréhension des messages
   - AO3: Maîtrise de la langue
   - AO4: Sensibilité interculturelle

3. **Géographie (NM)**
   - AO1: Connaissances des concepts géographiques
   - AO2: Application et analyse des données
   - AO3: Synthèse et évaluation
   - AO4: Sélection et présentation

4. **Mathématiques AA (NS)**
   - AO1: Connaissances et compréhension
   - AO2: Modélisation et résolution
   - AO3: Communication des raisonnements
   - AO4: Utilisation de la technologie

5. **Biologie (NS)**
   - AO1: Connaissances et compréhension
   - AO2: Application des techniques
   - AO3: Formulation et analyse
   - AO4: Techniques expérimentales

6. **Physique (NS)**
   - AO1: Connaissances et compréhension
   - AO2: Application des techniques
   - AO3: Formulation et analyse
   - AO4: Techniques expérimentales

7. **Théorie de la Connaissance (TdC)**
   - AO1: Réflexion sur les Questions de Connaissance
   - AO2: Exploration des Cadres de Connaissance
   - AO3: Lien avec des situations réelles

8. **Mémoire (EE)**
   - AO1: Développement d'une Question de Recherche
   - AO2: Recherche indépendante
   - AO3: Argumentation structurée
   - AO4: Réflexion sur l'apprentissage

9. **CAS (Créativité, Action, Service)**
   - AO1: Atteinte des 7 Résultats d'Apprentissage
   - AO2: Réflexion régulière
   - AO3: Planification du Projet CAS

---

## 🎨 CONSEILS DE MISE EN FORME

### Tableaux
- Utilisez les tableaux Word natifs
- Placez les balises dans les cellules
- Les boucles peuvent englober des lignes entières

### Styles
- Appliquez vos styles Word (gras, italique, couleurs)
- Les balises héritent du style du texte environnant
- Utilisez des styles de titre pour la structure

### Images
- La balise `{image}` est actuellement désactivée
- Vous pouvez créer un emplacement réservé

---

## ✅ CHECKLIST DE VALIDATION

Avant de finaliser votre modèle, vérifiez :

- [ ] Toutes les balises sont entre accolades : `{balise}`
- [ ] Les boucles sont correctement fermées : `{#...}` ... `{/...}`
- [ ] Les noms de balises respectent exactement la casse (majuscules/minuscules)
- [ ] Les tableaux contiennent les bonnes balises dans les bonnes colonnes
- [ ] Le modèle inclut les balises pour PEI (A/B/C/D) ET DP (AO1/AO2/AO3/AO4)
- [ ] Le fichier est enregistré au format `.docx` (pas .doc)

---

## 📤 APRÈS CRÉATION DU MODÈLE

Une fois votre modèle Word créé avec toutes ces balises :

1. **Enregistrez-le** au format `.docx`
2. **Hébergez-le** sur un CDN accessible (GitHub, Cloudinary, etc.)
3. **Mettez à jour** l'URL dans le fichier `api/index.js` (ligne 332-336)

---

**Document généré automatiquement pour le projet Livret-IB**
**Dernière mise à jour : 2026-01-08**
