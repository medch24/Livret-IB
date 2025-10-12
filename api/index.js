// --- Dépendances ---
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const PizZip = require("pizzip");
const DocxTemplater = require("docxtemplater");
const ImageModule = require('docxtemplater-image-module-free');
const fetch = require('node-fetch');
const XLSX = require('xlsx');

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

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'teacherContributionsDB';
const contributionsCollectionName = 'contributions';
const studentsCollectionName = 'students';
const PUBLIC_DIR = path.join(__dirname, '../public');

let contributionsCollection;
let studentsCollection;
let isDbConnected = false;

// --- Structure Données (Référence pour les critères) ---
const criteriaBySubject = {"Langues et littérature":{A:"Analyse",B:"Organisation",C:"Production de texte",D:"Utilisation de la langue"},"Mathématiques":{A:"Connaissances et compréhension",B:"Recherche de modèles",C:"Communication",D:"Application des mathématiques"},"Individus et Sociétés":{A:"Connaissances et compréhension",B:"Recherche",C:"Communication",D:"Pensée critique"},"Sciences":{A:"Connaissances et compréhension",B:"Recherche et élaboration",C:"Traitement et évaluation",D:"Réflexion sur les répercussions"},"Biologie":{A:"Connaissances et compréhension",B:"Recherche et élaboration",C:"Traitement et évaluation",D:"Réflexion sur les répercussions"},"Physique-Chimie":{A:"Connaissances et compréhension",B:"Recherche et élaboration",C:"Traitement et évaluation",D:"Réflexion sur les répercussions"},"Langue Anglaise":{A:"Listening",B:"Reading",C:"Speaking",D:"Writing"},"Design":{A:"Recherche et analyse",B:"Développement des idées",C:"Création de la solution",D:"Évaluation"},"Musique":{A:"Connaissances et comprehensions",B:"Développement des competences",C:"Pensée créative",D:"Réaction"},"ART":{A:"Connaissances et comprehensions",B:"Développement des competences",C:"Pensée créative",D:"Réaction"},"Éducation Physique":{A:"Connaissances et compréhension",B:"Planification",C:"Application et exécution",D:"Réflexion et amélioration"},"L.L":{A:"Analyse",B:"Organisation",C:"Production de texte",D:"Utilisation de la langue"},"I.S":{A:"Connaissances et compréhension",B:"Recherche",C:"Communication",D:"Pensée critique"},"E.S":{A:"Connaissances et compréhension",B:"Recherche et élaboration",C:"Traitement et évaluation",D:"Réflexion sur les répercussions"}};

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
function calculateFinalNote(totalLevel) {
    if (totalLevel <= 0 || isNaN(totalLevel)) return "1";
    let note = Math.round(totalLevel / 4);
    if (note < 1) note = 1;
    if (note > 8) note = 8;
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
    
    ['A', 'B', 'C', 'D'].forEach(key => {
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
    
    const finalNote = calculateFinalNote(totalLevel);
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
        console.log(`Fetching Word template from: ${templateURL}`);
        const response = await fetch(templateURL);
        if (!response.ok) throw new Error(`Fetch template failed: ${response.statusText}`);
        
        const templateContent = await response.arrayBuffer();
        const zip = new PizZip(templateContent);
        
        const pixels = 151;
        const imageOpts = {
            centered: false,
            getSize: () => [pixels, pixels],
            getImage: function(tagValue, tagName) {
                if (!imageBuffer) {
                    console.warn(`No image buffer for tag ${tagName}`);
                    return null;
                }
                return imageBuffer;
            },
            errorLogger: function(error) {
                console.error("ImageModule Error:", error);
            }
        };
        
        const imageModule = new ImageModule(imageOpts);
        const doc = new DocxTemplater(zip, {
            modules: [imageModule],
            paragraphLoop: true,
            linebreaks: true,
            nullGetter: () => ""
        });
        
        const documentData = prepareWordData(studentName, className, studentBirthdate, originalContributions);
        const dataToRender = {
            ...documentData,
            image: imageBuffer ? 'placeholder_for_module' : ""
        };
        
        console.log(`Rendering Word document for ${studentName}...`);
        doc.render(dataToRender);
        
        console.log(`Generating final buffer for ${studentName}...`);
        const buffer = doc.getZip().generate({
            type: "nodebuffer",
            compression: "DEFLATE"
        });
        
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
        return res.status(500).json({ error: 'Database not connected' });
    }
    
    try {
        const { studentSelected, subjectSelected } = req.body;
        const contribution = await contributionsCollection.findOne({ studentSelected, subjectSelected });
        const studentInfo = await studentsCollection.findOne({ studentSelected }, { projection: { studentBirthdate: 1 } });
        
        if (contribution) {
            res.json({ ...contribution, studentBirthdate: studentInfo?.studentBirthdate });
        } else {
            res.json({ noDataForSubject: true, studentSelected, studentBirthdate: studentInfo?.studentBirthdate });
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des données.' });
    }
});

// Récupérer les infos d'un élève
app.post('/api/fetchStudentInfo', async (req, res) => {
    if (!isDbConnected) {
        return res.status(500).json({ error: 'Database not connected' });
    }
    
    try {
        const { studentSelected } = req.body;
        const studentInfo = await studentsCollection.findOne(
            { studentSelected }, 
            { projection: { studentBirthdate: 1 } }
        );
        res.json(studentInfo || null);
    } catch (error) {
        console.error('Error fetching student info:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des infos élève.' });
    }
});

// Enregistrer/Mettre à jour une contribution
app.post('/api/saveContribution', async (req, res) => {
    if (!isDbConnected) {
        return res.status(500).json({ error: 'Database not connected' });
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
        return res.status(500).json({ error: 'Database not connected' });
    }
    
    try {
        const { student } = req.body;
        const contributions = await contributionsCollection.find({ studentSelected: student })
            .sort({ subjectSelected: 1 })
            .toArray();
        res.json(contributions);
    } catch (error) {
        console.error('Error fetching student contributions:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des contributions.' });
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
            return res.status(404).json({ error: `Aucune contribution trouvée pour ${studentSelected}` });
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
        
        // Générer nom de fichier
        const timestamp = Date.now();
        const safeStudentName = studentSelected.replace(/[\s/\\?%*:|"<>.]/g, '_');
        const docFileName = `Livret-${safeStudentName}-${timestamp}.docx`;
        const docFilePath = path.join(PUBLIC_DIR, docFileName);
        
        // Sauvegarder temporairement
        fs.writeFileSync(docFilePath, docBuffer);
        
        // Programmer la suppression
        setTimeout(() => {
            if (fs.existsSync(docFilePath)) {
                fs.unlinkSync(docFilePath);
                console.log(`Temporary file deleted: ${docFileName}`);
            }
        }, 30000); // 30 secondes
        
        res.json({
            success: true,
            filePath: `/${docFileName}`,
            fileName: docFileName,
            student: studentSelected
        });
        
    } catch (error) {
        console.error('Error generating Word:', error);
        res.status(500).json({ error: `Erreur génération Word: ${error.message}` });
    }
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