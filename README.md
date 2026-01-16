# Système de Livrets IB

Application de gestion des livrets scolaires pour le Programme d'éducation intermédiaire (PEI) et le Programme du diplôme (DP) de l'IB.

## Fonctionnalités

- ✅ Sélection par section (Garçons/Filles)
- ✅ Gestion des contributions par matière
- ✅ Évaluation des compétences ATL
- ✅ Support français et arabe
- ✅ Génération de livrets Word
- ✅ Export ZIP par classe
- ✅ Indicateur visuel des matières complétées
- ✅ Bouton retour à l'accueil

## Déploiement

- **Platform**: Railway.com
- **Database**: MongoDB Atlas
- **Version**: 2.0.3

## Configuration

### Variables d'environnement

```
MONGODB_URI=mongodb+srv://...
DB_NAME=teacherContributionsDB
TEMPLATE_URL=https://docs.google.com/document/d/.../export?format=docx
```

## Template Word

Le template Word doit contenir les boucles suivantes:

### 1. Tableau ATL
```
{#atlSummaryTable}
{subject} | {communication} | {collaboration} | {autogestion} | {recherche} | {reflexion}
{/atlSummaryTable}
```

### 2. Détails par matière
```
{#contributionsBySubject}
Matière: {subjectSelected}
Enseignant: {teacherName}

Critères:
A: {criteriaName A} | Sem1: {criteriaA.sem1} | Sem2: {criteriaA.sem2} | Final: {finalLevel.A}
B: {criteriaName B} | Sem1: {criteriaB.sem1} | Sem2: {criteriaB.sem2} | Final: {finalLevel.B}
C: {criteriaName C} | Sem1: {criteriaC.sem1} | Sem2: {criteriaC.sem2} | Final: {finalLevel.C}
D: {criteriaName D} | Sem1: {criteriaD.sem1} | Sem2: {criteriaD.sem2} | Final: {finalLevel.D}

Seuil: {seuil}/32
Note: {note}/8

Observations:
{#isArabic}
{teacherComment}  ← RTL pour arabe (Ctrl+Shift+R)
{/isArabic}
{^isArabic}
{teacherComment}  ← LTR pour autres
{/isArabic}

{/contributionsBySubject}
```

### Notes importantes

- Utilisez les **POINTS** dans les balises: `criteriaA.sem1` (pas de underscore)
- Utilisez les **ESPACES** dans: `criteriaName A` (pas `criteriaNameA`)
- Le bloc `{#isArabic}` permet d'appliquer RTL uniquement aux matières arabes

## Guide RTL Arabe

Voir: `GUIDE_TEMPLATE_WORD_RTL.md`

## Migration des données

Pour migrer les anciennes valeurs arabes (م, م+, ج, غ) vers les nouvelles (E, A, PA, I):

```bash
node migrate_arabic_values.js --dry-run  # Test
node migrate_arabic_values.js            # Application
```

## Structure du projet

```
├── api/
│   └── index.js           # Backend Express
├── public/
│   ├── index.html         # Interface
│   ├── script.js          # Logique frontend
│   └── style.css          # Styles
├── package.json
├── vercel.json
└── .env                   # Variables d'environnement (local)
```

## Support

Pour toute question, consulter `GUIDE_TEMPLATE_WORD_RTL.md`.
