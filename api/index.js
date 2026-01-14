// --- Dépendances ---
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');
const PizZip = require("pizzip");
const DocxTemplater = require("docxtemplater");
const ImageModule = require('docxtemplater-image-module-free');
const fetch = require('node-fetch');
const archiver = require('archiver');
const Jimp = require('jimp');

// Configuration dotenv
try {
    require('dotenv').config({ path: ['.env.local', '.env.production', '.env'] });
} catch (err) {
    console.log('ℹ️ No dotenv file found');
}

const TRANSPARENT_PIXEL = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');

// ⚠️ CONFIGURATION CRITIQUE: TEMPLATE WORD ⚠️
// URL GOOGLE DOCS FORCÉE - Les variables d'environnement Vercel sont IGNORÉES
const GOOGLE_DOCS_TEMPLATE_URL = 'https://docs.google.com/document/d/18eo_E2ex8K5xu5ce6BQhN8MWi5mL_Nga/export?format=docx';
console.log('\n🔧 ===== CONFIGURATION TEMPLATE WORD =====');
console.log('✅ Source: GOOGLE DOCS (URL fixe)');
console.log(`📄 URL: ${GOOGLE_DOCS_TEMPLATE_URL}`);
console.log('⚠️  IMPORTANT: Variables TEMPLATE_URL et TEMPLATE_URL_DP sont IGNORÉES');
console.log('⚠️  Le code utilise TOUJOURS Google Docs, peu importe les variables Vercel');
console.log('=========================================\n');

// Définition des critères par matière (pour mapping des noms de critères)
const criteriaBySubject = {
    // Matières PEI
    "Acquisition de langues (Anglais)": {A:"Listening",B:"Reading",C:"Speaking",D:"Writing"},
    "Acquisition de langue (اللغة العربية)": {A:"أ الاستماع",B:"ب القراءة",C:"ج التحدث",D:"د الكتابة"},
    "Langue et littérature (Français)": {A:"Analyse",B:"Organisation",C:"Production de texte",D:"Utilisation de la langue"},
    "Individus et sociétés": {A:"Connaissances et compréhension",B:"Recherche",C:"Communication",D:"Pensée critique"},
    "Sciences": {A:"Connaissances et compréhension",B:"Recherche et élaboration",C:"Traitement et évaluation",D:"Réflexion sur les répercussions"},
    "Mathématiques": {A:"Connaissances et compréhension",B:"Recherche de modèles",C:"Communication",D:"Application des mathématiques"},
    "Arts": {A:"Connaissances et compréhension",B:"Développement des compétences",C:"Pensée créative",D:"Réaction"},
    "Éducation physique et à la santé": {A:"Connaissances et compréhension",B:"Planification",C:"Application et exécution",D:"Réflexion et amélioration"},
    "Design": {A:"Recherche et analyse",B:"Développement des idées",C:"Création de la solution",D:"Évaluation"},
    // Matières DP
    "Langue et Littérature (Français NM)": {AO1:"Connaissances et compréhension",AO2:"Application des compétences",AO3:"Communication",AO4:"Maîtrise de la langue"},
    "Langue Anglaise (NM)": {AO1:"Communication",AO2:"Compréhension",AO3:"Maîtrise de la langue",AO4:"Sensibilité interculturelle"},
    "Géographie (NM)": {AO1:"Connaissances",AO2:"Application et analyse",AO3:"Synthèse et évaluation",AO4:"Présentation"},
    "Mathématiques AA (NS)": {AO1:"Connaissances",AO2:"Modélisation",AO3:"Communication",AO4:"Utilisation technologie"},
    "Biologie (NS)": {AO1:"Connaissances",AO2:"Application",AO3:"Formulation et évaluation",AO4:"Techniques expérimentales"},
    "Physique (NS)": {AO1:"Connaissances",AO2:"Application",AO3:"Formulation et évaluation",AO4:"Techniques expérimentales"},
    "Théorie de la Connaissance (TdC)": {AO1:"Réflexion",AO2:"Exploration",AO3:"Lien situations réelles"},
    "Mémoire (EE)": {AO1:"Question de Recherche",AO2:"Recherche indépendante",AO3:"Argumentation",AO4:"Réflexion"},
    "CAS": {AO1:"7 Résultats d'Apprentissage",AO2:"Réflexion",AO3:"Projet CAS"}
};

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../public')));
app.disable('x-powered-by');

const MONGODB_URI = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'teacherContributionsDB';

let client;
let db;
let studentsCollection;
let contributionsCollection;
let isDbConnected = false;

async function connectToMongo() {
    if (isDbConnected) return;
    try {
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        db = client.db(dbName);
        studentsCollection = db.collection('students');
        contributionsCollection = db.collection('contributions');
        isDbConnected = true;
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
    }
}

async function fetchImage(url) {
    if (!url) {
        console.log(`⚠️ Pas d'URL fournie, retour image transparente`);
        return TRANSPARENT_PIXEL;
    }
    
    try {
        console.log(`🖼️ Tentative de chargement de l'image: ${url}`);
        
        // 1. Essayer dans le dossier public/photos
        const localPathPhotos = path.join(__dirname, '../public/photos', url);
        if (fs.existsSync(localPathPhotos)) {
            console.log(`✅ Image trouvée dans public/photos: ${localPathPhotos}`);
            const buffer = fs.readFileSync(localPathPhotos);
            const image = await Jimp.read(buffer);
            image.scaleToFit(180, 180);
            const result = await image.getBufferAsync(Jimp.MIME_PNG);
            console.log(`✅ Image traitée: ${result.length} bytes`);
            return result;
        }

        // 2. Essayer à la racine du projet
        const rootPath = path.join(__dirname, '..', url);
        if (fs.existsSync(rootPath)) {
            console.log(`✅ Image trouvée à la racine: ${rootPath}`);
            const buffer = fs.readFileSync(rootPath);
            const image = await Jimp.read(buffer);
            image.scaleToFit(180, 180);
            const result = await image.getBufferAsync(Jimp.MIME_PNG);
            console.log(`✅ Image traitée: ${result.length} bytes`);
            return result;
        }

        // 3. Si c'est une URL distante (Google Drive)
        if (url.startsWith('http')) {
            console.log(`🌐 Téléchargement de l'image depuis: ${url}`);
            let finalUrl = url;
            if (url.includes('drive.google.com') || url.includes('googleusercontent.com')) {
                const match = url.match(/[-\w]{25,}/);
                if (match && match[0]) {
                    finalUrl = `https://drive.google.com/uc?export=download&id=${match[0]}&confirm=t`;
                    console.log(`🔄 URL Google Drive convertie: ${finalUrl}`);
                }
            }

            const response = await fetch(finalUrl, { 
                timeout: 8000,
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            
            if (response.ok) {
                const buffer = await response.buffer();
                console.log(`📥 Image téléchargée: ${buffer.length} bytes`);
                const image = await Jimp.read(buffer);
                image.scaleToFit(180, 180);
                const result = await image.getBufferAsync(Jimp.MIME_PNG);
                console.log(`✅ Image traitée: ${result.length} bytes`);
                return result;
            } else {
                console.warn(`⚠️ Échec téléchargement: ${response.status}`);
            }
        }
        
        console.warn(`⚠️ Image non trouvée: ${url}, utilisation d'un pixel transparent`);
        return TRANSPARENT_PIXEL;
    } catch (error) {
        console.error(`❌ Erreur lors du chargement de l'image ${url}:`, error.message);
        console.error('Stack:', error.stack);
        return TRANSPARENT_PIXEL;
    }
}

// Route de diagnostic pour vérifier les élèves
app.get('/api/checkStudents', async (req, res) => {
    try {
        await connectToMongo();
        const students = await studentsCollection.find({}).toArray();
        
        const report = students.map(s => ({
            fullName: s.fullName,
            birthDate: s.birthDate,
            hasPhotoUrl: !!s.studentPhotoUrl,
            photoUrl: s.studentPhotoUrl ? s.studentPhotoUrl.substring(0, 50) + '...' : null
        }));
        
        res.json({
            total: students.length,
            withPhotos: report.filter(r => r.hasPhotoUrl).length,
            withoutPhotos: report.filter(r => !r.hasPhotoUrl).length,
            students: report
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route pour récupérer les informations d'un élève
app.post('/api/fetchStudentInfo', async (req, res) => {
    try {
        await connectToMongo();
        const { studentSelected } = req.body;
        
        if (!studentSelected) {
            return res.status(400).json({ error: 'studentSelected requis' });
        }
        
        const student = await studentsCollection.findOne({ fullName: studentSelected });
        
        if (!student) {
            // Retourner un objet vide au lieu d'une erreur
            return res.json({ fullName: studentSelected, birthDate: null, studentPhotoUrl: null });
        }
        
        res.json(student);
    } catch (error) {
        console.error('❌ Erreur fetchStudentInfo:', error);
        res.status(500).json({ error: error.message });
    }
});

// Route pour récupérer les contributions d'un élève
app.post('/api/fetchStudentContributions', async (req, res) => {
    try {
        await connectToMongo();
        const { student, classSelected, sectionSelected } = req.body;
        
        const studentName = student || req.body.studentSelected;
        
        console.log('📚 Récupération contributions:', {
            student: studentName,
            class: classSelected,
            section: sectionSelected
        });
        
        if (!studentName) {
            console.warn('⚠️ Pas de nom d\'élève fourni');
            return res.status(400).json({ error: 'student requis' });
        }
        
        const query = { studentSelected: studentName };
        if (classSelected) query.classSelected = classSelected;
        if (sectionSelected) query.sectionSelected = sectionSelected;
        
        console.log('🔍 Query MongoDB:', query);
        const contributions = await contributionsCollection.find(query).toArray();
        console.log(`✅ ${contributions.length} contributions trouvées`);
        
        res.json(contributions);
    } catch (error) {
        console.error('❌ Erreur fetchStudentContributions:', error);
        res.status(500).json({ error: error.message, stack: error.stack });
    }
});

// Route pour récupérer les données (élèves par classe)
app.post('/api/fetchData', async (req, res) => {
    try {
        await connectToMongo();
        const { classSelected, sectionSelected } = req.body;
        
        const query = {};
        if (classSelected) query.classSelected = classSelected;
        if (sectionSelected) query.sectionSelected = sectionSelected;
        
        const studentNames = await contributionsCollection.distinct('studentSelected', query);
        
        res.json({ students: studentNames });
    } catch (error) {
        console.error('❌ Erreur fetchData:', error);
        res.status(500).json({ error: error.message });
    }
});

// Route pour sauvegarder une contribution
app.post('/api/saveContribution', async (req, res) => {
    try {
        await connectToMongo();
        const contribution = req.body;
        
        console.log('📝 Sauvegarde contribution:', {
            hasId: !!(contribution._id || contribution.contributionId),
            studentSelected: contribution.studentSelected,
            subjectName: contribution.subjectName
        });
        
        if (contribution._id || contribution.contributionId) {
            // Mise à jour
            const id = contribution._id || contribution.contributionId;
            delete contribution._id;
            delete contribution.contributionId;
            
            // Convertir l'ID en ObjectId si c'est une chaîne
            let objectId;
            try {
                objectId = typeof id === 'string' ? new ObjectId(id) : id;
            } catch (err) {
                console.error('❌ ID invalide:', id, err);
                return res.status(400).json({ error: 'ID invalide' });
            }
            
            const result = await contributionsCollection.updateOne(
                { _id: objectId },
                { $set: contribution }
            );
            
            console.log('✅ Contribution mise à jour:', result.modifiedCount);
            res.json({ success: true, contributionId: id });
        } else {
            // Création
            const result = await contributionsCollection.insertOne(contribution);
            console.log('✅ Contribution créée:', result.insertedId);
            res.json({ success: true, contributionId: result.insertedId });
        }
    } catch (error) {
        console.error('❌ Erreur saveContribution:', error);
        res.status(500).json({ error: error.message, stack: error.stack });
    }
});

// Route pour récupérer une contribution spécifique
app.post('/api/fetchContribution', async (req, res) => {
    try {
        await connectToMongo();
        const { contributionId } = req.body;
        
        if (!contributionId) {
            return res.status(400).json({ error: 'contributionId requis' });
        }
        
        const contribution = await contributionsCollection.findOne({ 
            _id: new ObjectId(contributionId) 
        });
        
        if (!contribution) {
            return res.status(404).json({ error: 'Contribution non trouvée' });
        }
        
        res.json(contribution);
    } catch (error) {
        console.error('❌ Erreur fetchContribution:', error);
        res.status(500).json({ error: error.message });
    }
});

// Route pour supprimer une contribution
app.post('/api/deleteContribution', async (req, res) => {
    try {
        await connectToMongo();
        const { contributionId } = req.body;
        
        if (!contributionId) {
            return res.status(400).json({ error: 'contributionId requis' });
        }
        
        await contributionsCollection.deleteOne({ 
            _id: new ObjectId(contributionId) 
        });
        
        res.json({ success: true });
    } catch (error) {
        console.error('❌ Erreur deleteContribution:', error);
        res.status(500).json({ error: error.message });
    }
});

// NOUVEAU: Endpoint pour obtenir la liste des élèves d'une classe
app.post('/api/getStudentsList', async (req, res) => {
    try {
        const { classSelected, sectionSelected } = req.body;
        
        console.log(`📋 Récupération liste élèves - Classe: ${classSelected}, Section: ${sectionSelected}`);
        
        if (!classSelected || !sectionSelected) {
            return res.status(400).json({ 
                error: 'Paramètres manquants',
                details: 'classSelected et sectionSelected requis'
            });
        }
        
        await connectToMongo();
        
        // Récupérer la liste des élèves qui ont des contributions
        const studentNames = await contributionsCollection.distinct('studentSelected', {
            classSelected,
            sectionSelected
        });
        
        console.log(`✅ ${studentNames.length} élèves trouvés:`, studentNames);
        
        res.json({
            success: true,
            students: studentNames,
            count: studentNames.length,
            classSelected,
            sectionSelected
        });
        
    } catch (error) {
        console.error('❌ Erreur getStudentsList:', error);
        res.status(500).json({ error: error.message });
    }
});

// Route principale de génération (OBSOLÈTE - garder pour compatibilité)
app.post('/api/generateClassZip', async (req, res) => {
    const { classSelected, sectionSelected } = req.body;
    console.log(`\n⚠️ OBSOLÈTE: generateClassZip appelé - utilisez getStudentsList + generateSingleWord`);
    console.log(`Classe: ${classSelected}, Section: ${sectionSelected}`);
    
    try {
        await connectToMongo();
        
        const studentNames = await contributionsCollection.distinct('studentSelected', {
            classSelected,
            sectionSelected
        });

        console.log(`📋 ${studentNames.length} élèves trouvés:`, studentNames);

        if (!studentNames || studentNames.length === 0) {
            return res.status(404).json({ error: 'Aucun élève trouvé' });
        }

        // Renvoyer la liste au lieu de générer un ZIP
        res.json({
            success: true,
            message: 'Utilisez /api/getStudentsList et téléchargez individuellement',
            students: studentNames,
            count: studentNames.length
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ error: error.message });
    }
});
// ENDPOINT MANQUANT: Génération d'un seul livret Word pour un élève
app.post('/api/generateSingleWord', async (req, res) => {
    try {
        const { studentSelected, classSelected, sectionSelected } = req.body;
        
        console.log(`\n📝 GÉNÉRATION LIVRET INDIVIDUEL`);
        console.log(`   Élève: ${studentSelected}`);
        console.log(`   Classe: ${classSelected}`);
        console.log(`   Section: ${sectionSelected}`);
        
        if (!studentSelected || !classSelected || !sectionSelected) {
            return res.status(400).json({ 
                error: 'Paramètres manquants',
                details: 'studentSelected, classSelected et sectionSelected sont requis'
            });
        }
        
        // FORCER L'UTILISATION DE GOOGLE DOCS (ignorer variables d'environnement)
        const GOOGLE_DOCS_TEMPLATE = 'https://docs.google.com/document/d/18eo_E2ex8K5xu5ce6BQhN8MWi5mL_Nga/export?format=docx';
        const templateUrl = GOOGLE_DOCS_TEMPLATE;
        
        console.log(`📄 TEMPLATE FORCÉ: Google Docs`);
        console.log(`   URL: ${templateUrl}`);
        console.log(`   Variables env ignorées (TEMPLATE_URL: ${process.env.TEMPLATE_URL ? 'existe mais ignorée' : 'non définie'})`);
        console.log(`   Variables env ignorées (TEMPLATE_URL_DP: ${process.env.TEMPLATE_URL_DP ? 'existe mais ignorée' : 'non définie'})`);
        
        console.log(`📄 Téléchargement template: ${templateUrl}`);
        const templateResponse = await fetch(templateUrl);
        
        if (!templateResponse.ok) {
            throw new Error(`Erreur téléchargement template Google Docs: ${templateResponse.status}`);
        }
        
        const templateBuffer = await templateResponse.buffer();
        console.log(`✅ Template téléchargé: ${templateBuffer.length} bytes`);
        
        // 2. Récupérer les contributions de l'élève
        const contributions = await contributionsCollection.find({
            studentSelected,
            classSelected,
            sectionSelected
        }).toArray();
        
        console.log(`📚 ${contributions.length} contributions trouvées`);
        
        if (!contributions || contributions.length === 0) {
            return res.status(404).json({
                error: 'Aucune contribution trouvée',
                details: `Aucune contribution pour ${studentSelected} en ${classSelected} ${sectionSelected}`
            });
        }
        
        // 3. Récupérer les infos de l'élève
        const studentInfo = await studentsCollection.findOne({ fullName: studentSelected });
        
        // 4. Formater les contributions pour correspondre EXACTEMENT aux balises du template
        const formattedContributions = contributions.map(c => {
            const criteriaData = c.criteriaValues || {};
            
            const formatCriteria = (criterion) => {
                const data = criteriaData[criterion] || {};
                return {
                    sem1: data.sem1 || '',
                    sem2: data.sem2 || '',
                    finalLevel: data.finalLevel || ''
                };
            };
            
            // Récupérer les noms des critères depuis la matière
            const subjectCriteria = criteriaBySubject[c.subjectSelected] || {};
            
            return {
                // Balises principales
                teacherName: c.teacherName || '',
                subjectSelected: c.subjectSelected || '',
                subject: c.subjectSelected || '',
                teacherComment: c.teacherComment || c.comments || '',
                
                // Critères A, B, C, D avec leurs valeurs
                'criteriaName A': subjectCriteria.A || 'Critère A',
                'criteriaName B': subjectCriteria.B || 'Critère B',
                'criteriaName C': subjectCriteria.C || 'Critère C',
                'criteriaName D': subjectCriteria.D || 'Critère D',
                
                criteriaA: formatCriteria('A'),
                criteriaB: formatCriteria('B'),
                criteriaC: formatCriteria('C'),
                criteriaD: formatCriteria('D'),
                
                // Clés des critères (A, B, C, D)
                criteriaKey: {
                    A: 'A',
                    B: 'B',
                    C: 'C',
                    D: 'D'
                },
                
                // Niveaux finaux
                finalLevel: {
                    A: formatCriteria('A').finalLevel,
                    B: formatCriteria('B').finalLevel,
                    C: formatCriteria('C').finalLevel,
                    D: formatCriteria('D').finalLevel
                },
                
                // ATL (Approches de l'apprentissage)
                communication: c.atlScores?.communication || '',
                collaboration: c.atlScores?.collaboration || '',
                autogestion: c.atlScores?.autogestion || '',
                recherche: c.atlScores?.recherche || '',
                reflexion: c.atlScores?.reflexion || '',
                
                // Note et seuil
                note: c.finalGrade || '',
                seuil: c.threshold || ''
            };
        });
        
        // 5. Générer le document Word
        const zip = new PizZip(templateBuffer);
        const doc = new DocxTemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
            nullGetter: () => ''
        });
        
        const renderData = {
            // Données élève
            studentSelected: studentSelected || '',
            studentBirthdate: studentInfo?.birthDate || studentInfo?.studentBirthdate || '',
            className: classSelected || '',
            
            // Image (vide car désactivée)
            image: '',
            
            // Liste des contributions (pour la boucle #contributionsBySubject)
            contributionsBySubject: formattedContributions,
            
            // Tableau ATL summary (si nécessaire)
            atlSummaryTable: formattedContributions.map(c => ({
                subject: c.subjectSelected,
                communication: c.communication,
                collaboration: c.collaboration,
                autogestion: c.autogestion,
                recherche: c.recherche,
                reflexion: c.reflexion
            }))
        };
        
        console.log(`📝 Rendu avec ${formattedContributions.length} contributions`);
        console.log(`📊 Données envoyées:`, {
            studentSelected: renderData.studentSelected,
            studentBirthdate: renderData.studentBirthdate,
            className: renderData.className,
            contributionsCount: renderData.contributionsBySubject.length
        });
        
        doc.render(renderData);
        
        // 6. Générer le buffer final avec compression STORE
        const buffer = doc.getZip().generate({
            type: 'nodebuffer',
            compression: 'STORE',
            compressionOptions: { level: 0 }
        });
        
        console.log(`✅ Document généré: ${buffer.length} bytes`);
        
        // 7. Envoyer le fichier
        const filename = `Livret-${studentSelected.replace(/\s+/g, '_')}-${classSelected}.docx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(buffer);
        
        console.log(`🎉 Livret envoyé: ${filename}`);
        
    } catch (error) {
        console.error('❌ ERREUR generateSingleWord:', error.message);
        console.error('Stack:', error.stack);
        res.status(500).json({ 
            error: 'Erreur génération livret',
            details: error.message 
        });
    }
});

app.listen(3000, () => console.log('🚀 Server ready'));
module.exports = app;
