# ✅ CHECKLIST CRÉATION MODÈLE WORD

## 📋 AVANT DE COMMENCER

- [ ] J'ai lu `README_MODELE_WORD.md`
- [ ] J'ai ouvert `BALISES_MODELE_WORD.md` dans un onglet
- [ ] J'ai `TABLEAU_RECAPITULATIF_BALISES.md` comme référence
- [ ] J'ai Word (ou équivalent) installé
- [ ] Je sais où héberger le fichier final

---

## 🎨 CRÉATION DU MODÈLE

### Section 1 : En-tête du document
- [ ] Titre "LIVRET SCOLAIRE IB 2026" ajouté
- [ ] Balise `{studentSelected}` insérée
- [ ] Balise `{className}` insérée
- [ ] Balise `{studentBirthdate}` insérée
- [ ] Mise en forme appliquée (gras, taille, couleurs)

### Section 2 : Tableau ATL
- [ ] Tableau créé avec 6 colonnes
- [ ] En-têtes : Matière | Communication | Collaboration | Autogestion | Recherche | Réflexion
- [ ] Balise `{#atlSummaryTable}` AVANT le tableau
- [ ] Balise `{subject}` dans colonne 1
- [ ] Balise `{communication}` dans colonne 2
- [ ] Balise `{collaboration}` dans colonne 3
- [ ] Balise `{autogestion}` dans colonne 4
- [ ] Balise `{recherche}` dans colonne 5
- [ ] Balise `{reflexion}` dans colonne 6
- [ ] Balise `{/atlSummaryTable}` APRÈS le tableau

### Section 3 : Boucle des matières
- [ ] Balise `{#contributionsBySubject}` insérée
- [ ] Titre avec balise `{subjectSelected}`
- [ ] Ligne "Professeur : `{teacherName}`"

### Section 4 : Tableau Critères PEI
- [ ] Tableau créé avec 5 colonnes
- [ ] En-têtes : Critère | Description | Semestre 1 | Semestre 2 | Niveau Final
- [ ] **Ligne A** :
  - [ ] `{criteriaKey.A}` | `{criteriaName A}` | `{criteriaA.sem1}` | `{criteriaA.sem2}` | `{finalLevel.A}`
- [ ] **Ligne B** :
  - [ ] `{criteriaKey.B}` | `{criteriaName B}` | `{criteriaB.sem1}` | `{criteriaB.sem2}` | `{finalLevel.B}`
- [ ] **Ligne C** :
  - [ ] `{criteriaKey.C}` | `{criteriaName C}` | `{criteriaC.sem1}` | `{criteriaC.sem2}` | `{finalLevel.C}`
- [ ] **Ligne D** :
  - [ ] `{criteriaKey.D}` | `{criteriaName D}` | `{criteriaD.sem1}` | `{criteriaD.sem2}` | `{finalLevel.D}`

### Section 5 : Tableau Objectifs DP
- [ ] Tableau créé avec 5 colonnes
- [ ] En-têtes : Objectif | Description | Semestre 1 | Semestre 2 | Niveau Final
- [ ] **Ligne AO1** :
  - [ ] `{criteriaKey.AO1}` | `{criteriaName AO1}` | `{criteriaAO1.sem1}` | `{criteriaAO1.sem2}` | `{finalLevel.AO1}`
- [ ] **Ligne AO2** :
  - [ ] `{criteriaKey.AO2}` | `{criteriaName AO2}` | `{criteriaAO2.sem1}` | `{criteriaAO2.sem2}` | `{finalLevel.AO2}`
- [ ] **Ligne AO3** :
  - [ ] `{criteriaKey.AO3}` | `{criteriaName AO3}` | `{criteriaAO3.sem1}` | `{criteriaAO3.sem2}` | `{finalLevel.AO3}`
- [ ] **Ligne AO4** :
  - [ ] `{criteriaKey.AO4}` | `{criteriaName AO4}` | `{criteriaAO4.sem1}` | `{criteriaAO4.sem2}` | `{finalLevel.AO4}`

### Section 6 : Notes finales
- [ ] Ligne "Total : `{seuil}`" ajoutée
- [ ] Ligne "Note finale : `{note}`" ajoutée

### Section 7 : Commentaire
- [ ] Section "Commentaire du professeur :" ajoutée
- [ ] Balise `{teacherComment}` insérée

### Section 8 : Fermeture de la boucle
- [ ] Balise `{/contributionsBySubject}` insérée

---

## 🔍 VALIDATION TECHNIQUE

### Vérification des balises
- [ ] Toutes les balises ont des accolades `{...}`
- [ ] Aucun espace dans les accolades (❌ `{ balise }` → ✅ `{balise}`)
- [ ] Majuscules/minuscules respectées exactement
- [ ] Pas de fautes de frappe dans les noms

### Vérification des boucles
- [ ] Chaque `{#...}` a un `{/...}` correspondant
- [ ] Les noms de boucles sont identiques (ouverture/fermeture)
- [ ] Les boucles sont dans le bon ordre (ATL puis contributionsBySubject)

### Vérification des tableaux
- [ ] Toutes les colonnes ont des balises
- [ ] Les balises sont dans les bonnes cellules
- [ ] Les tableaux sont bien formatés

---

## 💾 ENREGISTREMENT

- [ ] Format `.docx` (pas .doc, .odt, etc.)
- [ ] Nom de fichier clair (ex: `Livret_Modele_IB_2026.docx`)
- [ ] Taille du fichier raisonnable (< 5 MB)
- [ ] Fichier testé en l'ouvrant/fermant

---

## 🌐 HÉBERGEMENT

### Option choisie :
- [ ] GitHub Releases
- [ ] Cloudinary
- [ ] Google Drive
- [ ] Autre : ______________

### Vérifications hébergement
- [ ] Fichier uploadé avec succès
- [ ] URL publique obtenue
- [ ] URL testée dans un navigateur
- [ ] Téléchargement direct (pas de page de redirection)
- [ ] Accès public confirmé (incognito/navigation privée)

---

## 💻 MISE À JOUR DU CODE

- [ ] Fichier `api/index.js` ouvert
- [ ] Lignes 332-336 localisées
- [ ] URL principale insérée dans `templateURLs[0]`
- [ ] URL de secours 1 insérée dans `templateURLs[1]`
- [ ] URL de secours 2 insérée dans `templateURLs[2]`
- [ ] Fichier enregistré

---

## 🚀 DÉPLOIEMENT

```bash
# Commandes à exécuter :
git add api/index.js
git commit -m "chore: update Word template URL"
git push origin main
```

- [ ] Changements commitées
- [ ] Changements pushés sur GitHub
- [ ] Vercel a détecté le déploiement
- [ ] Déploiement terminé sans erreur

---

## 🧪 TESTS

### Test 1 : Génération simple
- [ ] Se connecter au site
- [ ] Sélectionner une section
- [ ] Sélectionner une classe
- [ ] Sélectionner un élève
- [ ] Cliquer sur "Générer Livret Word"
- [ ] Fichier .docx téléchargé
- [ ] Fichier s'ouvre dans Word
- [ ] Nom de l'élève correct
- [ ] Classe correcte
- [ ] Date de naissance affichée

### Test 2 : Vérification des données
- [ ] Toutes les matières présentes
- [ ] Notes sem1/sem2 affichées
- [ ] Niveaux finaux affichés
- [ ] Notes finales calculées
- [ ] Commentaires des profs présents
- [ ] Tableau ATL rempli

### Test 3 : Vérification technique
- [ ] Aucune balise visible (ex: `{studentSelected}`)
- [ ] Pas de cellules vides anormales
- [ ] Tableaux bien formatés
- [ ] Texte lisible
- [ ] Pas d'erreurs de mise en page

### Test 4 : Génération multiple
- [ ] Cliquer sur "Générer Tous les Livrets"
- [ ] Plusieurs fichiers téléchargés
- [ ] Chaque fichier a le bon nom d'élève
- [ ] Tous les fichiers s'ouvrent correctement
- [ ] Données différentes pour chaque élève

---

## 🐛 EN CAS DE PROBLÈME

### Si des balises sont visibles dans le document :
1. [ ] Vérifier l'orthographe exacte dans `TABLEAU_RECAPITULATIF_BALISES.md`
2. [ ] Corriger dans le modèle Word
3. [ ] Re-héberger le fichier
4. [ ] Mettre à jour l'URL dans le code
5. [ ] Recommiter et redéployer
6. [ ] Retester

### Si erreur 500 :
1. [ ] Tester l'URL du modèle dans un navigateur
2. [ ] Vérifier que le téléchargement fonctionne
3. [ ] Consulter les logs Vercel pour détails
4. [ ] Essayer une autre option d'hébergement
5. [ ] Vérifier que le fichier est bien en .docx

### Si tableaux vides :
1. [ ] Vérifier que les boucles sont correctes
2. [ ] Vérifier `{#...}` avant le contenu
3. [ ] Vérifier `{/...}` après le contenu
4. [ ] Pas d'erreur de nom de boucle

---

## 📊 COMPTAGE FINAL

**Nombre de balises vérifiées :**

- [ ] 3 balises élève
- [ ] 2 balises de boucle ouverture
- [ ] 2 balises de boucle fermeture
- [ ] 5 balises ATL
- [ ] 4 balises générales matière
- [ ] 20 balises critères PEI (5 × 4 critères)
- [ ] 20 balises objectifs DP (5 × 4 objectifs)

**Total : ~56 éléments vérifiés ✅**

---

## 🎉 FINALISATION

- [ ] Tous les tests réussis
- [ ] Documentation consultée au besoin
- [ ] Équipe informée du nouveau modèle
- [ ] URL de secours notée quelque part
- [ ] Ce fichier conservé pour référence future

---

## 📝 NOTES

**URL finale du modèle :**
```
_______________________________________________________
```

**Date de création :**
```
_______________________________________________________
```

**Hébergement choisi :**
```
_______________________________________________________
```

**Problèmes rencontrés (le cas échéant) :**
```
_______________________________________________________
_______________________________________________________
_______________________________________________________
```

---

✅ **MODÈLE CRÉÉ ET DÉPLOYÉ AVEC SUCCÈS !**

**Félicitations ! Votre modèle Word est maintenant opérationnel. 🎊**

---

*Document généré pour le projet Livret-IB*
*Pour toute question, consultez README_MODELE_WORD.md*
