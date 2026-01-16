# 📝 Instructions pour Modifier le Template Word - Support Arabe

**Date**: 16 Janvier 2026  
**Problèmes à résoudre**:
1. ✅ RTL pour les observations arabes
2. ✅ Affichage des notes du tableau arabe معايير التقييم (المادة)

---

## 🎯 PROBLÈMES IDENTIFIÉS

### Problème 1: Observations arabes pas en RTL
**Symptôme**: Le texte arabe des observations s'affiche de gauche à droite au lieu de droite à gauche.

**Solution**: Modifier le template Word pour appliquer RTL au paragraphe contenant `{teacherComment}`.

### Problème 2: Notes du tableau arabe ne s'affichent pas
**Symptôme**: Les notes (A, B, C, D) et les valeurs du tableau معايير التقييم ne s'affichent pas dans le livret Word.

**Solution**: Vérifier que les balises dans le template Word correspondent aux données envoyées par le backend.

---

## 📋 DONNÉES ENVOYÉES PAR LE BACKEND

### Structure des données
```javascript
{
    studentSelected: "Bilal Molina",
    className: "PEI3",
    studentBirthdate: "15/02/2015",
    
    // Table ATL (premier tableau)
    atlSummaryTable: [
        {
            subject: "Acquisition de langue (اللغة العربية)",
            communication: "E",    // ou A, PA, I
            collaboration: "A",
            autogestion: "PA",
            recherche: "E",
            reflexion: "A"
        },
        // ... autres matières
    ],
    
    // Détails par matière
    contributionsBySubject: [
        {
            subjectSelected: "Acquisition de langue (اللغة العربية)",
            teacherName: "أ. سمير النصيري",
            teacherComment: "بذل معلم مجتهد ...",  // ← Texte arabe RTL
            
            // Critères A-D
            "criteriaKey.A": "A",
            "criteriaName A": "الإستماع",
            "criteriaA.sem1": "6",
            "criteriaA.sem2": "-",
            "finalLevel.A": "6",
            
            "criteriaKey.B": "B",
            "criteriaName B": "القراءة",
            "criteriaB.sem1": "4",
            "criteriaB.sem2": "-",
            "finalLevel.B": "4",
            
            "criteriaKey.C": "C",
            "criteriaName C": "التحدث",
            "criteriaC.sem1": "4",
            "criteriaC.sem2": "-",
            "finalLevel.C": "4",
            
            "criteriaKey.D": "D",
            "criteriaName D": "الكتابة",
            "criteriaD.sem1": "4",
            "criteriaD.sem2": "-",
            "finalLevel.D": "4",
            
            "seuil": "18",
            "note": "5"
        },
        // ... autres matières
    ]
}
```

---

## 🔧 MODIFICATIONS À FAIRE DANS LE TEMPLATE WORD

### 1. RTL pour les Observations Arabes

#### Étape 1: Ouvrir le template Word
```
1. Télécharger: https://docs.google.com/document/d/18eo_E2ex8K5xu5ce6BQhN8MWi5mL_Nga/export?format=docx
2. Ouvrir avec Microsoft Word
```

#### Étape 2: Trouver la balise {teacherComment}
```
1. Ctrl+F (Rechercher)
2. Chercher: {teacherComment}
3. Localiser toutes les occurrences
```

#### Étape 3: Appliquer RTL
```
Pour chaque occurrence de {teacherComment}:

1. Sélectionner le paragraphe ENTIER contenant {teacherComment}
2. Onglet "Accueil" → Section "Paragraphe"
3. Cliquer sur l'icône "De droite à gauche" (RTL)
   
   OU
   
   Raccourci clavier: Ctrl+Shift+R

4. Vérifier: Le paragraphe doit s'aligner à droite
```

**Résultat attendu**:
```
Avant:
┌─────────────────────────────────┐
│ Observations:                   │
│ {teacherComment}                │
└─────────────────────────────────┘

Après:
┌─────────────────────────────────┐
│                   :Observations │
│                {teacherComment} │  ← Aligné à droite
└─────────────────────────────────┘
```

---

### 2. Vérifier les Balises du Tableau Arabe

#### Balises à vérifier dans le tableau معايير التقييم

Le tableau doit contenir une boucle sur `contributionsBySubject`:

```
{#contributionsBySubject}

┌──────────────────────────────────────────────────────────┐
│ Matière: {subjectSelected}                               │
│ Enseignant: {teacherName}                                │
├──────────────────────────────────────────────────────────┤
│ المعايير │ الفصل الأول │ الفصل الثاني │ المستوى النهائي │
├──────────┼─────────────┼──────────────┼──────────────────┤
│ {criteriaKey.A}: {criteriaName A}                        │
│          │ {criteriaA.sem1} │ {criteriaA.sem2} │ {finalLevel.A} │
├──────────┼─────────────┼──────────────┼──────────────────┤
│ {criteriaKey.B}: {criteriaName B}                        │
│          │ {criteriaB.sem1} │ {criteriaB.sem2} │ {finalLevel.B} │
├──────────┼─────────────┼──────────────┼──────────────────┤
│ {criteriaKey.C}: {criteriaName C}                        │
│          │ {criteriaC.sem1} │ {criteriaC.sem2} │ {finalLevel.C} │
├──────────┼─────────────┼──────────────┼──────────────────┤
│ {criteriaKey.D}: {criteriaName D}                        │
│          │ {criteriaD.sem1} │ {criteriaD.sem2} │ {finalLevel.D} │
├──────────┴─────────────┴──────────────┴──────────────────┤
│ المجموع الكلي: {seuil}/32                                │
│ الدرجة النهائية: {note}/8                                │
└──────────────────────────────────────────────────────────┘

Observations:
{teacherComment}

{/contributionsBySubject}
```

**Points critiques**:
1. ✅ La boucle doit commencer par `{#contributionsBySubject}`
2. ✅ La boucle doit se terminer par `{/contributionsBySubject}`
3. ✅ Toutes les balises doivent être EXACTEMENT comme ci-dessus (respecter les points)
4. ✅ Ne pas oublier les points dans: `criteriaKey.A`, `criteriaName A`, `criteriaA.sem1`, etc.

---

### 3. Vérifier la Structure Complète

Le template doit avoir cette structure:

```
┌─────────────────────────────────────────────────┐
│ Livret Scolaire IB                              │
│                                                 │
│ Élève: {studentSelected}                        │
│ Classe: {className}                             │
│ Date de naissance: {studentBirthdate}           │
│ Photo: {image}                                  │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Tableau 1: Compétences ATL                      │
│                                                 │
│ {#atlSummaryTable}                              │
│ Matière │ Comm │ Colla │ Auto │ Rech │ Réflex │
│ {subject} │ {communication} │ {collaboration} │ ... │
│ {/atlSummaryTable}                              │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Tableau 2: Détails par Matière                  │
│                                                 │
│ {#contributionsBySubject}                       │
│                                                 │
│ Matière: {subjectSelected}                      │
│ Enseignant: {teacherName}                       │
│                                                 │
│ Critères:                                       │
│ A: {criteriaName A}                             │
│    Sem1: {criteriaA.sem1}                       │
│    Sem2: {criteriaA.sem2}                       │
│    Final: {finalLevel.A}                        │
│ [... B, C, D ...]                               │
│                                                 │
│ Observations:                                   │
│ {teacherComment}  ← RTL pour l'arabe           │
│                                                 │
│ {/contributionsBySubject}                       │
└─────────────────────────────────────────────────┘
```

---

## ✅ CHECKLIST DE VÉRIFICATION

### Avant de sauvegarder le template

- [ ] ✅ Boucle `{#atlSummaryTable}` ... `{/atlSummaryTable}` présente
- [ ] ✅ Boucle `{#contributionsBySubject}` ... `{/contributionsBySubject}` présente
- [ ] ✅ Toutes les balises avec points: `criteriaKey.A`, `criteriaA.sem1`, etc.
- [ ] ✅ Paragraphe {teacherComment} en mode RTL (Ctrl+Shift+R)
- [ ] ✅ Pas d'espaces autour des balises: `{criteriaA.sem1}` et non `{ criteriaA.sem1 }`
- [ ] ✅ Toutes les balises entre accolades: `{...}` et non `...`

### Test après modification

```
1. Sauvegarder le template Word
2. Upload sur Google Drive
3. Copier le lien d'export:
   https://docs.google.com/document/d/[ID]/export?format=docx
4. Mettre à jour TEMPLATE_URL dans Vercel
5. Tester la génération d'un livret
6. Vérifier:
   ✅ Notes A, B, C, D affichées
   ✅ Valeurs sem1, sem2, finalLevel affichées
   ✅ Texte arabe en RTL
   ✅ Pas d'erreur DocxTemplater
```

---

## 🐛 RÉSOLUTION DE PROBLÈMES

### Si les notes ne s'affichent toujours pas

1. **Vérifier les noms de balises**
   ```
   ❌ Mauvais: {criteriaA_sem1}
   ✅ Bon: {criteriaA.sem1}
   
   ❌ Mauvais: {criteriaNameA}
   ✅ Bon: {criteriaName A}  (avec espace)
   ```

2. **Vérifier la boucle**
   ```
   ❌ Mauvais: {#contributions}
   ✅ Bon: {#contributionsBySubject}
   ```

3. **Vérifier la fermeture**
   ```
   ❌ Mauvais: {/contributions}
   ✅ Bon: {/contributionsBySubject}
   ```

### Si le RTL ne fonctionne pas

1. **Vérifier la direction du paragraphe**
   ```
   1. Sélectionner le paragraphe
   2. Format → Paragraphe
   3. Onglet "Indents and Spacing"
   4. Direction: "Right-to-left"
   ```

2. **Alternative: Utiliser un style**
   ```
   1. Créer un style "Arabic Text"
   2. Direction: RTL
   3. Alignement: Droite
   4. Appliquer à tous les paragraphes arabes
   ```

---

## 📝 EXEMPLE COMPLET

Voici un exemple complet de section matière arabe dans le template:

```
{#contributionsBySubject}

==========================================
معايير التقييم (المادة)
==========================================

المادة: {subjectSelected}
المعلم: {teacherName}

┌────────────────────────────────────────┐
│ المعايير                                │
├─────────┬──────┬──────┬─────┬──────────┤
│ المعيار │ الفصل │ الفصل │ المستوى │ الملاحظات │
│         │ الأول │ الثاني │ النهائي │          │
├─────────┼──────┼──────┼─────┼──────────┤
│ {criteriaKey.A}: {criteriaName A}      │
│         │ {criteriaA.sem1} │ {criteriaA.sem2} │ {finalLevel.A} │          │
├─────────┼──────┼──────┼─────┼──────────┤
│ {criteriaKey.B}: {criteriaName B}      │
│         │ {criteriaB.sem1} │ {criteriaB.sem2} │ {finalLevel.B} │          │
├─────────┼──────┼──────┼─────┼──────────┤
│ {criteriaKey.C}: {criteriaName C}      │
│         │ {criteriaC.sem1} │ {criteriaC.sem2} │ {finalLevel.C} │          │
├─────────┼──────┼──────┼─────┼──────────┤
│ {criteriaKey.D}: {criteriaName D}      │
│         │ {criteriaD.sem1} │ {criteriaD.sem2} │ {finalLevel.D} │          │
├─────────┴──────┴──────┴─────┴──────────┤
│ المجموع الكلي (32/): {seuil}           │
│ الدرجة النهائية (8/): {note}           │
└────────────────────────────────────────┘

الملاحظات:
{teacherComment}
↑ Ce paragraphe doit être en RTL (Ctrl+Shift+R)

==========================================

{/contributionsBySubject}
```

---

## 🔗 RESSOURCES

### Documentation DocxTemplater
- [Loops](https://docxtemplater.com/docs/tag-types/#loops)
- [Conditions](https://docxtemplater.com/docs/tag-types/#conditions)
- [Raw XML](https://docxtemplater.com/docs/tag-types/#raw-xml)

### Microsoft Word RTL
- [Enable RTL](https://support.microsoft.com/en-us/office/change-text-direction-right-to-left-languages-4c7c3dfe-9abd-4466-87f4-5cb5df975a5e)
- [Paragraph Direction](https://support.microsoft.com/en-us/office/format-text-or-numbers-as-right-to-left-79d0f0a3-ae1e-4c34-94e2-9c77ffc8efa1)

---

## ✅ CONCLUSION

Après avoir suivi ces instructions:

1. ✅ Le texte arabe des observations s'affichera de droite à gauche
2. ✅ Les notes du tableau معايير التقييم s'afficheront correctement
3. ✅ Toutes les valeurs (sem1, sem2, finalLevel) seront visibles
4. ✅ Le livret sera professionnel et lisible

**Prochaines étapes**:
1. Modifier le template Word selon ces instructions
2. Sauvegarder et uploader sur Google Drive
3. Mettre à jour TEMPLATE_URL
4. Tester avec un élève en matière arabe
5. Vérifier le livret généré

---

**Dernière mise à jour**: 16 Janvier 2026  
**Version**: 2.0.3  
**Statut**: 📝 **INSTRUCTIONS COMPLÈTES**
