# 📸 NOTE SUR LA PHOTO DE L'ÉLÈVE

## 🎯 Balise photo

La balise pour insérer la photo de l'élève dans le modèle Word est :

```
{image}
```

---

## ⚠️ STATUT ACTUEL : DÉSACTIVÉE

La fonctionnalité photo est **temporairement désactivée** pour des raisons de sécurité.

### Raison technique

Le module `docxtemplater-image-module-free` présente des vulnérabilités de sécurité. Il a donc été désactivé dans le code (voir `api/index.js` ligne 16 et ligne 388).

**Code actuel :**
```javascript
// Ligne 16 : Module commenté
// const ImageModule = require('docxtemplater-image-module-free'); 

// Ligne 388 : Image désactivée
const dataToRender = {
    ...documentData,
    image: "" // Pas d'image pour éviter les vulnérabilités
};
```

---

## 🎨 UTILISATION DANS LE MODÈLE WORD

### Option 1 : Inclure la balise (recommandé)

**Incluez quand même la balise `{image}`** dans votre modèle Word :

```
┌────────────────────────────────────┐
│  LIVRET SCOLAIRE IB 2026           │
│                                    │
│  ┌──────────────┐                  │
│  │              │                  │
│  │   {image}    │                  │
│  │              │                  │
│  └──────────────┘                  │
│                                    │
│  Nom : {studentSelected}           │
│  Classe : {className}              │
└────────────────────────────────────┘
```

**Avantages :**
- ✅ Le modèle est prêt pour le futur
- ✅ Pas d'erreur (balise remplacée par "")
- ✅ Structure en place
- ✅ Facile de réactiver plus tard

**Résultat actuel :** La balise `{image}` sera remplacée par une chaîne vide (rien ne s'affichera).

---

### Option 2 : Ne pas inclure la balise

Si vous ne voulez pas d'espace pour la photo, ne mettez tout simplement pas la balise `{image}` dans votre modèle.

---

## 🔄 COMMENT RÉACTIVER LES PHOTOS (Avancé)

Si vous souhaitez réactiver les images plus tard, voici les étapes :

### Étape 1 : Installer un module sécurisé

Remplacer `docxtemplater-image-module-free` par une version sécurisée :

```bash
npm uninstall docxtemplater-image-module-free
npm install docxtemplater-image-module
```

Ou utiliser un autre module compatible :
```bash
npm install open-docxtemplater-image-module
```

---

### Étape 2 : Modifier le code

**Fichier :** `api/index.js`

#### A. Ligne 16 : Décommenter et mettre à jour l'import
```javascript
// Avant (désactivé)
// const ImageModule = require('docxtemplater-image-module-free');

// Après (activé avec module sécurisé)
const ImageModule = require('docxtemplater-image-module');
```

---

#### B. Lignes 378-382 : Ajouter le module d'image

**Avant :**
```javascript
const doc = new DocxTemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    nullGetter: () => ""
});
```

**Après :**
```javascript
// Configuration du module d'image
const imageOpts = {
    centered: false, // true pour centrer l'image
    getImage: function(tagValue) {
        // tagValue contient le buffer de l'image
        return tagValue;
    },
    getSize: function(img, tagValue, tagName) {
        // Retourner [largeur, hauteur] en pixels
        return [150, 150]; // Taille de la photo : 150x150 pixels
    }
};

const doc = new DocxTemplater(zip, {
    modules: [new ImageModule(imageOpts)],
    paragraphLoop: true,
    linebreaks: true,
    nullGetter: () => ""
});
```

---

#### C. Ligne 388 : Passer le buffer de l'image

**Avant :**
```javascript
const dataToRender = {
    ...documentData,
    image: "" // Pas d'image pour éviter les vulnérabilités
};
```

**Après :**
```javascript
const dataToRender = {
    ...documentData,
    image: imageBuffer // Buffer de l'image passé en paramètre
};
```

**Note :** Le paramètre `imageBuffer` est déjà présent dans la fonction (ligne 330), il suffit de l'utiliser.

---

### Étape 3 : Tester

1. Commit et push les changements
2. Redéployer sur Vercel
3. Tester avec un élève qui a une photo
4. Vérifier que la photo apparaît dans le document généré

---

## 📊 DÉTAILS TECHNIQUES

### Flux actuel (photo désactivée)

```
┌─────────────────────────────────────────────────┐
│ 1. Frontend envoie studentPhotoUrl              │
│    ↓                                             │
│ 2. Backend reçoit l'URL mais l'ignore           │
│    ↓                                             │
│ 3. imageBuffer reste null                       │
│    ↓                                             │
│ 4. image: "" dans dataToRender                  │
│    ↓                                             │
│ 5. Balise {image} remplacée par ""              │
│    ↓                                             │
│ 6. Document généré sans photo                   │
└─────────────────────────────────────────────────┘
```

---

### Flux futur (photo activée)

```
┌─────────────────────────────────────────────────┐
│ 1. Frontend envoie studentPhotoUrl              │
│    ↓                                             │
│ 2. Backend télécharge l'image                   │
│    ↓ fetchImage(studentPhotoUrl)                │
│ 3. imageBuffer = Buffer de l'image              │
│    ↓                                             │
│ 4. image: imageBuffer dans dataToRender         │
│    ↓                                             │
│ 5. ImageModule traite le buffer                 │
│    ↓                                             │
│ 6. Balise {image} remplacée par l'image         │
│    ↓                                             │
│ 7. Document généré avec photo                   │
└─────────────────────────────────────────────────┘
```

---

## 🎨 MISE EN FORME DE LA PHOTO DANS WORD

### Placement recommandé

**En haut à gauche ou à droite de l'en-tête :**

```
┌────────────────────────────────────────┐
│  ┌────────┐  LIVRET SCOLAIRE IB 2026   │
│  │        │                             │
│  │{image} │  Nom : {studentSelected}    │
│  │        │  Classe : {className}       │
│  └────────┘  Date : {studentBirthdate}  │
└────────────────────────────────────────┘
```

---

### Dans un tableau

```
┌─────────────────┬──────────────────────┐
│     Photo       │   Informations       │
├─────────────────┼──────────────────────┤
│                 │                      │
│    {image}      │ Nom : {studentSelec} │
│                 │ Classe : {className} │
│                 │ Date : {studentBirt} │
└─────────────────┴──────────────────────┘
```

---

### Centrée en haut

```
         ┌────────────┐
         │            │
         │  {image}   │
         │            │
         └────────────┘

    LIVRET SCOLAIRE IB 2026
    
    Nom : {studentSelected}
    Classe : {className}
```

---

## 🔍 VÉRIFIER SI UNE PHOTO EST DISPONIBLE

Le code vérifie déjà si une photo existe :

**Ligne 641 (api/index.js) :**
```javascript
let imageBuffer = null;
if (studentPhotoUrl && studentPhotoUrl.startsWith('http')) {
    imageBuffer = await fetchImage(studentPhotoUrl);
}
```

**Donc :**
- ✅ Si l'élève a une photo → `imageBuffer` contient l'image
- ✅ Si pas de photo → `imageBuffer = null`
- ✅ Pas d'erreur même sans photo

---

## 📋 RÉCAPITULATIF

| Aspect | État actuel | Action pour activer |
|--------|-------------|---------------------|
| **Balise** | `{image}` | ✅ Déjà définie |
| **Module** | ❌ Désactivé (sécurité) | Installer module sécurisé |
| **Code** | ❌ image: "" | Changer en image: imageBuffer |
| **Modèle Word** | ⚠️ À inclure | Ajouter `{image}` à l'emplacement souhaité |
| **Tests** | ❌ Non testé | Tester après activation |

---

## ⚡ DÉCISION RECOMMANDÉE

### Pour le modèle actuel :

**✅ INCLUEZ la balise `{image}`** dans votre modèle Word même si elle est désactivée.

**Raisons :**
1. Pas d'impact (remplacée par "")
2. Structure prête pour le futur
3. Pas besoin de recréer le modèle plus tard
4. Aucune erreur générée

---

### Pour l'activation future :

**⏳ ATTENDEZ** que le projet soit stable avant de réactiver les photos.

**Raisons :**
1. Besoin de tester avec un module sécurisé
2. Vérifier la taille et qualité des images
3. Tester la performance (images = fichiers plus lourds)
4. S'assurer que toutes les photos sont disponibles

---

## 📞 QUESTIONS FRÉQUENTES

### Q : La balise {image} va-t-elle causer une erreur ?
**R :** Non, elle sera remplacée par une chaîne vide. Aucune erreur.

### Q : Puis-je mettre une image statique à la place ?
**R :** Oui, mais elle sera la même pour tous les élèves. Pas recommandé.

### Q : Quelle taille d'image recommandée ?
**R :** 150x150 pixels pour une photo d'identité, 200x200 pour plus de détails.

### Q : Format d'image supporté ?
**R :** JPG et PNG sont les plus courants et supportés.

### Q : Les photos ralentissent-elles la génération ?
**R :** Légèrement. Chaque photo doit être téléchargée et intégrée.

---

**Document créé pour le projet Livret-IB**  
**Dernière mise à jour : 2026-01-08**  
**Note : Photo actuellement désactivée pour raisons de sécurité**
