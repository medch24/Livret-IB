# MODÈLE WORD POUR LES CLASSES DP1 ET DP2

## 🎯 Spécifications pour le diplôme DP

### URL du Modèle DP
```
https://docs.google.com/document/d/10x3kKNk9TgCnlHKY7SyZADB6ZCGeUhGd/export?format=docx
```

---

## 📋 MATIÈRES À INCLURE POUR DP1 ET DP2

### ✅ Matières à GARDER

#### **Groupe 1 : Langues**
- **Français** (Langue et Littérature)
- **Anglais** (Langue et Littérature)

#### **Groupe 2 : Acquisition de langues**
- **Arabe** (Langue B)

#### **Groupe 3 : Individus et sociétés**
- **Histoire géographie** ⚠️ (au lieu de "géographie")
- **Économie**
- **Philosophie**

#### **Groupe 4 : Sciences**
- **Physique chimie** ⚠️ (au lieu de "physique")
- **Biologie**
- **Sciences informatiques**

#### **Groupe 5 : Mathématiques**
- **Mathématiques**

#### **Groupe 6 : Arts**
- **Arts visuels**
- **Musique**
- **Théâtre**
- **Éducation physique et sportive (EPS)**

---

## ❌ ÉLÉMENTS À EXCLURE (PAS pour DP1/DP2)

### À NE PAS INCLURE :
1. **CAS** (Créativité, Activité, Service)
2. **TDC** (Théorie de la Connaissance)
3. **Mémoire**

> **Raison :** Ces éléments ne font pas partie du bulletin scolaire standard des classes DP1 et DP2. Ils sont évalués séparément.

---

## 🔄 MODIFICATIONS DE NOMS DE MATIÈRES

| ❌ Ancien Nom | ✅ Nouveau Nom |
|---------------|----------------|
| Physique | **Physique chimie** |
| Géographie | **Histoire géographie** |

---

## 📝 STRUCTURE DU MODÈLE DP

### 1. **En-tête du livret**
```
Nom et Prénom : {studentSelected}
Classe : {className}
Né(e) le : {studentBirthdate}
Photo : {image}
```

### 2. **Tableau des Évaluations ATL**
```
{#atlSummaryTable}
Matière : {subject}
Communication : {communication}
Collaboration : {collaboration}
Autogestion : {autogestion}
Recherche : {recherche}
Réflexion : {reflexion}
{/atlSummaryTable}
```

### 3. **Contributions par Matière (DP utilise AO1-AO4)**

Pour chaque matière, inclure :

```
{#contributionsBySubject}

MATIÈRE : {subject}

Professeur : {teacherName}
Unité 1 : {unit1}
Unité 2 : {unit2}

CRITÈRES D'ÉVALUATION (AO = Achievement Objectives)

Critère AO1 : {criteriaName AO1}
  - Semestre 1 : {criteriaAO1.sem1}
  - Semestre 2 : {criteriaAO1.sem2}
  - Niveau final : {finalLevel.AO1}

Critère AO2 : {criteriaName AO2}
  - Semestre 1 : {criteriaAO2.sem1}
  - Semestre 2 : {criteriaAO2.sem2}
  - Niveau final : {finalLevel.AO2}

Critère AO3 : {criteriaName AO3}
  - Semestre 1 : {criteriaAO3.sem1}
  - Semestre 2 : {criteriaAO3.sem2}
  - Niveau final : {finalLevel.AO3}

Critère AO4 : {criteriaName AO4}
  - Semestre 1 : {criteriaAO4.sem1}
  - Semestre 2 : {criteriaAO4.sem2}
  - Niveau final : {finalLevel.AO4}

Seuil : {seuil}
Note finale : {note} / 7

Commentaire : {commentaire}

{/contributionsBySubject}
```

---

## ⚠️ DIFFÉRENCES IMPORTANTES : PEI vs DP

| Aspect | PEI (PEI1-PEI4) | DP (DP1-DP2) |
|--------|-----------------|--------------|
| **Critères** | A, B, C, D | AO1, AO2, AO3, AO4 |
| **Note maximale** | 8 | 7 |
| **Éléments du tronc commun** | Non | Oui (CAS, TDC, Mémoire) |
| **Modèle Word** | Template PEI | Template DP |

---

## 🔧 CONFIGURATION VERCEL

### Variables d'environnement à configurer :

```bash
# Modèle pour les classes PEI (PEI1, PEI2, PEI3, PEI4)
TEMPLATE_URL=https://docs.google.com/document/d/18eo_E2ex8K5xu5ce6BQhN8MWi5mL_Nga/export?format=docx

# Modèle pour les classes DP (DP1, DP2)
TEMPLATE_URL_DP=https://docs.google.com/document/d/10x3kKNk9TgCnlHKY7SyZADB6ZCGeUhGd/export?format=docx
```

---

## 📊 LISTE COMPLÈTE DES BALISES POUR LE MODÈLE DP

### **Informations Élève**
- `{studentSelected}` → Nom complet de l'élève
- `{className}` → Classe (DP1 ou DP2)
- `{studentBirthdate}` → Date de naissance
- `{image}` → Photo de l'élève

### **Boucle ATL (Approches de l'Apprentissage)**
```
{#atlSummaryTable}
  {subject}
  {communication}
  {collaboration}
  {autogestion}
  {recherche}
  {reflexion}
{/atlSummaryTable}
```

### **Boucle Contributions par Matière**
```
{#contributionsBySubject}
  {subject}
  {teacherName}
  {unit1}
  {unit2}
  
  {criteriaKey.AO1}
  {criteriaName AO1}
  {criteriaAO1.sem1}
  {criteriaAO1.sem2}
  {finalLevel.AO1}
  
  {criteriaKey.AO2}
  {criteriaName AO2}
  {criteriaAO2.sem1}
  {criteriaAO2.sem2}
  {finalLevel.AO2}
  
  {criteriaKey.AO3}
  {criteriaName AO3}
  {criteriaAO3.sem1}
  {criteriaAO3.sem2}
  {finalLevel.AO3}
  
  {criteriaKey.AO4}
  {criteriaName AO4}
  {criteriaAO4.sem1}
  {criteriaAO4.sem2}
  {finalLevel.AO4}
  
  {seuil}
  {note}
  {commentaire}
{/contributionsBySubject}
```

---

## ✅ CHECKLIST DE CRÉATION DU MODÈLE DP

### Étape 1 : Accès au document
- [ ] Ouvrir : https://docs.google.com/document/d/10x3kKNk9TgCnlHKY7SyZADB6ZCGeUhGd/edit
- [ ] Vérifier les droits d'accès (modification autorisée)

### Étape 2 : Structure de base
- [ ] Créer l'en-tête avec les 4 balises élève
- [ ] Réserver un espace pour la photo {image}
- [ ] Créer le tableau ATL avec boucle
- [ ] Créer la section contributions avec boucle

### Étape 3 : Matières DP1/DP2
- [ ] Vérifier : PAS de CAS
- [ ] Vérifier : PAS de TDC
- [ ] Vérifier : PAS de Mémoire
- [ ] Utiliser "Physique chimie" (pas "Physique")
- [ ] Utiliser "Histoire géographie" (pas "Géographie")

### Étape 4 : Critères d'évaluation
- [ ] Utiliser AO1, AO2, AO3, AO4 (pas A, B, C, D)
- [ ] Note sur 7 (pas 8)
- [ ] Inclure les balises sem1 et sem2 pour chaque AO
- [ ] Inclure finalLevel pour chaque AO

### Étape 5 : Validation
- [ ] Toutes les balises sont bien fermées avec }
- [ ] Pas de soulignement rouge dans Google Docs
- [ ] Les boucles sont bien fermées avec {/nom_boucle}
- [ ] Tester la génération avec un élève de DP1 ou DP2

---

## 🚀 DÉPLOIEMENT

### 1. Configurer la variable d'environnement Vercel
```bash
TEMPLATE_URL_DP=https://docs.google.com/document/d/10x3kKNk9TgCnlHKY7SyZADB6ZCGeUhGd/export?format=docx
```

### 2. Le code va automatiquement :
- Détecter si la classe est DP1 ou DP2
- Utiliser le modèle DP au lieu du modèle PEI
- Charger les bonnes balises et critères

### 3. Tester avec :
- [ ] Habib Lteif (DP2)
- [ ] Salah Boumalouga (DP2)

---

## 📞 SUPPORT

Si le modèle ne fonctionne pas :

1. **Vérifier les balises** : Pas de soulignement rouge
2. **Vérifier les boucles** : Bien fermées avec {/nom}
3. **Vérifier les matières** : Physique chimie, Histoire géographie
4. **Vérifier les critères** : AO1-AO4 (pas A-D)
5. **Vérifier la note** : / 7 (pas / 8)

---

## 📈 RÉSUMÉ DES CHANGEMENTS

| Élément | Ancien (PEI) | Nouveau (DP) |
|---------|--------------|--------------|
| **Modèle** | TEMPLATE_URL | TEMPLATE_URL_DP |
| **URL** | ...18eo_E2ex8... | ...10x3kKNk9Tg... |
| **Critères** | A, B, C, D | AO1, AO2, AO3, AO4 |
| **Note** | / 8 | / 7 |
| **Physique** | Physique | Physique chimie |
| **Géographie** | Géographie | Histoire géographie |
| **CAS** | ✅ Inclus | ❌ Exclu |
| **TDC** | ✅ Inclus | ❌ Exclu |
| **Mémoire** | ✅ Inclus | ❌ Exclu |

---

**Date de création :** 2026-01-08
**Version :** 1.0
**Statut :** ✅ Code modifié, documentation créée
