# 📸 Guide de Gestion des Photos des Élèves

## ✅ Corrections Appliquées

### 1. Standardisation des Noms de Fichiers
Toutes les photos ont été renommées pour correspondre **exactement** aux `fullName` définis dans `script.js`.

### 2. Organisation des Fichiers
- **Ancien emplacement**: Racine du projet (désorganisé)
- **Nouvel emplacement**: `public/photos/` (organisé et professionnel)

### 3. Mise à Jour de l'API
Le fichier `api/index.js` cherche maintenant les photos dans l'ordre suivant:
1. URL stockée dans MongoDB (`studentInfo.studentPhotoUrl`)
2. Fichier local dans `public/photos/` avec le `fullName` exact
3. Pixel transparent si aucune photo n'est trouvée

## 📋 Liste des Photos Disponibles

### ✅ Garçons PEI1 (4/4)
- Faysal Achar.jpg
- Bilal Molina.jpg
- Jad Mahayni.jpg
- Manaf Kotbi.jpg

### ✅ Garçons PEI2 (4/4)
- Ahmed Bouaziz.png
- Ali Kutbi.png
- Eyad Hassan.png
- Yasser Younes.png

### ⚠️ Garçons PEI3 (4/5)
- Adam Kaaki.png
- Mohamed Chalak.png
- Seifeddine Ayadi.png
- Wajih Sabadine.png
- ❌ **Ahmad Mahayni** (photo manquante)

### ✅ Garçons PEI4 (5/5)
- Abdulrahman Bouaziz.png
- Mohamed Amine Sgheir.png
- Mohamed Younes.png
- Samir Kaaki.png
- Youssef Baakak.png

### ✅ Garçons DP2 (2/2)
- Habib Lteif.png
- Salah Boumalouga.png

### ❌ Filles (0/14)
Toutes les photos des filles sont manquantes:
- Naya Sabbidine (PEI1)
- Israa Alkattan, Dina Tlili, Lina Tlili, Cynthia Fadlallah, Neyla Molina (PEI2)
- Jawahair Eshmawi (PEI3)
- Yousr Letaief, Sarah Aldebasy, Maria Wahib (PEI4)
- Badia Khaldi, Luluwah Alghabashi (PEI5)
- Yomna Masrouhi (DP1)
- Isra Elalmi (DP2)

## 📝 Convention de Nommage

### Format Requis
```
[fullName].[extension]
```

**Exemples corrects**:
- ✅ `Faysal Achar.jpg`
- ✅ `Mohamed Amine Sgheir.png`
- ✅ `Abdulrahman Bouaziz.png`

**Exemples incorrects**:
- ❌ `Faysal.jpg` (prénom seul)
- ❌ `faysal achar.jpg` (minuscules)
- ❌ `Faysal_Achar.jpg` (underscore)
- ❌ `FAYSAL ACHAR.jpg` (majuscules)

### Extensions Acceptées
- `.jpg`, `.JPG`
- `.png`, `.PNG`
- `.jpeg`, `.JPEG`

## 🔧 Ajouter une Nouvelle Photo

### Méthode 1: Fichier Local
1. Nommer le fichier exactement comme le `fullName` dans `script.js`
2. Placer le fichier dans `public/photos/`
3. Vérifier que l'extension est correcte (`.jpg`, `.png`, `.jpeg`)

### Méthode 2: URL en Base de Données
1. Ajouter l'URL dans MongoDB dans le champ `studentPhotoUrl`
2. L'API utilisera automatiquement cette URL en priorité

## 🛠️ Script d'Automatisation

Un script `rename_photos.sh` a été créé pour faciliter les renommages futurs.

### Utilisation:
```bash
cd /home/user/webapp
./rename_photos.sh
```

## 🚀 Déploiement

Tous les changements ont été committé et poussés sur la branche `main`:

**Commits**:
1. `fa0b70d` - Amélioration gestion photos et erreurs
2. `86bcf5a` - Organisation photos avec noms standardisés

**Repository**: https://github.com/medch24/Livret-IB

## 🎯 Prochaines Étapes

1. **Ajouter la photo manquante**: Ahmad Mahayni
2. **Ajouter les photos des filles**: 14 photos manquantes
3. **Tester la génération des livrets**: Vérifier que toutes les photos apparaissent correctement

## 📊 Statistique Finale

- **Total garçons**: 19/20 photos (95%)
- **Total filles**: 0/14 photos (0%)
- **Total général**: 19/34 photos (56%)

## ⚠️ Important

**Ne jamais renommer manuellement les photos** sans mettre à jour le `fullName` correspondant dans `script.js`, sinon les photos ne seront pas trouvées lors de la génération des livrets.

## 🔍 Dépannage

### La photo ne s'affiche pas dans le livret

1. Vérifier le nom du fichier dans `public/photos/`
2. Comparer avec le `fullName` dans `script.js` ligne 40-76
3. Vérifier l'extension du fichier (`.jpg`, `.png`, `.jpeg`)
4. Vérifier les logs de l'API dans la console

### Logs utiles

L'API affiche maintenant:
- `✅ Photo trouvée: [nom]` quand une photo est trouvée
- `⚠️ Aucune photo trouvée pour: [nom]` quand aucune photo n'existe
- `🖼️ Tentative de chargement de l'image: [url]` pour chaque tentative
