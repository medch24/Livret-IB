// --- Dépendances ---
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
// Configuration dotenv uniquement en développement local
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const fs = require('fs');
const path = require('path');
const PizZip = require("pizzip");
const DocxTemplater = require("docxtemplater");
// const ImageModule = require('docxtemplater-image-module-free'); // Temporairement désactivé pour éviter les vulnérabilités
const fetch = require('node-fetch');
// const XLSX = require('xlsx'); // Temporairement désactivé pour éviter les vulnérabilités

// --- Configuration ---
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware pour débugger
app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
});

// Servir les fichiers statiques AVANT les routes API
app.use(express.static(path.join(__dirname, '../public')));

// Vérification et configuration des variables d'environnement
console.log('🔧 Environment check:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('VERCEL:', process.env.VERCEL ? 'true' : 'false');
console.log('MONGODB_URI defined:', !!process.env.MONGODB_URI);

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'teacherContributionsDB';

// Validation critique des variables d'environnement
if (!MONGODB_URI) {
    console.error('❌ CRITICAL: MONGODB_URI environment variable is missing!');
    console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('MONGO') || k.includes('DB')));
}
const contributionsCollectionName = 'contributions';
const studentsCollectionName = 'students';
const PUBLIC_DIR = path.join(__dirname, '../public');

let contributionsCollection;
let studentsCollection;
let isDbConnected = false;

// --- Structure Données (Référence pour les critères) ---
const criteriaBySubject = {
    // Matières PEI
    "Acquisition de langues (Anglais)":{A:"Listening",B:"Reading",C:"Speaking",D:"Writing"},
    "Langue et littérature (Français)":{A:"Analyse",B:"Organisation",C:"Production de texte",D:"Utilisation de la langue"},
    "Individus et sociétés":{A:"Connaissances et compréhension",B:"Recherche",C:"Communication",D:"Pensée critique"},
    "Sciences":{A:"Connaissances et compréhension",B:"Recherche et élaboration",C:"Traitement et évaluation",D:"Réflexion sur les répercussions"},
    "Mathématiques":{A:"Connaissances et compréhension",B:"Recherche de modèles",C:"Communication",D:"Application des mathématiques"},
    "Arts":{A:"Connaissances et compréhension",B:"Développement des compétences",C:"Pensée créative",D:"Réaction"},
    "Éducation physique et à la santé":{A:"Connaissances et compréhension",B:"Planification",C:"Application et exécution",D:"Réflexion et amélioration"},
    "Design":{A:"Recherche et analyse",B:"Développement des idées",C:"Création de la solution",D:"Évaluation"},
    // Matières DP
    "Langue et Littérature (Français NM)":{AO1:"Connaissances et compréhension des œuvres littéraires et des textes non-littéraires",AO2:"Application des compétences d'analyse et d'interprétation",AO3:"Communication claire, précise et efficace",AO4:"Maîtrise de l'usage de la langue"},
    "Langue Anglaise (NM)":{AO1:"Communication d'idées (interaction orale et écrite)",AO2:"Compréhension des messages (lecture, écoute)",AO3:"Maîtrise de la langue (précision, vocabulaire, prononciation/orthographe)",AO4:"Développement de la sensibilité interculturelle"},
    "Géographie (NM)":{AO1:"Connaissances des concepts, des théories et des processus géographiques",AO2:"Application et analyse des données et des techniques géographiques",AO3:"Synthèse, évaluation et argumentation",AO4:"Sélection, organisation et présentation de l'information"},
    "Mathématiques AA (NS)":{AO1:"Connaissances et compréhension des concepts, principes et méthodes mathématiques",AO2:"Modélisation et résolution de problèmes dans des contextes variés",AO3:"Communication des raisonnements mathématiques",AO4:"Utilisation efficace de la technologie"},
    "Biologie (NS)":{AO1:"Connaissances et compréhension des faits, concepts et méthodologies",AO2:"Application des connaissances et des techniques scientifiques",AO3:"Formulation, analyse et évaluation des hypothèses, méthodes et conclusions",AO4:"Maîtrise des techniques expérimentales"},
    "Physique (NS)":{AO1:"Connaissances et compréhension des faits, concepts et méthodologies",AO2:"Application des connaissances et des techniques scientifiques",AO3:"Formulation, analyse et évaluation des hypothèses, méthodes et conclusions",AO4:"Maîtrise des techniques expérimentales"},
    "Théorie de la Connaissance (TdC)":{AO1:"Réflexion sur les Questions de Connaissance",AO2:"Exploration des Cadres de Connaissance",AO3:"Lien entre les concepts de TdC et des situations réelles"},
    "Mémoire (EE)":{AO1:"Développement d'une Question de Recherche",AO2:"Capacité à mener une recherche indépendante et pertinente",AO3:"Développement d'une argumentation structurée et critique",AO4:"Réflexion sur le processus d'apprentissage"},
    "CAS":{AO1:"Atteinte des 7 Résultats d'Apprentissage du CAS",AO2:"Réflexion régulière, honnête et approfondie sur les activités",AO3:"Planification et mise en œuvre du Projet CAS"},
    // Anciennes matières pour rétrocompatibilité
    "Langues et littérature":{A:"Analyse",B:"Organisation",C:"Production de texte",D:"Utilisation de la langue"},
    "Biologie":{A:"Connaissances et compréhension",B:"Recherche et élaboration",C:"Traitement et évaluation",D:"Réflexion sur les répercussions"},
    "Physique-Chimie":{A:"Connaissances et compréhension",B:"Recherche et élaboration",C:"Traitement et évaluation",D:"Réflexion sur les répercussions"},
    "Langue Anglaise":{A:"Listening",B:"Reading",C:"Speaking",D:"Writing"},
    "Musique":{A:"Connaissances et comprehensions",B:"Développement des competences",C:"Pensée créative",D:"Réaction"},
    "ART":{A:"Connaissances et comprehensions",B:"Développement des competences",C:"Pensée créative",D:"Réaction"},
    "Éducation Physique":{A:"Connaissances et compréhension",B:"Planification",C:"Application et exécution",D:"Réflexion et amélioration"},
    "L.L":{A:"Analyse",B:"Organisation",C:"Production de texte",D:"Utilisation de la langue"},
    "I.S":{A:"Connaissances et compréhension",B:"Recherche",C:"Communication",D:"Pensée critique"},
    "E.S":{A:"Connaissances et compréhension",B:"Recherche et élaboration",C:"Traitement et évaluation",D:"Réflexion sur les répercussions"}
};

// --- Connexion Base de Données ---
async function connectToMongo() {
    if (!MONGODB_URI) {
        console.error("FATAL ERROR: MONGODB_URI is not defined.");
        return false;
    }
    
    try {
        const client = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        console.log('✅ Successfully connected to MongoDB.');
        
        const db = client.db(dbName);
        contributionsCollection = db.collection(contributionsCollectionName);
        studentsCollection = db.collection(studentsCollectionName);
        isDbConnected = true;
        
        // Créer les index
        try {
            await contributionsCollection.createIndex({ studentSelected: 1, subjectSelected: 1 }, { unique: true });
            await studentsCollection.createIndex({ studentSelected: 1 }, { unique: true });
        } catch (indexError) {
            console.log('Indexes already exist or conflict (OK)');
        }
        
        return true;
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        isDbConnected = false;
        return false;
    }
}

// --- Helper Functions ---
function calculateFinalNote(totalLevel, maxNote = 8) {
    if (totalLevel <= 0 || isNaN(totalLevel)) return "1";
    let note = Math.round(totalLevel / 4);
    if (note < 1) note = 1;
    if (note > maxNote) note = maxNote;
    return note.toString();
}

async function fetchImage(url) {
    try {
        console.log(`Fetching image: ${url}`);
        const response = await fetch(url);
        if (!response.ok) return null;
        const buffer = Buffer.from(await response.arrayBuffer());
        console.log(`Image fetched, size: ${buffer.length} bytes`);
        return buffer;
    } catch (error) {
        console.error(`Error fetching image:`, error.message);
        return null;
    }
}

function createCriteriaDataForTemplate(criteriaValues, originalSubjectName) {
    const criteriaNames = criteriaBySubject[originalSubjectName] || {};
    const templateData = {};
    let totalLevel = 0;
    
    // Déterminer si c'est une matière DP (qui utilise AO1-AO4)
    const isDPSubject = Object.keys(criteriaNames).some(key => key.startsWith('AO'));
    const criteriaKeys = isDPSubject ? ['AO1', 'AO2', 'AO3', 'AO4'] : ['A', 'B', 'C', 'D'];
    const maxNote = isDPSubject ? 7 : 8;
    
    criteriaKeys.forEach(key => {
        const critData = criteriaValues?.[key] || {};
        const finalLevelValue = critData.finalLevel ?? "-";
        templateData[`criteriaKey.${key}`] = key;
        templateData[`criteriaName ${key}`] = criteriaNames[key] || `Critère ${key}`;
        templateData[`criteria${key}.sem1`] = critData.sem1 ?? "-";
        templateData[`criteria${key}.sem2`] = critData.sem2 ?? "-";
        templateData[`finalLevel.${key}`] = finalLevelValue;
        
        if (finalLevelValue !== "-" && !isNaN(finalLevelValue)) {
            totalLevel += parseFloat(finalLevelValue);
        }
    });
    
    const finalNote = calculateFinalNote(totalLevel, maxNote);
    templateData['seuil'] = totalLevel.toString();
    templateData['note'] = finalNote;
    return templateData;
}

function prepareWordData(studentName, className, studentBirthdate, originalContributions) {
    if (!originalContributions || originalContributions.length === 0) {
        return {
            studentSelected: studentName,
            className: className || "",
            studentBirthdate: studentBirthdate ? new Date(studentBirthdate).toLocaleDateString('fr-FR') : "",
            atlSummaryTable: [],
            contributionsBySubject: []
        };
    }
    
    const documentData = {
        studentSelected: studentName,
        className: className || "",
        studentBirthdate: studentBirthdate ? new Date(studentBirthdate).toLocaleDateString('fr-FR') : "",
        atlSummaryTable: [],
        contributionsBySubject: []
    };
    
    for (const c of originalContributions) {
        const comm = c.communicationEvaluation || [];
        documentData.atlSummaryTable.push({
            subject: c.subjectSelected,
            communication: comm[0] || "-",
            collaboration: comm[1] || "-",
            autogestion: comm[2] || "-",
            recherche: comm[3] || "-",
            reflexion: comm[4] || "-"
        });
        
        const criteriaTemplateData = createCriteriaDataForTemplate(c.criteriaValues, c.subjectSelected);
        const subjectContributionData = {
            subjectSelected: c.subjectSelected,
            teacherName: c.teacherName || "N/A",
            teacherComment: c.teacherComment || "-",
            ...criteriaTemplateData
        };
        documentData.contributionsBySubject.push(subjectContributionData);
    }
    
    return documentData;
}

async function createWordDocumentBuffer(studentName, className, studentBirthdate, imageBuffer, originalContributions) {
    const templateURL = 'https://cdn.glitch.global/afba7f9d-6291-40ea-92bb-fe72daac96fd/Livret%20scolaire%20%20Modele%20400.docx?v=1743890021973';
    
    try {
        console.log(`🔄 Fetching Word template from: ${templateURL}`);
        const response = await fetch(templateURL);
        
        if (!response.ok) {
            console.error(`❌ Template fetch failed: ${response.status} ${response.statusText}`);
            throw new Error(`Template fetch failed: ${response.status} ${response.statusText}`);
        }
        
        console.log(`✅ Template fetched successfully, size: ${response.headers.get('content-length') || 'unknown'} bytes`);
        const templateContent = await response.arrayBuffer();
        console.log(`✅ Template content loaded: ${templateContent.byteLength} bytes`);
        
        const zip = new PizZip(templateContent);
        console.log(`✅ PizZip created successfully`);
        
        // Module d'image temporairement désactivé pour éviter les vulnérabilités critiques
        const doc = new DocxTemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
            nullGetter: () => ""
        });
        
        console.log(`🔄 Preparing Word data for ${studentName}...`);
        const documentData = prepareWordData(studentName, className, studentBirthdate, originalContributions);
        const dataToRender = {
            ...documentData,
            image: "" // Pas d'image pour éviter les vulnérabilités
        };
        
        console.log(`🔄 Rendering Word document for ${studentName}... Data keys: ${Object.keys(dataToRender).length}`);
        doc.render(dataToRender);
        console.log(`✅ Document rendered successfully`);
        
        console.log(`🔄 Generating final buffer for ${studentName}...`);
        const buffer = doc.getZip().generate({
            type: "nodebuffer",
            compression: "DEFLATE"
        });
        console.log(`✅ Buffer generated: ${buffer.length} bytes`);
        
        return buffer;
    } catch (error) {
        console.error(`Error creating Word buffer for ${studentName}:`, error.message);
        throw error;
    }
}

// --- API Routes ---

// Servir les fichiers statiques
app.use(express.static(PUBLIC_DIR));

app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, '../public/index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send("Fichier principal introuvable.");
    }
});

// Test de l'API
app.get('/api/test', (req, res) => {
    res.json({
        status: 'OK',
        message: 'API is working',
        dbConnected: isDbConnected,
        timestamp: new Date().toISOString()
    });
});

// Récupérer les données d'un élève/matière
app.post('/api/fetchData', async (req, res) => {
    if (!isDbConnected) {
        console.log('⚠️ DB not connected, returning noDataForSubject for fetchData');
        const { studentSelected } = req.body;
        return res.json({ noDataForSubject: true, studentSelected });
    }
    
    try {
        const { studentSelected, subjectSelected } = req.body;
        if (!studentSelected || !subjectSelected) {
            return res.json({ noDataForSubject: true, studentSelected });
        }
        const contribution = await contributionsCollection.findOne({ studentSelected, subjectSelected });
        const studentInfo = await studentsCollection.findOne({ studentSelected }, { projection: { studentBirthdate: 1 } });
        
        if (contribution) {
            res.json({ ...contribution, studentBirthdate: studentInfo?.studentBirthdate });
        } else {
            res.json({ noDataForSubject: true, studentSelected, studentBirthdate: studentInfo?.studentBirthdate });
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        // Retourner un objet valide au lieu d'erreur 500
        const { studentSelected } = req.body;
        res.json({ noDataForSubject: true, studentSelected });
    }
});

// Récupérer les infos d'un élève
app.post('/api/fetchStudentInfo', async (req, res) => {
    if (!isDbConnected) {
        console.log('⚠️ DB not connected, returning null for fetchStudentInfo');
        return res.json(null); // Retourner null au lieu d'une erreur 500
    }
    
    try {
        const { studentSelected } = req.body;
        if (!studentSelected) {
            return res.json(null);
        }
        const studentInfo = await studentsCollection.findOne(
            { studentSelected }, 
            { projection: { studentBirthdate: 1 } }
        );
        res.json(studentInfo || null);
    } catch (error) {
        console.error('Error fetching student info:', error);
        // Retourner null au lieu d'erreur 500 pour permettre à l'app de continuer
        res.json(null);
    }
});

// Enregistrer/Mettre à jour une contribution
app.post('/api/saveContribution', async (req, res) => {
    // Mode démo : si DB non connectée, simuler un enregistrement réussi
    if (!isDbConnected) {
        console.log('⚠️ DB not connected, simulating successful save (demo mode)');
        const { contributionId, studentBirthdate, studentPhoto, ...contribData } = req.body;
        const simulatedId = contributionId || `demo-${Date.now()}`;
        
        // Retourner un succès simulé pour permettre à l'utilisateur de continuer
        return res.json({ 
            success: true, 
            message: 'Contribution enregistrée localement (mode démo - base de données non connectée)', 
            data: simulatedId,
            demoMode: true
        });
    }
    
    try {
        const { contributionId, studentBirthdate, studentPhoto, ...contribData } = req.body;
        contribData.timestamp = new Date();
        
        console.log(`Saving contribution for ${contribData.studentSelected} - ${contribData.subjectSelected}`);
        
        // Mettre à jour la date de naissance
        if (studentBirthdate) {
            await studentsCollection.updateOne(
                { studentSelected: contribData.studentSelected },
                { $set: { studentBirthdate } },
                { upsert: true }
            );
        }
        
        let result;
        if (contributionId) {
            // Mise à jour
            result = await contributionsCollection.findOneAndUpdate(
                { _id: new ObjectId(contributionId) },
                { $set: contribData },
                { returnDocument: 'after' }
            );
        } else {
            // Création ou upsert
            result = await contributionsCollection.findOneAndUpdate(
                { studentSelected: contribData.studentSelected, subjectSelected: contribData.subjectSelected },
                { $set: contribData, $setOnInsert: { createdAt: new Date() } },
                { upsert: true, returnDocument: 'after' }
            );
        }
        
        if (result.value) {
            console.log(`Contribution saved: ${result.value._id}`);
            res.json({ 
                success: true, 
                message: 'Contribution enregistrée/mise à jour', 
                data: result.value._id 
            });
        } else {
            res.status(400).json({ error: 'Erreur lors de la sauvegarde' });
        }
    } catch (error) {
        console.error('Error saving contribution:', error);
        if (error.code === 11000) {
            res.status(409).json({ error: 'Contribution existe déjà' });
        } else {
            res.status(500).json({ error: 'Erreur serveur lors de la sauvegarde.' });
        }
    }
});

// Récupérer les contributions d'un élève
app.post('/api/fetchStudentContributions', async (req, res) => {
    if (!isDbConnected) {
        console.log('⚠️ DB not connected, returning empty array for fetchStudentContributions');
        return res.json([]); // Retourner un tableau vide au lieu d'une erreur 500
    }
    
    try {
        const { student } = req.body;
        if (!student) {
            return res.json([]);
        }
        const contributions = await contributionsCollection.find({ studentSelected: student })
            .sort({ subjectSelected: 1 })
            .toArray();
        res.json(contributions);
    } catch (error) {
        console.error('Error fetching student contributions:', error);
        // Retourner un tableau vide au lieu d'erreur 500
        res.json([]);
    }
});

// Récupérer une contribution spécifique
app.post('/api/fetchContribution', async (req, res) => {
    if (!isDbConnected) {
        return res.status(500).json({ error: 'Database not connected' });
    }
    
    try {
        const { contributionId } = req.body;
        const contribution = await contributionsCollection.findOne({ _id: new ObjectId(contributionId) });
        
        if (!contribution) {
            return res.status(404).json({ error: 'Contribution non trouvée' });
        }
        
        const studentInfo = await studentsCollection.findOne(
            { studentSelected: contribution.studentSelected }, 
            { projection: { studentBirthdate: 1 } }
        );
        
        const fullData = { ...contribution, studentBirthdate: studentInfo?.studentBirthdate };
        res.json(fullData);
    } catch (error) {
        console.error('Error fetching contribution:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération.' });
    }
});

// Supprimer une contribution
app.post('/api/deleteContribution', async (req, res) => {
    if (!isDbConnected) {
        return res.status(500).json({ error: 'Database not connected' });
    }
    
    try {
        const { contributionId } = req.body;
        const result = await contributionsCollection.findOneAndDelete({ _id: new ObjectId(contributionId) });
        
        if (result.value) {
            console.log(`Contribution deleted: ${contributionId}`);
            res.json({ success: true, message: 'Contribution supprimée', deletedId: contributionId });
        } else {
            res.status(404).json({ error: 'Contribution non trouvée' });
        }
    } catch (error) {
        console.error('Error deleting contribution:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression.' });
    }
});

// Générer un document Word pour un élève
app.post('/api/generateSingleWord', async (req, res) => {
    if (!isDbConnected) {
        return res.status(500).json({ error: 'Database not connected' });
    }
    
    try {
        const { studentSelected, classSelected, sectionSelected, studentPhotoUrl } = req.body;
        
        if (!studentSelected || !classSelected || !sectionSelected) {
            return res.status(400).json({ error: 'Informations manquantes' });
        }
        
        console.log(`Word generation for: ${studentSelected}`);
        
        // Récupérer les contributions
        const studentContributions = await contributionsCollection.find({
            studentSelected: studentSelected,
            sectionSelected: sectionSelected
        }).toArray();
        
        if (studentContributions.length === 0) {
            console.warn(`⚠️ No contributions found for ${studentSelected}, generating empty document`);
            // Permettre la génération d'un document vide plutôt que de retourner 404
        }
        
        // Récupérer la date de naissance
        const studentInfo = await studentsCollection.findOne(
            { studentSelected },
            { projection: { studentBirthdate: 1 } }
        );
        
        // Récupérer l'image
        let imageBuffer = null;
        if (studentPhotoUrl && studentPhotoUrl.startsWith('http')) {
            imageBuffer = await fetchImage(studentPhotoUrl);
        }
        
        // Créer le document
        const docBuffer = await createWordDocumentBuffer(
            studentSelected,
            classSelected,
            studentInfo?.studentBirthdate,
            imageBuffer,
            studentContributions
        );
        
        // Générer nom de fichier pour le téléchargement
        const timestamp = Date.now();
        const safeStudentName = studentSelected.replace(/[\s/\\?%*:|"<>.]/g, '_');
        const docFileName = `Livret-${safeStudentName}-${timestamp}.docx`;
        
        // VERCEL COMPATIBLE: Stream direct sans écriture de fichier
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${docFileName}"`);
        res.setHeader('Content-Length', docBuffer.length);
        
        console.log(`✅ Streaming Word document for ${studentSelected} (${docBuffer.length} bytes)`);
        res.send(docBuffer);
        
    } catch (error) {
        console.error('Error generating Word:', error);
        res.status(500).json({ error: `Erreur génération Word: ${error.message}` });
    }
});

// Endpoint pour ajouter des données de test (temporaire pour débugger)
app.post('/api/addTestData', async (req, res) => {
    if (!isDbConnected) {
        return res.status(500).json({ error: 'Database not connected' });
    }
    
    try {
        // Données de test pour Bilal
        const testContribution = {
            studentSelected: 'Bilal',
            sectionSelected: 'garcons',
            subjectSelected: 'Mathématiques',
            teacherName: 'Professeur Test',
            teacherComment: 'Excellent travail en mathématiques',
            criteriaValues: {
                A: { sem1: '6', sem2: '7', finalLevel: '7' },
                B: { sem1: '5', sem2: '6', finalLevel: '6' },
                C: { sem1: '7', sem2: '7', finalLevel: '7' },
                D: { sem1: '6', sem2: '7', finalLevel: '7' }
            },
            communicationEvaluation: ['B', 'A', 'B', 'A', 'B']
        };
        
        // Insérer ou mettre à jour
        await contributionsCollection.replaceOne(
            { studentSelected: 'Bilal', subjectSelected: 'Mathématiques' },
            testContribution,
            { upsert: true }
        );
        
        res.json({ success: true, message: 'Données de test ajoutées pour Bilal' });
        
    } catch (error) {
        console.error('Error adding test data:', error);
        res.status(500).json({ error: error.message });
    }
});

// Route de diagnostic pour débugger les problèmes Vercel
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: {
            NODE_ENV: process.env.NODE_ENV || 'development',
            VERCEL: !!process.env.VERCEL,
            MONGODB_URI_defined: !!MONGODB_URI,
            DB_NAME: dbName
        },
        database: {
            connected: isDbConnected,
            collections: {
                contributions: !!contributionsCollection,
                students: !!studentsCollection
            }
        }
    });
});

// Route pour la page principale (catch-all pour servir index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// Catch-all route pour servir index.html pour toutes les autres routes non-API
app.get('*', (req, res) => {
    // Si c'est une route API, laisser passer pour les middlewares suivants
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    // Sinon, servir index.html (pour SPA routing)
    res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// --- Démarrage ---
connectToMongo().then(() => {
    console.log('✅ Server initialized successfully');
    
    // Démarrage local (seulement si pas dans Vercel)
    if (require.main === module) {
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    }
}).catch(err => {
    console.error('❌ Failed to initialize database:', err);
});

// Export pour Vercel
module.exports = app;