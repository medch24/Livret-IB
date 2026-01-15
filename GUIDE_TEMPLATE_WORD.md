# 📘 Guide de modification du Template Word

## 🎯 Problème résolu

### Erreur rencontrée
```
Word a rencontré une erreur lors de l'ouverture du fichier.
* Vérifier les autorisations du fichier/lecteur.
* Vérifier que la mémoire et l'espace disque sont suffisants.
* Ouvrir le fichier avec le convertisseur Récupération de texte.
```

### Cause
DocxTemplater ne peut pas gérer des **boucles sur des tableaux vides** dans les tableaux Word. Quand un élève n'a aucune contribution, les tableaux `atlSummaryTable` et `contributionsBySubject` étaient vides `[]`, causant l'erreur.

### Solution appliquée
Au lieu de retourner des tableaux vides, on retourne maintenant des tableaux avec **une entrée contenant des tirets** (`"-"`).

---

## 📋 Structure du Template Word

### Balises simples (remplacées directement)
```
{studentSelected}       → Nom complet de l'élève
{className}            → Classe (PEI1, PEI2, etc.)
{studentBirthdate}     → Date de naissance formatée
{image}                → Photo de l'élève (buffer ou '')
```

### Boucles (répétées pour chaque élément)

#### 1. Boucle atlSummaryTable
**Syntaxe dans Word:**
```
{#atlSummaryTable}
  {subject} | {communication} | {collaboration} | {autogestion} | {recherche} | {reflexion}
{/atlSummaryTable}
```

**Données envoyées:**
```javascript
atlSummaryTable: [
  {
    subject: "Mathématiques",
    communication: "E",
    collaboration: "A",
    autogestion: "PA",
    recherche: "A",
    reflexion: "E"
  },
  // ... autres matières
]
```

#### 2. Boucle contributionsBySubject
**Syntaxe dans Word:**
```
{#contributionsBySubject}
  Matière: {subjectSelected}
  Enseignant: {teacherName}
  Commentaire: {teacherComment}
  
  Critère {criteriaKey.A}: {criteriaName A}
  Semestre 1: {criteriaA.sem1} | Semestre 2: {criteriaA.sem2} | Final: {finalLevel.A}
  
  Critère {criteriaKey.B}: {criteriaName B}
  Semestre 1: {criteriaB.sem1} | Semestre 2: {criteriaB.sem2} | Final: {finalLevel.B}
  
  Critère {criteriaKey.C}: {criteriaName C}
  Semestre 1: {criteriaC.sem1} | Semestre 2: {criteriaC.sem2} | Final: {finalLevel.C}
  
  Critère {criteriaKey.D}: {criteriaName D}
  Semestre 1: {criteriaD.sem1} | Semestre 2: {criteriaD.sem2} | Final: {finalLevel.D}
  
  Seuil: {seuil} | Note finale: {note}
{/contributionsBySubject}
```

**Données envoyées:**
```javascript
contributionsBySubject: [
  {
    subjectSelected: "Mathématiques",
    teacherName: "M. Dupont",
    teacherComment: "Excellent travail",
    "criteriaKey.A": "A",
    "criteriaName A": "Connaissances et compréhension",
    "criteriaA.sem1": "7",
    "criteriaA.sem2": "8",
    "finalLevel.A": "7",
    // ... critères B, C, D
    "seuil": "27",
    "note": "7"
  },
  // ... autres matières
]
```

---

## 🛠️ Comment modifier le template

### Option 1: Modification dans Word (Recommandé)

1. **Ouvrir le fichier .docx** dans Microsoft Word
2. **Afficher les balises:**
   - Appuyez sur `Alt+F9` pour voir les codes de champs
   - Ou: Fichier > Options > Avancées > Afficher les codes de champs

3. **Modifier les balises:**
   - Les balises simples: `{nomBalise}`
   - Début de boucle: `{#nomTableau}`
   - Fin de boucle: `{/nomTableau}`

4. **⚠️ ATTENTION aux balises fragmentées:**
   - Word fragmente parfois les balises en plusieurs `<w:t>`
   - Exemple incorrect:
     ```
     {student  |  Selected}  ← ERREUR! 
     ```
   - Solution: Retaper la balise en une fois sans interruption

5. **Enregistrer le template:**
   - Format: `.docx` (Microsoft Word 2007+)
   - Uploader sur Google Drive
   - Récupérer le lien d'export: `https://docs.google.com/document/d/ID/export?format=docx`

### Option 2: Modification avec Google Docs

1. **Créer/Ouvrir le document** dans Google Docs
2. **Insérer les balises** en texte normal: `{balise}`
3. **Créer les boucles:**
   ```
   {#atlSummaryTable}
   Contenu de la boucle
   {/atlSummaryTable}
   ```
4. **Télécharger en .docx**
5. **Uploader sur Google Drive** et récupérer le lien

---

## 🔍 Vérification du template

### Script Python pour vérifier les balises

```python
import zipfile
import re

def verify_template(docx_path):
    with zipfile.ZipFile(docx_path, 'r') as zip_ref:
        xml = zip_ref.read('word/document.xml').decode('utf-8')
        
        # Trouver toutes les balises
        tags = re.findall(r'{[^}]+}', xml)
        loop_starts = [t for t in tags if t.startswith('{#')]
        loop_ends = [t for t in tags if t.startswith('{/')]
        
        print("Balises trouvées:", set(tags))
        print("\nBoucles:")
        for start in loop_starts:
            name = start[2:-1]
            expected_end = f'{{/{name}}}'
            status = "✅" if expected_end in loop_ends else "❌"
            print(f"{status} {start} ... {expected_end}")

verify_template('template.docx')
```

### Utilisation:
```bash
cd /home/user/webapp
python3 verify_template.py
```

---

## 📝 Liste complète des balises disponibles

### Informations élève
- `{studentSelected}` - Nom complet
- `{className}` - Classe (PEI1, PEI2, etc.)
- `{studentBirthdate}` - Date de naissance
- `{image}` - Photo (buffer ou vide)

### Boucle atlSummaryTable (Compétences ATL)
- `{subject}` - Nom de la matière
- `{communication}` - E, A, PA ou I
- `{collaboration}` - E, A, PA ou I
- `{autogestion}` - E, A, PA ou I
- `{recherche}` - E, A, PA ou I
- `{reflexion}` - E, A, PA ou I

### Boucle contributionsBySubject (Critères par matière)
- `{subjectSelected}` - Nom de la matière
- `{teacherName}` - Nom de l'enseignant
- `{teacherComment}` - Commentaire de l'enseignant

#### Pour chaque critère (A, B, C, D):
- `{criteriaKey.X}` - Lettre du critère (A, B, C ou D)
- `{criteriaName X}` - Nom du critère (ex: "Connaissances et compréhension")
- `{criteriaX.sem1}` - Note semestre 1
- `{criteriaX.sem2}` - Note semestre 2
- `{finalLevel.X}` - Niveau final

#### Totaux:
- `{seuil}` - Somme des niveaux finaux (/32 pour PEI, /28 pour DP)
- `{note}` - Note finale (/8 pour PEI, /7 pour DP)

---

## ⚠️ Erreurs courantes et solutions

### 1. Boucles déséquilibrées
**Erreur:** `{#atlSummaryTable}` sans `{/atlSummaryTable}`

**Solution:** Vérifier que chaque `{#xxx}` a son `{/xxx}` correspondant

### 2. Balises fragmentées
**Erreur:** `{student` dans un `<w:t>` et `Selected}` dans un autre

**Solution:** Retaper la balise en une seule fois dans Word

### 3. Tableaux vides
**Erreur:** Boucle sur un tableau vide `[]`

**Solution:** Déjà corrigé dans le code backend (on envoie des tirets)

### 4. Nom de balise incorrect
**Erreur:** `{studentName}` au lieu de `{studentSelected}`

**Solution:** Utiliser exactement les noms listés ci-dessus

---

## 🔄 Variables d'environnement

Dans Vercel, configurez:

```env
TEMPLATE_URL=https://docs.google.com/document/d/18eo_E2ex8K5xu5ce6BQhN8MWi5mL_Nga/export?format=docx
MONGODB_URI=mongodb+srv://mohamedsherif:Mmedch86@livret2026.9owu7hs.mongodb.net/?appName=Livret2026
DB_NAME=teacherContributionsDB
```

---

## 📞 Support

En cas de problème avec le template:
1. Vérifier les logs Vercel pour voir les erreurs exactes
2. Télécharger le template et vérifier les balises avec le script Python
3. Retaper les balises problématiques dans Word sans interruption
4. Tester avec un élève ayant des contributions

---

## ✅ Changements récents

### Version actuelle (2026-01-15)

#### Fix: Tableaux vides
- **Avant:** `atlSummaryTable: []` → ERREUR Word
- **Après:** `atlSummaryTable: [{subject: "-", ...}]` → ✅ Fonctionne

#### Fix: Évaluation arabe standardisée
- **Avant:** م, م+, ج, غ (incompatible avec livrets)
- **Après:** E, A, PA, I (affiché avec traduction arabe)
- **Affichage:** `E: Excellent (ممتاز) | A: Acquis (مكتسب) | PA: Partiellement Acquis (مكتسب جزئياً) | I: Insuffisant (غير كافٍ)`

---

**Créé le:** 2026-01-15  
**Dernière mise à jour:** 2026-01-15
