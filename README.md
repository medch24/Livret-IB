# Livret Scolaire IB - Système de Gestion

Système de gestion des livrets scolaires pour le Programme d'éducation intermédiaire (PEI) et le Programme du diplôme (DP) de l'IB.

## Structure du Projet

```
Livret-IB/
├── public/
│   ├── index.html          # Page principale
│   ├── script.js           # Logique frontend
│   ├── style.css           # Styles CSS
│   └── templates/
│       ├── modele-pei.docx # Template Word PEI
│       └── modele-dp.docx  # Template Word DP
├── api/
│   └── index.js            # API Backend (Express + MongoDB)
├── package.json            # Dépendances
└── vercel.json            # Configuration Vercel

```

## Matières et Critères

### Matières PEI (Toutes classes PEI1-PEI5)
1. **Mathématiques** - Critères: A (Connaissances et compréhension), B (Recherche de modèles), C (Communication), D (Application des mathématiques)
2. **Individus et sociétés** - Critères: A-D spécifiques
3. **Langue et littérature** - Critères: A-D spécifiques  
4. **Design** - Critères: A-D spécifiques
5. **Sciences** - Critères: A-D spécifiques
6. **Art visuel** - Critères: A-D spécifiques
7. **Éducation physique et sportive** - Critères: A-D spécifiques
8. **Acquisition de langue (Anglais)** - Critères: A (Listening), B (Reading), C (Speaking), D (Writing)
9. **Acquisition de langue (اللغة العربية)** - Critères: أ (الاستماع), ب (القراءة), ج (التحدث), د (الكتابة)

### Matières DP (DP1 et DP2)
- Langue et Littérature (Français NM)
- Langue Anglaise (NM)
- Géographie (NM)
- Mathématiques AA (NS)
- Biologie (NS)
- Physique (NS)
- Théorie de la Connaissance (TdC)
- Mémoire (EE)
- CAS

## Configuration des Classes

### Section Garçons
- PEI1, PEI2, PEI3, PEI4
- DP2 uniquement

### Section Filles
- PEI1, PEI2, PEI3, PEI4, PEI5
- DP1 et DP2

## Variables d'Environnement (Vercel)

```
MONGODB_URI=mongodb+srv://...
DB_NAME=teacherContributionsDB
```

## Déploiement

L'application est configurée pour Vercel avec déploiement automatique depuis GitHub.

## Technologies
- **Frontend**: HTML, CSS, JavaScript vanilla
- **Backend**: Node.js, Express
- **Base de données**: MongoDB Atlas
- **Génération Word**: docxtemplater
- **Hébergement**: Vercel

## Contact
Pour toute question sur le système, contactez l'administrateur.
