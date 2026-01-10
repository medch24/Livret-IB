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
    if (!url) return TRANSPARENT_PIXEL;
    try {
        console.log(`🖼️ Tentative de chargement de l'image: ${url}`);
        
        // 1. Essayer dans le dossier public/photos
        const localPathPhotos = path.join(__dirname, '../public/photos', url);
        if (fs.existsSync(localPathPhotos)) {
            console.log(`✅ Image trouvée dans public/photos: ${localPathPhotos}`);
            const buffer = fs.readFileSync(localPathPhotos);
            const image = await Jimp.read(buffer);
            image.scaleToFit(180, 180);
            return await image.getBufferAsync(Jimp.MIME_PNG);
        }

        // 2. Essayer à la racine du projet
        const rootPath = path.join(__dirname, '..', url);
        if (fs.existsSync(rootPath)) {
            console.log(`✅ Image trouvée à la racine: ${rootPath}`);
            const buffer = fs.readFileSync(rootPath);
            const image = await Jimp.read(buffer);
            image.scaleToFit(180, 180);
            return await image.getBufferAsync(Jimp.MIME_PNG);
        }

        // 3. Si c'est une URL distante
        if (url.startsWith('http')) {
            console.log(`🌐 Téléchargement de l'image depuis: ${url}`);
            let finalUrl = url;
            if (url.includes('drive.google.com') || url.includes('googleusercontent.com')) {
                const match = url.match(/[-\w]{25,}/);
                if (match && match[0]) {
                    finalUrl = `https://drive.google.com/uc?export=download&id=${match[0]}&confirm=t`;
                }
            }

            const response = await fetch(finalUrl, { 
                timeout: 8000,
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            
            if (response.ok) {
                const buffer = await response.buffer();
                const image = await Jimp.read(buffer);
                image.scaleToFit(180, 180);
                console.log(`✅ Image téléchargée et redimensionnée`);
                return await image.getBufferAsync(Jimp.MIME_PNG);
            }
        }
        
        console.warn(`⚠️ Image non trouvée: ${url}, utilisation d'un pixel transparent`);
        return TRANSPARENT_PIXEL;
    } catch (error) {
        console.error(`❌ Erreur lors du chargement de l'image ${url}:`, error.message);
        return TRANSPARENT_PIXEL;
    }
}

// Route principale de génération
app.post('/api/generateClassZip', async (req, res) => {
    const { classSelected, sectionSelected } = req.body;
    try {
        await connectToMongo();
        
        const studentNames = await contributionsCollection.distinct('studentSelected', {
            classSelected,
            sectionSelected
        });

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
        const templateResponse = await fetch(templateUrl);
        const templateBuffer = await templateResponse.buffer();

        for (const studentName of studentNames) {
            try {
                const contributions = await contributionsCollection.find({
                    studentSelected: studentName,
                    classSelected,
                    sectionSelected
                }).toArray();

                if (!contributions || contributions.length === 0) {
                    console.warn(`⚠️ Aucune contribution pour ${studentName}`);
                    continue;
                }

                const studentInfo = await studentsCollection.findOne({ fullName: studentName });
                
                // Récupérer la photo de l'élève
                let photoUrl = null;
                if (studentInfo?.studentPhotoUrl) {
                    photoUrl = studentInfo.studentPhotoUrl;
                } else {
                    // Essayer de trouver la photo dans le dossier public avec différentes extensions
                    const possibleExtensions = ['.png', '.jpg', '.jpeg', '.PNG', '.JPG', '.JPEG'];
                    for (const ext of possibleExtensions) {
                        const possiblePath = path.join(__dirname, '..', `${studentName}${ext}`);
                        if (fs.existsSync(possiblePath)) {
                            photoUrl = `${studentName}${ext}`;
                            break;
                        }
                    }
                }

                const imageBuffer = await fetchImage(photoUrl);

                // Formater les contributions pour le template
                const formattedContributions = contributions.map(c => ({
                    ...c,
                    teacherName: c.teacherName || 'N/A',
                    subjectName: c.subjectName || 'N/A',
                    approachToLearning: c.approachToLearning || 'N/A',
                    comments: c.comments || '',
                    globalContexts: c.globalContexts || []
                }));

                const zipContent = new PizZip(templateBuffer);
                const doc = new DocxTemplater(zipContent, {
                    modules: [new ImageModule({
                        centered: false,
                        getImage: (tagValue) => tagValue,
                        getSize: () => [150, 150]
                    })],
                    paragraphLoop: true,
                    linebreaks: true,
                    nullGetter: () => ''
                });

                doc.render({
                    studentName,
                    birthDate: studentInfo?.birthDate || 'N/A',
                    image: imageBuffer,
                    studentPhoto: imageBuffer,
                    photo: imageBuffer,
                    contributions: formattedContributions
                });

                const buf = doc.getZip().generate({ type: 'nodebuffer' });
                zip.append(buf, { name: `${studentName}.docx` });
                
                console.log(`✅ Livret généré pour ${studentName}`);
            } catch (studentError) {
                console.error(`❌ Erreur pour ${studentName}:`, studentError.message);
                // Continuer avec les autres élèves
            }
        }

        await zip.finalize();
    } catch (error) {
        console.error('❌ Error:', error);
        if (!res.headersSent) res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => console.log('🚀 Server ready'));
module.exports = app;
