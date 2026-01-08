# 🚀 GUIDE RAPIDE - Création du Modèle Word

## 📋 RÉSUMÉ DES BALISES ESSENTIELLES

### 1️⃣ INFORMATIONS ÉLÈVE (Obligatoires)
```
{studentSelected}       → Nom de l'élève
{className}            → Classe (PEI2, DP1, etc.)
{studentBirthdate}     → Date de naissance
```

---

### 2️⃣ TABLEAU ATL (Boucle)
```
{#atlSummaryTable}
  {subject}             → Nom matière
  {communication}       → Note Communication
  {collaboration}       → Note Collaboration
  {autogestion}         → Note Autogestion
  {recherche}           → Note Recherche
  {reflexion}           → Note Réflexion
{/atlSummaryTable}
```

---

### 3️⃣ DÉTAILS MATIÈRES (Boucle principale)
```
{#contributionsBySubject}
  
  {subjectSelected}     → Nom de la matière
  {teacherName}         → Nom du prof
  {teacherComment}      → Commentaire
  {note}                → Note finale (1-7 ou 1-8)
  {seuil}               → Total niveaux

  Pour PEI (A, B, C, D) :
  ┌────────────────────────────────────┐
  │ {criteriaKey.A}    → "A"           │
  │ {criteriaName A}   → Description   │
  │ {criteriaA.sem1}   → Note sem 1    │
  │ {criteriaA.sem2}   → Note sem 2    │
  │ {finalLevel.A}     → Niveau final  │
  └────────────────────────────────────┘
  (Répéter pour B, C, D)

  Pour DP (AO1, AO2, AO3, AO4) :
  ┌────────────────────────────────────┐
  │ {criteriaKey.AO1}  → "AO1"         │
  │ {criteriaName AO1} → Description   │
  │ {criteriaAO1.sem1} → Note sem 1    │
  │ {criteriaAO1.sem2} → Note sem 2    │
  │ {finalLevel.AO1}   → Niveau final  │
  └────────────────────────────────────┘
  (Répéter pour AO2, AO3, AO4)

{/contributionsBySubject}
```

---

## ✅ ÉTAPES DE CRÉATION DANS WORD

### Étape 1 : Créer l'en-tête
1. Ouvrir Word
2. Ajouter titre "LIVRET SCOLAIRE IB 2026"
3. Insérer les balises élève :
   - Nom : {studentSelected}
   - Classe : {className}
   - Date : {studentBirthdate}

### Étape 2 : Créer le tableau ATL
1. Insérer un tableau : 6 colonnes
2. En-têtes : Matière | Communication | Collaboration | Autogestion | Recherche | Réflexion
3. Dans une cellule AVANT le tableau, écrire : {#atlSummaryTable}
4. Dans la ligne de données :
   - Col 1 : {subject}
   - Col 2 : {communication}
   - Col 3 : {collaboration}
   - Col 4 : {autogestion}
   - Col 5 : {recherche}
   - Col 6 : {reflexion}
5. Après le tableau, écrire : {/atlSummaryTable}

### Étape 3 : Créer la section des matières
1. Écrire : {#contributionsBySubject}
2. Ajouter titre : {subjectSelected}
3. Ajouter : Professeur : {teacherName}
4. Créer tableau critères PEI (5 colonnes) :
   - Critère | Description | Semestre 1 | Semestre 2 | Niveau Final
   - Ligne A : {criteriaKey.A} | {criteriaName A} | {criteriaA.sem1} | {criteriaA.sem2} | {finalLevel.A}
   - Ligne B : {criteriaKey.B} | {criteriaName B} | {criteriaB.sem1} | {criteriaB.sem2} | {finalLevel.B}
   - Ligne C : {criteriaKey.C} | {criteriaName C} | {criteriaC.sem1} | {criteriaC.sem2} | {finalLevel.C}
   - Ligne D : {criteriaKey.D} | {criteriaName D} | {criteriaD.sem1} | {criteriaD.sem2} | {finalLevel.D}
5. Ajouter : Total : {seuil} | Note : {note}
6. Créer tableau critères DP (5 colonnes) :
   - Objectif | Description | Semestre 1 | Semestre 2 | Niveau Final
   - Ligne AO1 : {criteriaKey.AO1} | {criteriaName AO1} | {criteriaAO1.sem1} | {criteriaAO1.sem2} | {finalLevel.AO1}
   - Ligne AO2 : {criteriaKey.AO2} | {criteriaName AO2} | {criteriaAO2.sem1} | {criteriaAO2.sem2} | {finalLevel.AO2}
   - Ligne AO3 : {criteriaKey.AO3} | {criteriaName AO3} | {criteriaAO3.sem1} | {criteriaAO3.sem2} | {finalLevel.AO3}
   - Ligne AO4 : {criteriaKey.AO4} | {criteriaName AO4} | {criteriaAO4.sem1} | {criteriaAO4.sem2} | {finalLevel.AO4}
7. Ajouter : Commentaire : {teacherComment}
8. Écrire : {/contributionsBySubject}

### Étape 4 : Enregistrer
1. Enregistrer au format .docx
2. Nommer : Livret_Modele_IB_2026.docx

---

## 🎯 EXEMPLE MINIMAL FONCTIONNEL

Si vous voulez un modèle simple qui fonctionne :

```
═════════════════════════════
LIVRET SCOLAIRE IB 2026
═════════════════════════════

Élève : {studentSelected}
Classe : {className}
Date de naissance : {studentBirthdate}

─────────────────────────────
TABLEAU ATL
─────────────────────────────

{#atlSummaryTable}
{subject} | {communication} | {collaboration} | {autogestion} | {recherche} | {reflexion}
{/atlSummaryTable}

─────────────────────────────
MATIÈRES
─────────────────────────────

{#contributionsBySubject}

Matière : {subjectSelected}
Professeur : {teacherName}

Critères PEI :
A ({criteriaName A}) : Sem1={criteriaA.sem1} | Sem2={criteriaA.sem2} | Final={finalLevel.A}
B ({criteriaName B}) : Sem1={criteriaB.sem1} | Sem2={criteriaB.sem2} | Final={finalLevel.B}
C ({criteriaName C}) : Sem1={criteriaC.sem1} | Sem2={criteriaC.sem2} | Final={finalLevel.C}
D ({criteriaName D}) : Sem1={criteriaD.sem1} | Sem2={criteriaD.sem2} | Final={finalLevel.D}

Objectifs DP :
AO1 ({criteriaName AO1}) : Sem1={criteriaAO1.sem1} | Sem2={criteriaAO1.sem2} | Final={finalLevel.AO1}
AO2 ({criteriaName AO2}) : Sem1={criteriaAO2.sem1} | Sem2={criteriaAO2.sem2} | Final={finalLevel.AO2}
AO3 ({criteriaName AO3}) : Sem1={criteriaAO3.sem1} | Sem2={criteriaAO3.sem2} | Final={finalLevel.AO3}
AO4 ({criteriaName AO4}) : Sem1={criteriaAO4.sem1} | Sem2={criteriaAO4.sem2} | Final={finalLevel.AO4}

Total : {seuil} | Note finale : {note}

Commentaire :
{teacherComment}

─────────────────────────────
{/contributionsBySubject}

═════════════════════════════
Fin du livret
═════════════════════════════
```

---

## ⚠️ ERREURS À ÉVITER

❌ **Ne pas faire :**
- Oublier les accolades : `studentSelected` → ❌
- Inverser # et / : `{/atlSummaryTable}...{#atlSummaryTable}` → ❌
- Fautes de frappe : `{studnetSelected}` → ❌
- Espace dans les balises : `{ studentSelected }` → ❌
- Majuscules incorrectes : `{StudentSelected}` → ❌

✅ **Faire :**
- Toujours avec accolades : `{studentSelected}` → ✅
- Ouvrir puis fermer : `{#...}...{/...}` → ✅
- Copier-coller les balises exactement → ✅
- Pas d'espace : `{studentSelected}` → ✅
- Respecter la casse : `{studentSelected}` → ✅

---

## 📤 APRÈS CRÉATION

1. **Enregistrer** le fichier .docx
2. **Héberger** sur un serveur (exemples) :
   - GitHub (créer un release)
   - Cloudinary
   - Google Drive (avec accès public)
   - Dropbox (lien public)
3. **Obtenir l'URL** du fichier
4. **Modifier** le fichier `api/index.js` lignes 332-336
5. **Commit et push** les changements

---

## 🔗 EXEMPLE D'URL À MODIFIER

Dans `api/index.js`, remplacer :
```javascript
const templateURLs = [
    'VOTRE_NOUVELLE_URL_1',
    'VOTRE_NOUVELLE_URL_2',
    'VOTRE_NOUVELLE_URL_3'
];
```

---

## 📞 BESOIN D'AIDE ?

1. Consultez `BALISES_MODELE_WORD.md` pour la liste complète
2. Utilisez `EXEMPLE_MODELE_WORD.txt` comme référence visuelle
3. Testez avec un élève pour vérifier que tout fonctionne

---

**Bonne création ! 🎨**
