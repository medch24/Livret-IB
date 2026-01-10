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
        // 1. Essayer en local d'abord
        const localPath = path.join(__dirname, '../public/photos', url);
        if (fs.existsSync(localPath)) {
            const buffer = fs.readFileSync(localPath);
            const image = await Jimp.read(buffer);
            image.scaleToFit(180, 180);
            return await image.getBufferAsync(Jimp.MIME_PNG);
        }

        // 2. Si c'est une URL distante
        if (url.startsWith('http')) {
            const response = await fetch(url, { timeout: 5000 });
            if (response.ok) {
                const buffer = await response.buffer();
                const image = await Jimp.read(buffer);
                image.scaleToFit(180, 180);
                return await image.getBufferAsync(Jimp.MIME_PNG);
            }
        }
        return TRANSPARENT_PIXEL;
    } catch (error) {
        return TRANSPARENT_PIXEL;
    }
}

// Route principale de génération
app.post('/api/generateClassZip', async (req, res) => {
    const { classSelected, sectionSelected } = req.body;
    try {
        await connectToMongo();
        
        // Récupérer les élèves distincts depuis les contributions
        const studentNames = await contributionsCollection.distinct('studentSelected', {
            classSelected,
            sectionSelected
        });

        if (!studentNames || studentNames.length === 0) {
            return res.status(404).json({ error: 'Aucun élève trouvé' });
        }

        const zip = archiver('zip', { zlib: { level: 5 } });
        const safeSection = sectionSelected.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const zipName = `Livrets-${classSelected}-${safeSection}.zip`;

        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${zipName}"`);
        zip.pipe(res);

        // Template URL
        const templateUrl = classSelected.startsWith('DP') ? process.env.TEMPLATE_URL_DP : process.env.TEMPLATE_URL;
        const templateResponse = await fetch(templateUrl);
        const templateBuffer = await templateResponse.buffer();

        for (const studentName of studentNames) {
            const contributions = await contributionsCollection.find({
                studentSelected: studentName,
                classSelected,
                sectionSelected
            }).toArray();

            const studentInfo = await studentsCollection.findOne({ fullName: studentName });
            const photoUrl = studentInfo?.studentPhotoUrl || `${studentName}.jpg`;
            const imageBuffer = await fetchImage(photoUrl);

            const zipContent = new PizZip(templateBuffer);
            const doc = new DocxTemplater(zipContent, {
                modules: [new ImageModule({
                    centered: false,
                    getImage: (tagValue) => tagValue,
                    getSize: () => [150, 150]
                })]
            });

            doc.render({
                studentName,
                birthDate: studentInfo?.birthDate || 'N/A',
                image: imageBuffer,
                studentPhoto: imageBuffer,
                photo: imageBuffer,
                contributions: contributions
            });

            const buf = doc.getZip().generate({ type: 'nodebuffer' });
            zip.append(buf, { name: `${studentName}.docx` });
        }

        await zip.finalize();
    } catch (error) {
        console.error('❌ Error:', error);
        if (!res.headersSent) res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => console.log('🚀 Server ready'));
module.exports = app;
