const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const PizZip = require("pizzip");
const DocxTemplater = require("docxtemplater");
const ImageModule = require('docxtemplater-image-module-free');
const fetch = require('node-fetch');

const app = express();
app.use(express.json({ limit: '50mb' }));

const MONGODB_URI = process.env.MONGODB_URI;
const TEMPLATE_URL = process.env.TEMPLATE_URL;
const DB_NAME = 'teacherContributionsDB';

// Buffer d'une image transparente pour remplacer le texte "image.png"
const TRANSPARENT_PIXEL = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');

const criteriaBySubject = {
    "Acquisition de langues (Anglais)": {A:"Listening",B:"Reading",C:"Speaking",D:"Writing"},
    "Acquisition de langue (اللغة العربية)": {A:"أ الاستماع",B:"ب القراءة",C:"ج التحدث",D:"د الكتابة"},
    "Langue et littérature (Français)": {A:"Analyse",B:"Organisation",C:"Production de texte",D:"Utilisation de la langue"},
    "Individus et sociétés": {A:"Connaissances et compréhension",B:"Recherche",C:"Communication",D:"Pensée critique"},
    "Sciences": {A:"Connaissances et compréhension",B:"Recherche et élaboration",C:"Traitement et évaluation",D:"Réflexion sur les répercussions"},
    "Mathématiques": {A:"Connaissances et compréhension",B:"Recherche de modèles",C:"Communication",D:"Application des mathématiques"},
    "Arts": {A:"Connaissances et compréhension",B:"Développement des compétences",C:"Pensée créative",D:"Réaction"},
    "Éducation physique et à la santé": {A:"Connaissances et compréhension",B:"Planification",C:"Application et exécution",D:"Réflexion et amélioration"},
    "Design": {A:"Recherche et analyse",B:"Développement des idées",C:"Création de la solution",D:"Évaluation"}
};

let cachedDb = null;
async function connectToDatabase() {
    if (cachedDb) return cachedDb;
    const client = await MongoClient.connect(MONGODB_URI);
    cachedDb = client.db(DB_NAME);
    return cachedDb;
}

app.post('/api/fetchStudentInfo', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const student = await db.collection('students').findOne({ fullName: req.body.studentSelected });
        res.json(student || { fullName: req.body.studentSelected, birthDate: '' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/saveContribution', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const data = req.body;
        const id = data.contributionId || data._id;
        delete data.contributionId; delete data._id;
        if (id) {
            await db.collection('contributions').updateOne({ _id: new ObjectId(id) }, { $set: data });
            res.json({ success: true, data: id });
        } else {
            const result = await db.collection('contributions').insertOne(data);
            res.json({ success: true, data: result.insertedId });
        }
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/getStudentsList', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const students = await db.collection('contributions').distinct('studentSelected', {
            classSelected: req.body.classSelected,
            sectionSelected: req.body.sectionSelected
        });
        res.json({ success: true, students });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/generateSingleWord', async (req, res) => {
    try {
        const { studentSelected, classSelected, sectionSelected } = req.body;
        const db = await connectToDatabase();
        const [contributions, studentInfo] = await Promise.all([
            db.collection('contributions').find({ studentSelected, classSelected, sectionSelected }).toArray(),
            db.collection('students').findOne({ fullName: studentSelected })
        ]);

        if (!contributions.length) return res.status(404).json({ error: "Aucune donnée" });

        const templateResp = await fetch(TEMPLATE_URL);
        const templateBuffer = await templateResp.buffer();

        const formatted = contributions.map(c => {
            const subjCrit = criteriaBySubject[c.subjectSelected] || {};
            const cv = c.criteriaValues || {};
            return {
                teacherName: c.teacherName || '',
                subjectSelected: c.subjectSelected || '',
                teacherComment: c.teacherComment || '',
                criteriaKey: { A: 'A', B: 'B', C: 'C', D: 'D' },
                "criteriaName A": subjCrit.A || '', "criteriaName B": subjCrit.B || '',
                "criteriaName C": subjCrit.C || '', "criteriaName D": subjCrit.D || '',
                criteriaA: { sem1: cv.A?.sem1 ?? '', sem2: cv.A?.sem2 ?? '' },
                criteriaB: { sem1: cv.B?.sem1 ?? '', sem2: cv.B?.sem2 ?? '' },
                criteriaC: { sem1: cv.C?.sem1 ?? '', sem2: cv.C?.sem2 ?? '' },
                criteriaD: { sem1: cv.D?.sem1 ?? '', sem2: cv.D?.sem2 ?? '' },
                finalLevel: {
                    A: cv.A?.finalLevel ?? '', B: cv.B?.finalLevel ?? '',
                    C: cv.C?.finalLevel ?? '', D: cv.D?.finalLevel ?? ''
                },
                seuil: c.threshold ?? '',
                note: c.finalNote ?? ''
            };
        });

        const zip = new PizZip(templateBuffer);
        const imageModule = new ImageModule({
            centered: true, fileType: "docx",
            getImage: () => TRANSPARENT_PIXEL,
            getSize: () => [120, 120]
        });

        const doc = new DocxTemplater(zip, { paragraphLoop: true, linebreaks: true, modules: [imageModule] });

        doc.render({
            className: classSelected,
            studentSelected: studentSelected,
            studentBirthdate: studentInfo?.birthDate || '',
            image: "img", // Déclenche le remplacement de la balise {image}
            contributionsBySubject: formatted,
            atlSummaryTable: contributions.map(c => ({
                subject: c.subjectSelected,
                communication: c.communicationEvaluation?.[0] || '',
                collaboration: c.communicationEvaluation?.[1] || '',
                autogestion: c.communicationEvaluation?.[2] || '',
                recherche: c.communicationEvaluation?.[3] || '',
                reflexion: c.communicationEvaluation?.[4] || ''
            }))
        });

        const buf = doc.getZip().generate({ type: 'nodebuffer' });
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename=Livret.docx`);
        res.send(buf);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = app;
