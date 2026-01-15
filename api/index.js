const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');
const PizZip = require('pizzip');
const DocxTemplater = require("docxtemplater");
const ImageModule = require('docxtemplater-image-module-free');
const fetch = require('node-fetch');
const Jimp = require('jimp');

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../public')));
app.disable('x-powered-by');

// Variables d'environnement - FORCER LA BONNE URL
const TEMPLATE_URL = process.env.TEMPLATE_URL || 'https://docs.google.com/document/d/18eo_E2ex8K5xu5ce6BQhN8MWi5mL_Nga/export?format=docx';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mohamedsherif:Mmedch86@livret2026.9owu7hs.mongodb.net/?appName=Livret2026';
const DB_NAME = 'teacherContributionsDB';

console.log('🔍 Configuration:');
console.log(`   Template: ${TEMPLATE_URL}`);
console.log(`   MongoDB: ${MONGODB_URI ? "Configuré" : "NON configuré"}\n`);

// Image transparente par défaut
const TRANSPARENT_PIXEL = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');

// Critères par matière
const criteriaBySubject = {
        "Acquisition de langues (Anglais)": {A:"Listening",B:"Reading",C:"Speaking",D:"Writing"},
        "Acquisition de langue (اللغة العربية)": {A:"الاستماع",B:"القراءة",C:"التحدث",D:"الكتابة"},
        "Langue et littérature (Français)": {A:"Analyse",B:"Organisation",C:"Production de texte",D:"Utilisation de la langue"},
        "Individus et sociétés": {A:"Connaissances et compréhension",B:"Recherche",C:"Communication",D:"Pensée critique"},
        "Sciences": {A:"Connaissances et compréhension",B:"Recherche et élaboration",C:"Traitement et évaluation",D:"Réflexion sur les répercussions"},
        "Mathématiques": {A:"Connaissances et compréhension",B:"Recherche de modèles",C:"Communication",D:"Application des mathématiques"},
        "Arts": {A:"Connaissances et compréhension",B:"Développement des compétences",C:"Pensée créative",D:"Réaction"},
        "Éducation physique et à la santé": {A:"Connaissances et compréhension",B:"Planification",C:"Application et exécution",D:"Réflexion et amélioration"},
        "Design": {A:"Recherche et analyse",B:"Développement des idées",C:"Création de la solution",D:"Évaluation"}
};

let client, db, studentsCollection, contributionsCollection;
let isDbConnected = false;

async function connectToMongo() {
        if (isDbConnected) return;
        try {
                    client = new MongoClient(MONGODB_URI);
                    await client.connect();
                    db = client.db(DB_NAME);
                    studentsCollection = db.collection('students');
                    contributionsCollection = db.collection('contributions');
                    isDbConnected = true;
                    console.log('✅ MongoDB Connected');
        } catch (error) {
                    console.error('❌ MongoDB Error:', error);
                    throw error;
        }
}

// Routes MongoDB
app.post('/api/fetchStudentInfo', async (req, res) => {
        try {
                    await connectToMongo();
                    const { studentSelected } = req.body;

            if (!studentSelected) {
                            return res.status(400).json({ error: 'studentSelected requis' });
            }

            const student = await studentsCollection.findOne({ 
                                                                         $or: [
                                                                             { name: studentSelected },
                                                                             { _id: ObjectId.isValid(studentSelected) ? new ObjectId(studentSelected) : null }
                                                                                         ]
            });

            if (!student) {
                            return res.status(404).json({ error: 'Étudiant non trouvé' });
            }

            res.json(student);
        } catch (error) {
                    console.error('Error fetching student:', error);
                    res.status(500).json({ error: error.message });
        }
});

app.get('/api/fetchStudentsByClass', async (req, res) => {
        try {
                    await connectToMongo();
                    const { className, section } = req.query;

            const query = {};
                    if (className) qu
