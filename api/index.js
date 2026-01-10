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
        
        if (!studentName) {
            return res.status(400).json({ error: 'student requis' });
        }
        
        const query = { studentSelected: studentName };
        if (classSelected) query.classSelected = classSelected;
        if (sectionSelected) query.sectionSelected = sectionSelected;
        
        const contributions = await contributionsCollection.find(query).toArray();
        
        res.json(contributions);
    } catch (error) {
        console.error('❌ Erreur fetchStudentContributions:', error);
        res.status(500).json({ error: error.message });
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
        
        if (contribution._id || contribution.contributionId) {
            // Mise à jour
            const id = contribution._id || contribution.contributionId;
            delete contribution._id;
            delete contribution.contributionId;
            
            await contributionsCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: contribution }
            );
            
            res.json({ success: true, contributionId: id });
        } else {
            // Création
            const result = await contributionsCollection.insertOne(contribution);
            res.json({ success: true, contributionId: result.insertedId });
        }
    } catch (error) {
        console.error('❌ Erreur saveContribution:', error);
        res.status(500).json({ error: error.message });
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

// Route principale de génération
app.post('/api/generateClassZip', async (req, res) => {
    const { classSelected, sectionSelected } = req.body;
    console.log(`\n🚀 Début génération ZIP - Classe: ${classSelected}, Section: ${sectionSelected}`);
    
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

        const zip = archiver('zip', { zlib: { level: 5 } });
        const safeSection = (sectionSelected || "section").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const zipName = `Livrets-${classSelected}-${safeSection}.zip`;

        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${zipName}"`);
        zip.pipe(res);

        const templateUrl = classSelected.startsWith('DP') ? process.env.TEMPLATE_URL_DP : process.env.TEMPLATE_URL;
        console.log(`📄 Téléchargement du template: ${templateUrl}`);
        const templateResponse = await fetch(templateUrl);
        const templateBuffer = await templateResponse.buffer();
        console.log(`✅ Template téléchargé (${templateBuffer.length} bytes)`);

        let successCount = 0;
        let errorCount = 0;

        for (const studentName of studentNames) {
            try {
                console.log(`\n👤 Traitement de ${studentName}...`);
                
                const contributions = await contributionsCollection.find({
                    studentSelected: studentName,
                    classSelected,
                    sectionSelected
                }).toArray();

                console.log(`  📚 ${contributions.length} contributions trouvées`);

                if (!contributions || contributions.length === 0) {
                    console.warn(`⚠️ Aucune contribution pour ${studentName}`);
                    errorCount++;
                    continue;
                }

                const studentInfo = await studentsCollection.findOne({ fullName: studentName });
                
                // ⚠️ PHOTOS DÉSACTIVÉES - Utilisation d'un pixel transparent pour éviter les erreurs
                // Les photos devront être ajoutées manuellement dans les documents Word
                console.log(`  📝 Génération sans photo (à ajouter manuellement)`);
                const imageBuffer = TRANSPARENT_PIXEL;

                // Formater les contributions pour le template
                const formattedContributions = contributions.map(c => {
                    // Gérer les critères (A, B, C, D)
                    const criteriaData = c.criteriaValues || {};
                    const unitsSem1Count = c.unitsSem1 || 1;
                    const unitsSem2Count = c.unitsSem2 || 1;
                    
                    const formatCriteria = (criterion) => {
                        const data = criteriaData[criterion] || {};
                        
                        // Créer des tableaux d'unités avec la bonne taille
                        const sem1Units = Array.isArray(data.sem1Units) 
                            ? data.sem1Units 
                            : [];
                        const sem2Units = Array.isArray(data.sem2Units) 
                            ? data.sem2Units 
                            : [];
                        
                        // Remplir avec des chaînes vides si nécessaire
                        while (sem1Units.length < unitsSem1Count) {
                            sem1Units.push('');
                        }
                        while (sem2Units.length < unitsSem2Count) {
                            sem2Units.push('');
                        }
                        
                        return {
                            sem1: data.sem1 || '',
                            sem2: data.sem2 || '',
                            finalLevel: data.finalLevel || '',
                            sem1Units: sem1Units,
                            sem2Units: sem2Units
                        };
                    };

                    // S'assurer que communicationEvaluation a toujours 5 éléments
                    const commEval = Array.isArray(c.communicationEvaluation) 
                        ? c.communicationEvaluation 
                        : [];
                    while (commEval.length < 5) {
                        commEval.push('');
                    }

                    return {
                        teacherName: c.teacherName || 'N/A',
                        subjectName: c.subjectName || 'N/A',
                        approachToLearning: c.approachToLearning || 'N/A',
                        comments: c.comments || '',
                        teacherComment: c.teacherComment || '',
                        globalContexts: Array.isArray(c.globalContexts) ? c.globalContexts : [],
                        
                        // Communication evaluation (tableau de 5 valeurs)
                        communicationEvaluation: commEval,
                        
                        // Nombre d'unités
                        unitsSem1: unitsSem1Count,
                        unitsSem2: unitsSem2Count,
                        
                        // Critères formatés
                        criteriaA: formatCriteria('A'),
                        criteriaB: formatCriteria('B'),
                        criteriaC: formatCriteria('C'),
                        criteriaD: formatCriteria('D'),
                        
                        // Valeurs des critères (pour compatibilité)
                        criteriaValues: {
                            A: formatCriteria('A'),
                            B: formatCriteria('B'),
                            C: formatCriteria('C'),
                            D: formatCriteria('D')
                        }
                    };
                });

                const zipContent = new PizZip(templateBuffer);
                
                // ⚠️ MODULE IMAGE DÉSACTIVÉ pour éviter les erreurs
                // Les photos devront être ajoutées manuellement dans Word
                const doc = new DocxTemplater(zipContent, {
                    paragraphLoop: true,
                    linebreaks: true,
                    nullGetter: (part) => {
                        // Retourner silencieusement une chaîne vide pour les propriétés manquantes
                        return '';
                    }
                });

                try {
                    const renderData = {
                        studentName: studentName || '',
                        birthDate: studentInfo?.birthDate || 'N/A',
                        // ⚠️ Images désactivées - à ajouter manuellement
                        // image: imageBuffer,
                        // studentPhoto: imageBuffer,
                        // photo: imageBuffer,
                        contributions: formattedContributions || []
                    };
                    
                    console.log(`  📝 Rendu avec ${formattedContributions.length} contributions (sans photo)`);
                    doc.render(renderData);
                } catch (renderError) {
                    console.error(`❌ Erreur de rendu pour ${studentName}:`, renderError);
                    if (renderError.properties && renderError.properties.errors) {
                        renderError.properties.errors.forEach(err => {
                            console.error(`  - ${err.message}`, err);
                        });
                    }
                    throw renderError;
                }

                const buf = doc.getZip().generate({ type: 'nodebuffer' });
                zip.append(buf, { name: `${studentName}.docx` });
                
                successCount++;
                console.log(`✅ Livret généré pour ${studentName}`);
            } catch (studentError) {
                errorCount++;
                console.error(`❌ Erreur pour ${studentName}:`, studentError.message);
                console.error('Stack:', studentError.stack);
                // Continuer avec les autres élèves
            }
        }

        await zip.finalize();
        console.log(`\n🎉 Génération terminée: ${successCount} succès, ${errorCount} erreurs`);
    } catch (error) {
        console.error('❌ Error:', error);
        if (!res.headersSent) res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => console.log('🚀 Server ready'));
module.exports = app;
