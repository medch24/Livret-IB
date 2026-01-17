# 📊 Calcul et Affichage des Moyennes de Semestres

## ✅ Comportement Actuel (Correct)

Le système affiche dans le livret Word les **moyennes des semestres**, pas les notes individuelles de chaque unité.

---

## 🔢 Comment Ça Marche ?

### 1. Saisie des Notes par l'Enseignant

L'enseignant entre les notes pour chaque unité dans l'interface :

**Exemple pour le Critère A :**
```
Semestre 1:
- Unité 1: 6
- Unité 2: 7

Semestre 2:
- Unité 1: 7
- Unité 2: 6
```

### 2. Calcul Automatique des Moyennes

Le système calcule automatiquement la moyenne de chaque semestre :

```javascript
// Moyenne Semestre 1
sem1Avg = Math.round((6 + 7) / 2) = 7

// Moyenne Semestre 2  
sem2Avg = Math.round((7 + 6) / 2) = 7
```

### 3. Calcul du Niveau Final

Le niveau final est la moyenne des deux semestres :

```javascript
finalLevel = Math.round((7 + 7) / 2) = 7
```

### 4. Stockage dans la Base de Données

Le système stocke **à la fois** :
- Les notes individuelles : `sem1Units: [6, 7]`, `sem2Units: [7, 6]`
- Les moyennes : `sem1: 7`, `sem2: 7`
- Le niveau final : `finalLevel: 7`

### 5. Affichage dans le Livret Word

Le livret Word affiche **uniquement les moyennes** :

```
Critère A: Recherche et analyse
- Semestre 1: 7    ← Moyenne (pas 6 et 7)
- Semestre 2: 7    ← Moyenne (pas 7 et 6)
- Niveau Final: 7
```

---

## 📊 Exemple Complet

### Tableau dans l'Interface Web

```
Critère A: Recherche et analyse
┌─────────┬─────────┬──────────────┬─────────┬─────────┬──────────────┬──────────────┐
│ S1-U1   │ S1-U2   │ Moyenne S1   │ S2-U1   │ S2-U2   │ Moyenne S2   │ Niveau Final │
├─────────┼─────────┼──────────────┼─────────┼─────────┼──────────────┼──────────────┤
│   6     │   7     │      7       │   7     │   6     │      7       │      7       │
└─────────┴─────────┴──────────────┴─────────┴─────────┴──────────────┴──────────────┘
```

### Tableau dans le Livret Word

```
Critère A: Recherche et analyse
┌────────────┬────────────┬──────────────┐
│ Semestre 1 │ Semestre 2 │ Niveau Final │
├────────────┼────────────┼──────────────┤
│     7      │     7      │      7       │
└────────────┴────────────┴──────────────┘
```

**✅ Seules les moyennes apparaissent dans le Word**

---

## 🔍 Vérification dans le Code

### Frontend (public/script.js)

**Calcul des moyennes** (lignes 383-393) :
```javascript
let sem1Avg = null;
if (unitsSem1 === 1) {
    sem1Avg = sem1Units[0];
} else if (sem1Count > 0) {
    sem1Avg = Math.round(sem1Sum / sem1Count);  // ← Moyenne calculée
}
```

**Stockage** (lignes 443-444) :
```javascript
currentData.criteriaValues[criteriaType].sem1 = sem1Avg;  // ← Moyenne
currentData.criteriaValues[criteriaType].sem2 = sem2Avg;  // ← Moyenne
currentData.criteriaValues[criteriaType].sem1Units = sem1Units;  // ← Détails
currentData.criteriaValues[criteriaType].sem2Units = sem2Units;  // ← Détails
```

### Backend (api/index.js)

**Préparation pour Word** (lignes 392-393) :
```javascript
templateData[`criteria${key}.sem1`] = critData.sem1 ?? "-";  // ← Moyenne
templateData[`criteria${key}.sem2`] = critData.sem2 ?? "-";  // ← Moyenne
```

---

## 📝 Template Word

Dans votre template Word, les balises utilisent les moyennes :

```
Critère A: {criteriaName A}
Semestre 1: {criteriaA.sem1}     ← Affiche la moyenne
Semestre 2: {criteriaA.sem2}     ← Affiche la moyenne
Niveau Final: {finalLevel.A}
```

**Pas de balises pour les unités individuelles** (c'est voulu)

---

## ✅ Avantages de ce Système

1. **Lisibilité** : Le livret est plus clair avec seulement les moyennes
2. **Professionnel** : Format standard pour les bulletins scolaires
3. **Flexibilité** : On conserve les détails des unités en base de données
4. **Traçabilité** : Les enseignants peuvent revoir les notes individuelles si nécessaire

---

## 🎯 Cas d'Usage Spéciaux

### Cas 1 : Une Seule Unité par Semestre

Si `unitsSem1 = 1` :
```
Unité 1: 6

Moyenne Semestre 1 = 6  (pas de calcul nécessaire)
```

### Cas 2 : Plusieurs Unités

Si `unitsSem1 = 3` :
```
Unité 1: 6
Unité 2: 7
Unité 3: 5

Moyenne Semestre 1 = Math.round((6 + 7 + 5) / 3) = 6
```

### Cas 3 : Notes Manquantes

Si une unité n'est pas remplie :
```
Unité 1: 6
Unité 2: (vide)

Moyenne Semestre 1 = 6  (seules les notes saisies comptent)
```

---

## ✅ Résumé

| Élément | Interface Web | Base de Données | Livret Word |
|---------|---------------|-----------------|-------------|
| Notes individuelles | ✅ Affichées | ✅ Stockées | ❌ Non affichées |
| Moyenne Semestre 1 | ✅ Calculée et affichée | ✅ Stockée | ✅ Affichée |
| Moyenne Semestre 2 | ✅ Calculée et affichée | ✅ Stockée | ✅ Affichée |
| Niveau Final | ✅ Calculé et affiché | ✅ Stocké | ✅ Affiché |

---

## 📖 Conclusion

Le système fonctionne **exactement comme requis** :
- ✅ Les moyennes de semestres sont calculées automatiquement
- ✅ Seules les moyennes apparaissent dans le livret Word
- ✅ Les notes individuelles sont conservées en base de données pour référence

**Aucun changement nécessaire** - Le comportement est correct ! ✨

---

**Date** : 16 Janvier 2026  
**Version** : 2.0.4  
**Statut** : 🟢 Fonctionnement Confirmé
