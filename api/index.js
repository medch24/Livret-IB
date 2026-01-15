const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');
const PizZip = require("pizzip");
const DocxTemplater = require("docxtemplater");
const ImageModule = require('docxtemplater-image-module-free');
const fetch = require('node-fetch');

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../public')));
app.disable('x-powered-by');

// Variables d'environnement - FORCER LA BONNE URL
const TEMPLATE_URL = process.env.TEMPLATE_URL || 'https://docs.google.com/document/d/18eo_E2ex8K5xu5ce6BQhN8MWi5mL_Nga/export?format=docx';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mohamedsherif:Mmedch86@livret2026.9owu7hs.mongodb.net/?appName=Livret2026';
const DB_NAME = 'teacherContributionsDB';

console.log('🔧 Configuration:');
console.log(`   Template: ${TEMPLATE_URL}`);
console.log(`   MongoDB: ${MONGODB_URI ? 'Configuré' : 'NON configuré'}\n`);

// Image transparente par défaut
const TRANSPARENT_PIXEL = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');

// Critères par matière
const criteriaBySubject = {
    "Acquisition de langues (Anglais)": {A:"Listening",B:"Reading",C:"Speaking",D:"Writing"},
    "Acquisition de langue (اللغة العربية)": {A:"أ الاستماع",B:"ب القراءة",C:"ج التحدث",د:"د الكتابة"},
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
        
        const student = await studentsCollection.findOne({ fullName: studentSelected });
        
        if (!student) {
            return res.json({ fullName: studentSelected, birthDate: '', studentPhotoUrl: '' });
        }
        
        res.json(student);
    } catch (error) {
        console.error('❌ fetchStudentInfo Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/fetchStudentContributions', async (req, res) => {
    try {
        await connectToMongo();
        const { student, classSelected, sectionSelected } = req.body;
        const studentName = student || req.body.studentSelected;
        
        if (!studentName) {
            return res.status(400).json({ error: 'student requis' });
        }
        
        const query = { studentSelected: studentName };
        if (classSelected) query.classSelected = classSelected;
        if (sectionSelected) query.sectionSelected = sectionSelected;
        
        const contributions = await contributionsCollection.find(query).toArray();
        res.json(contributions);
    } catch (error) {
        console.error('❌ fetchStudentContributions Error:', error);
        res.status(500).json({ error: error.message });
    }
});

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
        console.error('❌ fetchData Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/saveContribution', async (req, res) => {
    try {
        await connectToMongo();
        const contribution = req.body;
        
        if (contribution._id || contribution.contributionId) {
            const id = contribution._id || contribution.contributionId;
            delete contribution._id;
            delete contribution.contributionId;
            
            const objectId = typeof id === 'string' ? new ObjectId(id) : id;
            const result = await contributionsCollection.updateOne(
                { _id: objectId },
                { $set: contribution }
            );
            
            res.json({ success: true, contributionId: id });
        } else {
            const result = await contributionsCollection.insertOne(contribution);
            res.json({ success: true, contributionId: result.insertedId });
        }
    } catch (error) {
        console.error('❌ saveContribution Error:', error);
        res.status(500).json({ error: error.message });
    }
});

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
        console.error('❌ fetchContribution Error:', error);
        res.status(500).json({ error: error.message });
    }
});

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
        console.error('❌ deleteContribution Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/getStudentsList', async (req, res) => {
    try {
        await connectToMongo();
        const { classSelected, sectionSelected } = req.body;
        
        if (!classSelected || !sectionSelected) {
            return res.status(400).json({ error: 'classSelected et sectionSelected requis' });
        }
        
        const studentNames = await contributionsCollection.distinct('studentSelected', {
            classSelected,
            sectionSelected
        });
        
        res.json({
            success: true,
            students: studentNames,
            count: studentNames.length
        });
    } catch (error) {
        console.error('❌ getStudentsList Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Génération du livret Word
app.post('/api/generateSingleWord', async (req, res) => {
    try {
        const { 
            studentSelected, 
            studentFullName, 
            studentBirthdate, 
            studentPhoto,
            classSelected, 
            sectionSelected 
        } = req.body;
        
        console.log(`\n📝 Génération livret: ${studentSelected} (${classSelected} ${sectionSelected})`);
        
        if (!studentSelected || !classSelected || !sectionSelected) {
            return res.status(400).json({ error: 'Paramètres manquants' });
        }
        
        await connectToMongo();
        
        // 1. Télécharger le template depuis Google Docs
        console.log(`📥 Téléchargement template: ${TEMPLATE_URL}`);
        const templateResponse = await fetch(TEMPLATE_URL);
        if (!templateResponse.ok) {
            throw new Error(`Erreur téléchargement template: ${templateResponse.status}`);
        }
        const templateBuffer = await templateResponse.buffer();
        console.log(`✅ Template téléchargé: ${templateBuffer.length} bytes`);
        
        // 2. Récupérer les contributions (cherche par "studentSelected" qui est le prénom/clé)
        const contributions = await contributionsCollection.find({
            studentSelected,
            classSelected,
            sectionSelected
        }).toArray();
        
        console.log(`📚 ${contributions.length} contributions trouvées`);
        
        if (contributions.length === 0) {
            return res.status(404).json({ error: 'Aucune contribution trouvée' });
        }
        
        // 3. Récupérer infos élève (si pas fournies dans req.body)
        let studentInfo = null;
        if (!studentFullName || !studentBirthdate) {
            // Essayer de trouver par fullName si studentSelected est déjà un nom complet, ou essayer de deviner
            // Mais ici on fait confiance à ce qui est envoyé par le front (studentFullName)
             studentInfo = await studentsCollection.findOne({ fullName: studentSelected });
             console.log(`👤 Infos élève (DB): ${studentInfo ? 'Trouvées' : 'Non trouvées'}`);
        }

        // Préparation des données finales
        const finalStudentName = studentFullName || studentInfo?.fullName || studentSelected;
        const finalBirthdate = studentBirthdate || studentInfo?.birthDate || studentInfo?.studentBirthdate || '';
        const finalPhotoUrl = studentPhoto || studentInfo?.studentPhotoUrl || '';

        console.log(`👤 Données élève utilisées: Nom=${finalStudentName}, Né(e)=${finalBirthdate}, Photo=${finalPhotoUrl ? 'Oui' : 'Non'}`);

        // 3.5 Précharger l'image de l'élève
        let studentPhotoBuffer = TRANSPARENT_PIXEL;
        if (finalPhotoUrl) {
            try {
                console.log(`🖼️ Téléchargement photo: ${finalPhotoUrl}`);
                const imgResp = await fetch(finalPhotoUrl);
                if (imgResp.ok) {
                    studentPhotoBuffer = await imgResp.buffer();
                    console.log(`✅ Photo téléchargée: ${studentPhotoBuffer.length} bytes`);
                } else {
                    console.warn(`⚠️ Erreur téléchargement photo (Status ${imgResp.status})`);
                }
            } catch (e) {
                console.error("❌ Erreur fetch photo:", e.message);
            }
        }
        
        // 4. Formater les contributions selon les balises du template
        const formattedContributions = contributions.map(c => {
            const criteriaData = c.criteriaValues || {};
            const subjectCriteria = criteriaBySubject[c.subjectSelected] || {};
            
            const getCriteriaValue = (criterion, field) => {
                return criteriaData[criterion]?.[field] || '';
            };
            
            return {
                teacherName: c.teacherName || '',
                subjectSelected: c.subjectSelected || '',
                subject: c.subjectSelected || '',
                teacherComment: c.teacherComment || c.comments || '',
                
                'criteriaName A': subjectCriteria.A || 'Critère A',
                'criteriaName B': subjectCriteria.B || 'Critère B',
                'criteriaName C': subjectCriteria.C || 'Critère C',
                'criteriaName D': subjectCriteria.D || 'Critère D',
                
                'criteriaA.sem1': getCriteriaValue('A', 'sem1'),
                'criteriaA.sem2': getCriteriaValue('A', 'sem2'),
                'criteriaB.sem1': getCriteriaValue('B', 'sem1'),
                'criteriaB.sem2': getCriteriaValue('B', 'sem2'),
                'criteriaC.sem1': getCriteriaValue('C', 'sem1'),
                'criteriaC.sem2': getCriteriaValue('C', 'sem2'),
                'criteriaD.sem1': getCriteriaValue('D', 'sem1'),
                'criteriaD.sem2': getCriteriaValue('D', 'sem2'),
                
                'finalLevel.A': getCriteriaValue('A', 'finalLevel'),
                'finalLevel.B': getCriteriaValue('B', 'finalLevel'),
                'finalLevel.C': getCriteriaValue('C', 'finalLevel'),
                'finalLevel.D': getCriteriaValue('D', 'finalLevel'),
                
                'criteriaKey.A': 'A',
                'criteriaKey.B': 'B',
                'criteriaKey.C': 'C',
                'criteriaKey.D': 'D',
                
                communication: c.atlScores?.communication || '',
                collaboration: c.atlScores?.collaboration || '',
                autogestion: c.atlScores?.autogestion || '',
                recherche: c.atlScores?.recherche || '',
                reflexion: c.atlScores?.reflexion || '',
                
                note: c.finalGrade || '',
                seuil: c.threshold || ''
            };
        });
        
        // 5. Module image
        const imageOpts = {
            centered: true,
            fileType: "docx",
            getImage: (tagValue, tagName) => {
                // Si la valeur est un buffer (notre photo préchargée), on le retourne
                if (Buffer.isBuffer(tagValue)) {
                    return tagValue;
                }
                return TRANSPARENT_PIXEL;
            },
            getSize: () => [120, 150] // Taille standard photo identité
        };
        
        const imageModule = new ImageModule(imageOpts);
        
        // 6. Générer le document
        const zip = new PizZip(templateBuffer);
        const doc = new DocxTemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
            nullGetter: () => '',
            modules: [imageModule]
        });
        
        const renderData = {
            studentSelected: finalStudentName, // Utilise le nom complet
            studentBirthdate: finalBirthdate,
            className: classSelected,
            image: studentPhotoBuffer, // Passe le buffer préchargé
            contributionsBySubject: formattedContributions,
            atlSummaryTable: formattedContributions.map(c => ({
                subject: c.subjectSelected,
                communication: c.communication,
                collaboration: c.collaboration,
                autogestion: c.autogestion,
                recherche: c.recherche,
                reflexion: c.reflexion
            }))
        };
        
        console.log(`📊 Rendu: ${formattedContributions.length} contributions`);
        console.log(`📋 Données renderData:`, {
            studentSelected: renderData.studentSelected,
            studentBirthdate: renderData.studentBirthdate,
            className: renderData.className,
            contributionsCount: renderData.contributionsBySubject.length,
            atlTableCount: renderData.atlSummaryTable.length,
            hasImage: renderData.image !== TRANSPARENT_PIXEL
        });
        
        try {
            doc.render(renderData);
            console.log('✅ Rendu DocxTemplater réussi');
        } catch (renderError) {
            console.error('❌ Erreur rendu DocxTemplater:', renderError);
            console.error('Properties:', renderError.properties);
            throw renderError;
        }
        
        const buffer = doc.getZip().generate({
            type: 'nodebuffer',
            compression: 'STORE'
        });
        
        console.log(`✅ Document généré: ${buffer.length} bytes`);
        
        const filename = `Livret-${finalStudentName.replace(/\s+/g, '_')}-${classSelected}.docx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(buffer);
        
    } catch (error) {
        console.error('❌ generateSingleWord Error:', error);
        console.error('Stack:', error.stack);
        
        // Envoyer plus de détails
        const errorDetails = {
            error: error.message,
            stack: error.stack,
            studentSelected: req.body.studentSelected,
            classSelected: req.body.classSelected,
            sectionSelected: req.body.sectionSelected
        };
        
        if (error.properties) {
            errorDetails.properties = error.properties;
        }
        
        res.status(500).json(errorDetails);
    }
});

app.listen(3000, () => console.log('🚀 Server ready on port 3000'));

module.exports = app;
