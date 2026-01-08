# 📊 TABLEAU RÉCAPITULATIF - TOUTES LES BALISES

## 🔵 BALISES SIMPLES (copier-coller direct)

| Balise | Description | Exemple de valeur |
|--------|-------------|-------------------|
| `{studentSelected}` | Nom de l'élève | Ahmed Ben Ali |
| `{className}` | Classe | PEI2, DP1, DP2 |
| `{studentBirthdate}` | Date de naissance | 15/03/2008 |
| `{subjectSelected}` | Nom de la matière | Mathématiques |
| `{teacherName}` | Nom du professeur | M. Dupont |
| `{teacherComment}` | Commentaire prof | Excellent travail... |
| `{note}` | Note finale | 6, 7, 8 |
| `{seuil}` | Total niveaux | 25, 27, 30 |

---

## 🔄 BOUCLE ATL (Tableau récapitulatif)

```
{#atlSummaryTable}
  {subject}          → Nom matière
  {communication}    → A, B, C, D ou -
  {collaboration}    → A, B, C, D ou -
  {autogestion}      → A, B, C, D ou -
  {recherche}        → A, B, C, D ou -
  {reflexion}        → A, B, C, D ou -
{/atlSummaryTable}
```

---

## 🔄 BOUCLE MATIÈRES (Détails par matière)

```
{#contributionsBySubject}
  ... tout le contenu pour une matière ...
{/contributionsBySubject}
```

---

## 📘 CRITÈRES PEI (A, B, C, D) - Note sur 8

### Critère A
| Balise | Valeur |
|--------|--------|
| `{criteriaKey.A}` | A |
| `{criteriaName A}` | Connaissances et compréhension |
| `{criteriaA.sem1}` | 6 |
| `{criteriaA.sem2}` | 7 |
| `{finalLevel.A}` | 7 |

### Critère B
| Balise | Valeur |
|--------|--------|
| `{criteriaKey.B}` | B |
| `{criteriaName B}` | Recherche de modèles |
| `{criteriaB.sem1}` | 5 |
| `{criteriaB.sem2}` | 6 |
| `{finalLevel.B}` | 6 |

### Critère C
| Balise | Valeur |
|--------|--------|
| `{criteriaKey.C}` | C |
| `{criteriaName C}` | Communication |
| `{criteriaC.sem1}` | 7 |
| `{criteriaC.sem2}` | 7 |
| `{finalLevel.C}` | 7 |

### Critère D
| Balise | Valeur |
|--------|--------|
| `{criteriaKey.D}` | D |
| `{criteriaName D}` | Application |
| `{criteriaD.sem1}` | 6 |
| `{criteriaD.sem2}` | 7 |
| `{finalLevel.D}` | 7 |

---

## 📗 OBJECTIFS DP (AO1-AO4) - Note sur 7

### Objectif AO1
| Balise | Valeur |
|--------|--------|
| `{criteriaKey.AO1}` | AO1 |
| `{criteriaName AO1}` | Connaissances et compréhension |
| `{criteriaAO1.sem1}` | 5 |
| `{criteriaAO1.sem2}` | 6 |
| `{finalLevel.AO1}` | 6 |

### Objectif AO2
| Balise | Valeur |
|--------|--------|
| `{criteriaKey.AO2}` | AO2 |
| `{criteriaName AO2}` | Application des techniques |
| `{criteriaAO2.sem1}` | 5 |
| `{criteriaAO2.sem2}` | 5 |
| `{finalLevel.AO2}` | 5 |

### Objectif AO3
| Balise | Valeur |
|--------|--------|
| `{criteriaKey.AO3}` | AO3 |
| `{criteriaName AO3}` | Formulation et analyse |
| `{criteriaAO3.sem1}` | 6 |
| `{criteriaAO3.sem2}` | 6 |
| `{finalLevel.AO3}` | 6 |

### Objectif AO4
| Balise | Valeur |
|--------|--------|
| `{criteriaKey.AO4}` | AO4 |
| `{criteriaName AO4}` | Techniques expérimentales |
| `{criteriaAO4.sem1}` | 5 |
| `{criteriaAO4.sem2}` | 6 |
| `{finalLevel.AO4}` | 6 |

---

## 🎯 STRUCTURE MINIMALE VALIDE

```
{studentSelected}
{className}
{studentBirthdate}

{#atlSummaryTable}
{subject} | {communication} | {collaboration} | {autogestion} | {recherche} | {reflexion}
{/atlSummaryTable}

{#contributionsBySubject}
{subjectSelected}
{teacherName}

{criteriaKey.A} {criteriaName A} | {criteriaA.sem1} | {criteriaA.sem2} | {finalLevel.A}
{criteriaKey.B} {criteriaName B} | {criteriaB.sem1} | {criteriaB.sem2} | {finalLevel.B}
{criteriaKey.C} {criteriaName C} | {criteriaC.sem1} | {criteriaC.sem2} | {finalLevel.C}
{criteriaKey.D} {criteriaName D} | {criteriaD.sem1} | {criteriaD.sem2} | {finalLevel.D}

{criteriaKey.AO1} {criteriaName AO1} | {criteriaAO1.sem1} | {criteriaAO1.sem2} | {finalLevel.AO1}
{criteriaKey.AO2} {criteriaName AO2} | {criteriaAO2.sem1} | {criteriaAO2.sem2} | {finalLevel.AO2}
{criteriaKey.AO3} {criteriaName AO3} | {criteriaAO3.sem1} | {criteriaAO3.sem2} | {finalLevel.AO3}
{criteriaKey.AO4} {criteriaName AO4} | {criteriaAO4.sem1} | {criteriaAO4.sem2} | {finalLevel.AO4}

{seuil} | {note}
{teacherComment}
{/contributionsBySubject}
```

---

## 🚀 COPIER-COLLER RAPIDE

### Pour un tableau PEI complet :
```
┌───────┬──────────────────────┬──────────┬──────────┬────────┐
│ Crit. │ Description          │ Sem 1    │ Sem 2    │ Final  │
├───────┼──────────────────────┼──────────┼──────────┼────────┤
│ {criteriaKey.A} │ {criteriaName A} │ {criteriaA.sem1} │ {criteriaA.sem2} │ {finalLevel.A} │
│ {criteriaKey.B} │ {criteriaName B} │ {criteriaB.sem1} │ {criteriaB.sem2} │ {finalLevel.B} │
│ {criteriaKey.C} │ {criteriaName C} │ {criteriaC.sem1} │ {criteriaC.sem2} │ {finalLevel.C} │
│ {criteriaKey.D} │ {criteriaName D} │ {criteriaD.sem1} │ {criteriaD.sem2} │ {finalLevel.D} │
└───────┴──────────────────────┴──────────┴──────────┴────────┘
```

### Pour un tableau DP complet :
```
┌────────┬──────────────────────┬──────────┬──────────┬────────┐
│ Obj.   │ Description          │ Sem 1    │ Sem 2    │ Final  │
├────────┼──────────────────────┼──────────┼──────────┼────────┤
│ {criteriaKey.AO1} │ {criteriaName AO1} │ {criteriaAO1.sem1} │ {criteriaAO1.sem2} │ {finalLevel.AO1} │
│ {criteriaKey.AO2} │ {criteriaName AO2} │ {criteriaAO2.sem1} │ {criteriaAO2.sem2} │ {finalLevel.AO2} │
│ {criteriaKey.AO3} │ {criteriaName AO3} │ {criteriaAO3.sem1} │ {criteriaAO3.sem2} │ {finalLevel.AO3} │
│ {criteriaKey.AO4} │ {criteriaName AO4} │ {criteriaAO4.sem1} │ {criteriaAO4.sem2} │ {finalLevel.AO4} │
└────────┴──────────────────────┴──────────┴──────────┴────────┘
```

---

## ✅ CHECKLIST AVANT ENREGISTREMENT

- [ ] Toutes les balises ont des accolades `{...}`
- [ ] Les boucles sont fermées : `{#...}` puis `{/...}`
- [ ] Tableau ATL inclus avec les 5 colonnes ATL
- [ ] Critères PEI (A, B, C, D) présents
- [ ] Objectifs DP (AO1, AO2, AO3, AO4) présents
- [ ] Balises de base élève présentes
- [ ] Format .docx (pas .doc)

---

## 🔢 NOMBRE TOTAL DE BALISES

- **3** balises élève
- **2** boucles principales
- **5** balises ATL (dans boucle)
- **4** balises générales matière
- **20** balises critères PEI (5 par critère × 4)
- **20** balises objectifs DP (5 par objectif × 4)

**Total : ~54 balises uniques**

---

**Document de référence rapide pour création modèle Word**
