# Guide: RTL pour Matière Arabe dans le Template Word

## 📋 Contexte

Le système génère des livrets Word. Pour la matière **arabe uniquement**, les observations doivent être en **RTL (droite à gauche)**.

Les autres matières restent en **LTR (gauche à droite)** par défaut.

## ✅ Solution Implémentée

### 1. Indicateur `isArabic` dans les Données

Le backend ajoute automatiquement un champ `isArabic` pour chaque matière :

```javascript
{
  subjectSelected: "Acquisition de langue (اللغة العربية)",
  teacherComment: "ملاحظات المعلم هنا",
  isArabic: true,  // ✅ true pour arabe, false pour autres
  ...
}
```

### 2. Modification du Template Word

Dans votre fichier **template.docx**, dans la boucle `{#contributionsBySubject}` :

#### ❌ AVANT (sans RTL conditionnel)
```
{teacherComment}
```

#### ✅ APRÈS (avec RTL conditionnel)
```
{#isArabic}
{teacherComment}
{/isArabic}
{^isArabic}
{teacherComment}
{/isArabic}
```

### 3. Application du Style RTL dans Word

1. **Sélectionner** le texte `{#isArabic}{teacherComment}{/isArabic}`
2. **Cliquer droit** → Format de paragraphe
3. **Direction du texte** : Droite à gauche
4. **Alignement** : Droite
5. **Ou utiliser le raccourci** : `Ctrl+Shift+R` (Right-to-left)

Pour le deuxième bloc (autres matières), laisser **LTR** (gauche à droite) par défaut.

## 🎯 Résultat Attendu

- **Matière Arabe** : Observations en RTL (←)
- **Autres Matières** : Observations en LTR (→)

## 📝 Notes

- Le champ `isArabic` est **automatiquement détecté** par le code backend
- Il suffit de modifier le **template.docx** une seule fois
- Tous les livrets générés utiliseront ce template

## 🔗 Fichiers Concernés

- **Backend** : `api/index.js` (ligne 479-485)
- **Template** : `template.docx` (à modifier selon les instructions ci-dessus)

---

**Date** : 2026-01-16  
**Version** : 2.0.4
