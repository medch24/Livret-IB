# 📚 Système de Gestion des Livrets Scolaires IB

[![Production Ready](https://img.shields.io/badge/status-production%20ready-success)]()
[![Version](https://img.shields.io/badge/version-2.0-blue)]()
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)]()
[![MongoDB](https://img.shields.io/badge/mongodb-Atlas-green)]()

Application web complète pour la gestion et la génération automatique des livrets scolaires selon le Programme d'Éducation Intermédiaire (PEI) et le Programme du Diplôme (DP) de l'IB.

## ✨ Fonctionnalités

### 📝 Saisie des Contributions
- **Compétences ATL** (Approche de l'Apprentissage)
  - Communication, Collaboration, Autogestion, Recherche, Réflexion
  - Évaluations: E (Excellent), A (Acquis), PA (Partiellement Acquis), I (Insuffisant)
- **Critères d'évaluation** (A, B, C, D)
  - PEI: Notes sur 8, seuil sur 32
  - DP: Notes sur 7, seuil sur 28
- **Support bilingue** (Français/Arabe avec interface RTL)

### 📥 Génération de Livrets
- **Livret individuel** (format Word .docx)
- **ZIP classe complète** (tous les élèves)
- **Images optimisées** (60x60px, ~1KB par image)
- **Template Google Docs** personnalisable

### 🖼️ Gestion des Images
- **20 photos d'élèves** depuis Google Drive
- **Compression optimale**: 99.4% (3.46MB → 19.2KB)
- **Résolution adaptée**: 60x60 pixels
- **Support élèves sans photo** (image transparente automatique)

### 💾 Base de Données
- **MongoDB Atlas** avec retry automatique
- **Collections**: contributions, students
- **Index uniques** pour éviter les doublons
- **Migration automatique** des anciennes données

## 🚀 Démarrage Rapide

### Prérequis
```bash
Node.js >= 18.0.0
npm ou yarn
Compte MongoDB Atlas
Compte Vercel (pour le déploiement)
```

### Installation Locale
```bash
# Cloner le dépôt
git clone https://github.com/medch24/Livret-IB.git
cd Livret-IB

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# Démarrer le serveur
npm start
```

### Variables d'Environnement
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=Livret2026
DB_NAME=teacherContributionsDB
TEMPLATE_URL=https://docs.google.com/document/d/[ID]/export?format=docx
PORT=3000
```

## 📖 Documentation

### Guides Principaux
- [📋 RESUME_FINAL_CORRECTIONS.md](./RESUME_FINAL_CORRECTIONS.md) - Résumé complet des corrections
- [🚀 GUIDE_RAPIDE.md](./GUIDE_RAPIDE.md) - Guide rapide d'utilisation
- [📖 GUIDE_UTILISATEUR_FINAL.md](./GUIDE_UTILISATEUR_FINAL.md) - Guide utilisateur détaillé
- [🔧 CORRECTION_IMAGE_ET_ATL.md](./CORRECTION_IMAGE_ET_ATL.md) - Détails techniques

### Scripts Utiles
- [🔄 migrate_arabic_values.js](./migrate_arabic_values.js) - Migration des évaluations ATL

## 🏗️ Architecture

```
Livret-IB/
├── api/
│   └── index.js              # Backend Express + MongoDB
├── public/
│   ├── index.html           # Interface utilisateur
│   ├── script.js            # Logique frontend
│   └── style.css            # Styles CSS
├── package.json             # Dépendances npm
├── vercel.json              # Configuration Vercel
└── docs/                    # Documentation
```

## 🛠️ Technologies

### Backend
- **Node.js** + **Express** (API REST)
- **MongoDB** (base de données Atlas)
- **DocxTemplater** (génération Word)
- **Sharp** (optimisation images)
- **Archiver** (génération ZIP)

### Frontend
- **HTML5** + **CSS3** + **Vanilla JavaScript**
- **RTL Support** (arabe)
- **Responsive Design**

### Déploiement
- **Vercel** (déploiement automatique)
- **GitHub** (contrôle de version)

## 📊 Performances

### Images
```
📦 Taille originale: 3.46 MB (20 images)
🗜️  Taille compressée: 19.2 KB
📉 Compression: 99.4%
📐 Résolution: 60x60 pixels
⚡ Taille moyenne: ~1 KB/image
```

### Temps de Génération
```
⏱️  Image individuelle: ~500ms
⏱️  Livret individuel: ~2-3s
⏱️  ZIP classe (20 élèves): ~60-90s
📁 Taille livret: ~500KB (vs 5-10MB avant)
```

## 🧪 Tests

### Test des Images Google Drive
```bash
# Installer les dépendances
npm install

# Tests validés
✅ 20/20 images téléchargées avec succès
✅ Compression moyenne: 99.4%
✅ Formats supportés: PNG, JPG, WebP
```

### Migration des Données
```bash
# Test sans modification
node migrate_arabic_values.js --dry-run

# Appliquer la migration
node migrate_arabic_values.js
```

## 📝 Utilisation

### 1. Remplir les Contributions
1. Sélectionner **Section** (Garçons/Filles)
2. Sélectionner **Classe** (PEI1-5, DP1-2)
3. Sélectionner **Élève**
4. Choisir **Matière**
5. Remplir **Compétences ATL** (E, A, PA, I)
6. Remplir **Critères** (A, B, C, D)
7. Ajouter **Commentaire** et **Nom enseignant**
8. Cliquer **Soumettre**

### 2. Générer les Livrets
#### Livret Individuel
- Cliquer sur le bouton de téléchargement pour l'élève
- Fichier Word généré: `Livret-[Nom]-Semestre.docx`

#### ZIP Classe
- Cliquer **"Générer ZIP Classe"**
- Sélectionner la classe
- Attendre la barre de progression
- ZIP téléchargé: `Livrets-[Classe]-[Date].zip`

## 🔧 Maintenance

### Logs et Débogage
Les logs détaillés sont disponibles dans la console:
```javascript
📷 Fetching image...
✅ Image fetched: X bytes
📐 Redimensionnement et compression...
✅ Image redimensionnée: X → Y bytes (60x60px)
```

### Endpoint Santé
```bash
GET /api/health
```

Réponse:
```json
{
  "status": "ok",
  "mongodb": "connected",
  "timestamp": "2026-01-15T..."
}
```

## 🤝 Contribution

Les contributions sont les bienvenues! Pour contribuer:

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📜 Licence

Ce projet est développé pour un usage éducatif dans le cadre du Programme IB.

## 👥 Équipe

**Développement:** Système de livrets scolaires IB  
**Repository:** [github.com/medch24/Livret-IB](https://github.com/medch24/Livret-IB)

## 📞 Support

Pour toute question ou problème:
1. Consulter la [documentation complète](./RESUME_FINAL_CORRECTIONS.md)
2. Vérifier le [guide de dépannage](./GUIDE_UTILISATEUR_FINAL.md#-dépannage)
3. Ouvrir une issue sur GitHub

## 🎉 Remerciements

Merci à tous les contributeurs et utilisateurs du système!

## 📅 Historique des Versions

### Version 2.0 (2026-01-15) - Production Ready
- ✅ Optimisation images Google Drive (99.4% compression)
- ✅ Évaluations ATL standardisées (E, A, PA, I)
- ✅ Image transparente pour élèves sans photo
- ✅ Documentation complète
- ✅ Scripts de migration
- ✅ Tests validés (20/20 images)

### Version 1.0 (Précédente)
- ✅ Système de base fonctionnel
- ✅ Génération de livrets Word
- ✅ Support MongoDB
- ✅ Interface bilingue

---

**Version:** 2.0  
**Date:** 2026-01-15  
**Statut:** ✅ Production Ready  
**Commit:** `ab8efd4`

🎓 **Système prêt pour la production!** 📚
