# 📚 Système de Livrets Scolaires IB

Système de gestion automatisée des livrets scolaires pour le Programme d'Éducation Intermédiaire (PEI) et le Diplôme (DP) du Baccalauréat International.

[![GitHub](https://img.shields.io/badge/GitHub-medch24%2FLivret--IB-blue)](https://github.com/medch24/Livret-IB)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-green)](https://livret-ib.vercel.app)
[![Node](https://img.shields.io/badge/Node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)

---

## 🎯 Fonctionnalités

- ✅ Génération automatique de livrets Word personnalisés
- ✅ Support PEI (PEI1-PEI4) et DP (DP1-DP2)
- ✅ Modèles distincts selon le programme
- ✅ Photos d'élèves (150x150 px)
- ✅ Noms complets des élèves
- ✅ Export vers Word (.docx)
- ✅ Interface web intuitive

---

## 🚀 Démarrage Rapide

### Prérequis
- Node.js ≥ 18.0.0
- Compte MongoDB Atlas
- Compte Vercel (pour déploiement)

### Installation locale

```bash
# Cloner le dépôt
git clone https://github.com/medch24/Livret-IB.git
cd Livret-IB

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos valeurs

# Lancer le serveur
npm start
```

Le site sera accessible sur : http://localhost:3000

---

## 📊 Architecture

### Structure du projet

```
Livret-IB/
├── api/
│   └── index.js          # API principale Express
├── public/
│   ├── index.html        # Interface utilisateur
│   ├── script.js         # Logique frontend
│   └── style.css         # Styles
├── docs/                 # Documentation (15 fichiers)
└── package.json          # Dépendances
```

### Technologies utilisées

- **Backend :** Node.js, Express
- **Base de données :** MongoDB Atlas
- **Génération Word :** DocxTemplater, PizZip
- **Images :** docxtemplater-image-module-free
- **Déploiement :** Vercel
- **Frontend :** HTML, CSS, JavaScript vanilla

---

## 🔧 Configuration

### Variables d'environnement Vercel

```bash
# Base de données MongoDB
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/
DB_NAME=teacherContributionsDB

# Modèles Word
TEMPLATE_URL=https://docs.google.com/document/d/.../export?format=docx
TEMPLATE_URL_DP=https://docs.google.com/document/d/.../export?format=docx
```

**Guide détaillé :** [GUIDE_CONFIG_VERCEL.md](GUIDE_CONFIG_VERCEL.md)

---

## 📚 Documentation

### Démarrage

| Document | Description | Taille |
|----------|-------------|--------|
| [ACTION_IMMEDIATE.md](ACTION_IMMEDIATE.md) | ⚡ À lire en premier | 2.4 KB |
| [MISSION_ACCOMPLIE_FINALE.md](MISSION_ACCOMPLIE_FINALE.md) | Vue d'ensemble complète | 9.3 KB |
| [INDEX_DOCUMENTATION.md](INDEX_DOCUMENTATION.md) | Index de toute la doc | 9.7 KB |

### Guides techniques

| Document | Description | Taille |
|----------|-------------|--------|
| [GUIDE_CONFIG_VERCEL.md](GUIDE_CONFIG_VERCEL.md) | Configuration Vercel | 13 KB |
| [MODELE_DP1_DP2.md](MODELE_DP1_DP2.md) | Spécifications DP | 7.0 KB |
| [BALISES_MODELE_WORD.md](BALISES_MODELE_WORD.md) | Référence balises (54) | 16 KB |

### Résolution de problèmes

| Document | Description | Taille |
|----------|-------------|--------|
| [CORRECTION_MODULE_IMAGES.md](CORRECTION_MODULE_IMAGES.md) | Fix HTTP 500 | 8.1 KB |
| [RESUME_CORRECTION_HTTP500.md](RESUME_CORRECTION_HTTP500.md) | Résumé correction | 4.0 KB |

### Référence complète

| Document | Description | Taille |
|----------|-------------|--------|
| [README_MODELE_WORD.md](README_MODELE_WORD.md) | Création modèle Word | 7.8 KB |
| [GUIDE_RAPIDE_CREATION.md](GUIDE_RAPIDE_CREATION.md) | Création pas-à-pas | 7.7 KB |
| [CHECKLIST_CREATION_MODELE.md](CHECKLIST_CREATION_MODELE.md) | 56 checkpoints | 8.0 KB |
| [TABLEAU_RECAPITULATIF_BALISES.md](TABLEAU_RECAPITULATIF_BALISES.md) | Antisèche balises | 7.0 KB |
| [NOTE_PHOTO_ELEVE.md](NOTE_PHOTO_ELEVE.md) | Gestion photos | 11 KB |
| [MODIFICATIONS_PHOTOS_NOMS.md](MODIFICATIONS_PHOTOS_NOMS.md) | Changements DB | 7.0 KB |
| [CONFIGURATION_GOOGLE_DOCS.md](CONFIGURATION_GOOGLE_DOCS.md) | Config avancée | 8.4 KB |

**Total documentation :** 15 fichiers, ~140 KB, ~100 pages

---

## 🎓 Programmes supportés

### PEI (Programme d'Éducation Intermédiaire)

**Classes :** PEI1, PEI2, PEI3, PEI4  
**Critères :** A, B, C, D  
**Note :** /8  
**Matières :** 8 matières (Français, Anglais, Sciences, Maths, Arts, etc.)

### DP (Diplôme)

**Classes :** DP1, DP2  
**Objectifs :** AO1, AO2, AO3, AO4  
**Note :** /7  
**Matières :** 9 matières (Français, Anglais, Physique chimie, Histoire géographie, etc.)  
**Exclusions :** CAS, TDC, Mémoire (évalués séparément)

---

## 👥 Élèves

**Total :** 20 élèves (garçons)  
**Répartition :** PEI1 (4), PEI2 (4), PEI3 (5), PEI4 (5), DP2 (2)

**Liste complète :** [MODIFICATIONS_PHOTOS_NOMS.md](MODIFICATIONS_PHOTOS_NOMS.md)

---

## 🧪 Tests

### Test rapide (PEI)

```bash
# Via interface web
1. Ouvrir https://livret-ib.vercel.app
2. Sélectionner : Section A, PEI 2, Ali Kutbi
3. Cliquer : Générer le livret Word
4. Vérifier : Fichier Livret-Ali-Kutbi.docx téléchargé
```

### Test complet (DP)

```bash
# Via interface web
1. Ouvrir https://livret-ib.vercel.app
2. Sélectionner : Section A, DP 2, Habib Lteif
3. Cliquer : Générer le livret Word
4. Vérifier : AO1-4, Note /7, Pas CAS/TDC/Mémoire
```

**Guide complet :** [CHECKLIST_CREATION_MODELE.md](CHECKLIST_CREATION_MODELE.md)

---

## 📊 Statistiques

### Code
- **Commits :** 12 commits majeurs
- **Lignes de code :** ~1500 lignes (JS + HTML + CSS)
- **Modules NPM :** 6 dépendances principales
- **API Endpoints :** 8 routes

### Données
- **Élèves :** 20 élèves
- **Contributions :** 111 contributions mises à jour
- **Balises :** 54 balises documentées
- **Photos :** Taille 150x150 px

### Documentation
- **Fichiers :** 15 fichiers markdown
- **Volume :** ~140 KB
- **Pages :** ~100 pages équivalent A4
- **Guides :** 3 parcours (Express, Personnalisé, Dépannage)

---

## 🔗 Liens utiles

### Production
- **Site :** https://livret-ib.vercel.app
- **Dashboard Vercel :** https://vercel.com/dashboard

### Développement
- **GitHub :** https://github.com/medch24/Livret-IB
- **Template PEI :** [Google Docs PEI](https://docs.google.com/document/d/18eo_E2ex8K5xu5ce6BQhN8MWi5mL_Nga/edit)
- **Template DP :** [Google Docs DP](https://docs.google.com/document/d/10x3kKNk9TgCnlHKY7SyZADB6ZCGeUhGd/edit)

---

## 🆘 Support

### Documentation rapide
- **Action immédiate :** [ACTION_IMMEDIATE.md](ACTION_IMMEDIATE.md)
- **Résumé complet :** [MISSION_ACCOMPLIE_FINALE.md](MISSION_ACCOMPLIE_FINALE.md)
- **Index :** [INDEX_DOCUMENTATION.md](INDEX_DOCUMENTATION.md)

### Problèmes courants
- **HTTP 500 :** [CORRECTION_MODULE_IMAGES.md](CORRECTION_MODULE_IMAGES.md)
- **Photos manquantes :** [NOTE_PHOTO_ELEVE.md](NOTE_PHOTO_ELEVE.md)
- **Config Vercel :** [GUIDE_CONFIG_VERCEL.md](GUIDE_CONFIG_VERCEL.md)
- **Modèle DP :** [MODELE_DP1_DP2.md](MODELE_DP1_DP2.md)

---

## 📝 Licence

Ce projet est développé pour un usage interne de l'établissement scolaire.

---

## 🎉 Changelog

### Version 3.0 (2026-01-08)
- ✅ Correction erreur HTTP 500 (module images)
- ✅ Ajout support DP1/DP2 (modèle séparé)
- ✅ Activation photos élèves (150x150)
- ✅ Mise à jour noms complets (20 élèves)
- ✅ Documentation complète (15 fichiers)

### Version 2.0 (2026-01-07)
- ✅ Migration vers Vercel
- ✅ Configuration MongoDB Atlas
- ✅ Système de fallback URLs
- ✅ Logs améliorés

### Version 1.0 (2025-12-XX)
- ✅ Version initiale
- ✅ Support PEI1-4
- ✅ Interface web basique

---

## 👨‍💻 Contributeurs

- **Développement :** medch24
- **AI Assistant :** Claude (Anthropic)

---

**Dernière mise à jour :** 2026-01-08  
**Version :** 3.0  
**Statut :** ✅ Production Ready
