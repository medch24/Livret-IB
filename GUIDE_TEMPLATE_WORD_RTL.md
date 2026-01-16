# Guide Template Word - RTL pour Arabe uniquement

## Problème
Le texte arabe doit être de droite à gauche (RTL), mais les autres matières doivent rester de gauche à droite (LTR).

## Solution
Utiliser une condition dans le template Word avec la balise `{isArabic}`.

## Instructions

### 1. Structure du template

Dans la boucle `{#contributionsBySubject}`, ajoutez une condition:

```
{#contributionsBySubject}

Matière: {subjectSelected}
Enseignant: {teacherName}

[Tableau des critères A, B, C, D ici]

Observations:
{#isArabic}
{teacherComment}  ← Ce paragraphe doit être en RTL (Ctrl+Shift+R)
{/isArabic}
{^isArabic}
{teacherComment}  ← Ce paragraphe reste en LTR (normal)
{/isArabic}

{/contributionsBySubject}
```

### 2. Appliquer RTL

1. Sélectionner le paragraphe `{teacherComment}` dans le bloc `{#isArabic}`
2. Appuyer sur `Ctrl+Shift+R` (Windows) ou `Cmd+Shift+R` (Mac)
3. Le paragraphe s'alignera à droite

### 3. Résultat

- **Matière arabe** (اللغة العربية): Observations en RTL
- **Autres matières**: Observations en LTR normal

## Données envoyées

```javascript
{
  "subjectSelected": "Acquisition de langue (اللغة العربية)",
  "teacherComment": "بذل معلم مجتهد...",
  "isArabic": "true"  // ← Utilisé pour la condition
}
```

## Balises DocxTemplater

- `{#isArabic}` : Si vrai (matière arabe)
- `{/isArabic}` : Fin du bloc si vrai
- `{^isArabic}` : Sinon (autres matières)
- `{/isArabic}` : Fin du bloc sinon
