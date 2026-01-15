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
        if (className) query.class = className;
        if (section) query.section = section;

        const students = await studentsCollection.find(query).sort({ name: 1 }).toArray();
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route pour récupérer les contributions d'un élève
app.get('/api/fetchContributions', async (req, res) => {
    try {
        await connectToMongo();
        const { studentId } = req.query;
        if (!studentId) return res.status(400).json({ error: 'studentId requis' });

        const contributions = await contributionsCollection.find({ studentId }).toArray();
        res.json(contributions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Fonction utilitaire pour valider une image avec Jimp
async function validateAndProcessImage(imageBuffer) {
    try {
        if (!imageBuffer || imageBuffer.length === 0) return TRANSPARENT_PIXEL;
        
        // Essayer de lire l'image avec Jimp pour vérifier si elle est corrompue
        const image = await Jimp.read(imageBuffer);
        
        // Si l'image est trop grande, on peut la redimensionner pour éviter de saturer la mémoire du DOCX
        if (image.getWidth() > 1200) {
            image.resize(1200, Jimp.AUTO);
        }
        
        return await image.getBufferAsync(Jimp.MIME_PNG);
    } catch (err) {
        console.warn('⚠️ Image invalide ou corrompue, remplacement par un pixel transparent:', err.message);
        return TRANSPARENT_PIXEL;
    }
}

// Route de génération de livret
app.post('/api/generate-booklet', async (req, res) => {
    try {
        const { studentData, contributions } = req.body;
        
        if (!studentData) {
            return res.status(400).json({ error: "Données de l'élève manquantes" });
        }

        console.log(`📄 Génération du livret pour: ${studentData.name}`);

        // 1. Télécharger le template
        const response = await fetch(TEMPLATE_URL);
        if (!response.ok) throw new Error(`Impossible de télécharger le template: ${response.statusText}`);
        const templateBuffer = await response.buffer();

        // 2. Préparer les données pour le template
        const docData = {
            studentName: studentData.name || 'N/A',
            studentClass: studentData.class || 'N/A',
            studentSection: studentData.section || 'N/A',
            studentId: studentData.studentId || 'N/A',
            date: new Date().toLocaleDateString('fr-FR'),
            subjects: []
        };

        // Mapper les contributions par matière
        for (const subject of Object.keys(criteriaBySubject)) {
            const contrib = contributions.find(c => c.subject === subject) || {};
            const criteria = criteriaBySubject[subject];
            
            // Traitement de l'image de signature
            let signatureBuffer = TRANSPARENT_PIXEL;
            if (contrib.signature) {
                try {
                    const base64Data = contrib.signature.replace(/^data:image\/\w+;base64,/, "");
                    signatureBuffer = await validateAndProcessImage(Buffer.from(base64Data, 'base64'));
                } catch (e) {
                    console.error(`Erreur signature pour ${subject}:`, e);
                }
            }

            docData.subjects.push({
                name: subject,
                critA: contrib.critA || '-',
                critB: contrib.critB || '-',
                critC: contrib.critC || '-',
                critD: contrib.critD || '-',
                descA: criteria.A,
                descB: criteria.B,
                descC: criteria.C,
                descD: criteria.D,
                comment: contrib.comment || 'Pas de commentaire.',
                teacherName: contrib.teacherName || 'Non spécifié',
                signature: signatureBuffer
            });
        }

        // 3. Configurer Docxtemplater avec le module d'image
        const zip = new PizZip(templateBuffer);
        
        const opts = {
            centered: false,
            getImage: (tagValue) => tagValue,
            getSize: () => [150, 60] // Taille de la signature
        };

        const doc = new DocxTemplater(zip, {
            modules: [new ImageModule(opts)],
            paragraphLoop: true,
            linebreaks: true
        });

        // 4. Générer le document
        doc.render(docData);

        const out = doc.getZip().generate({
            type: 'nodebuffer',
            compression: 'DEFLATE'
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename=Livret-${studentData.name.replace(/\s+/g, '_')}.docx`);
        res.send(out);

    } catch (error) {
        console.error('❌ Erreur génération:', error);
        res.status(500).json({ error: error.message });
    }
});

// Route par défaut pour Vercel
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = app;
