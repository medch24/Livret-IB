// --- Dépendances ---
const express = require('express');
const http = require('http');
const { MongoClient, ObjectId } = require('mongodb');
const socketIo = require('socket.io');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const PizZip = require("pizzip");
const DocxTemplater = require("docxtemplater");
const ImageModule = require('docxtemplater-image-module-free');
const fetch = require('node-fetch'); // v2
const XLSX = require('xlsx');

// --- Configuration chemins (UI vs Exports) ---
const STATIC_DIR = path.join(__dirname, '../public'); // ton app (index.html, css…)
const WRITABLE_DIR = process.env.TMPDIR || '/tmp';    // dossier écrivable en serverless
const EXPORT_DIR = process.env.VERCEL
  ? path.join(WRITABLE_DIR, 'exports')
  : path.join(__dirname, '../public/exports');

if (!fs.existsSync(EXPORT_DIR)) {
  fs.mkdirSync(EXPORT_DIR, { recursive: true });
  console.log(`Created export directory at ${EXPORT_DIR}`);
}

// --- App / Socket ---
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'teacherContributionsDB';
const contributionsCollectionName = 'contributions';
const studentsCollectionName = 'students';

let contributionsCollection;
let studentsCollection;
let isDbConnected = false;

// --- Structure Données (Référence pour les critères) ---
const criteriaBySubject = {"Langues et littérature":{A:"Analyse",B:"Organisation",C:"Production de texte",D:"Utilisation de la langue"},"Mathématiques":{A:"Connaissances et compréhension",B:"Recherche de modèles",C:"Communication",D:"Application des mathématiques"},"Individus et Sociétés":{A:"Connaissances et compréhension",B:"Recherche",C:"Communication",D:"Pensée critique"},"Sciences":{A:"Connaissances et compréhension",B:"Recherche et élaboration",C:"Traitement et évaluation",D:"Réflexion sur les répercussions"},"Biologie":{A:"Connaissances et compréhension",B:"Recherche et élaboration",C:"Traitement et évaluation",D:"Réflexion sur les répercussions"},"Physique-Chimie":{A:"Connaissances et compréhension",B:"Recherche et élaboration",C:"Traitement et évaluation",D:"Réflexion sur les répercussions"},"Langue Anglaise":{A:"Listening",B:"Reading",C:"Speaking",D:"Writing"},"Design":{A:"Recherche et analyse",B:"Développement des idées",C:"Création de la solution",D:"Évaluation"},"Musique":{A:"Connaissances et comprehensions",B:"Développement des competences",C:"Pensée créative",D:"Réaction"},"ART":{A:"Connaissances et comprehensions",B:"Développement des competences",C:"Pensée créative",D:"Réaction"},"Éducation Physique":{A:"Connaissances et compréhension",B:"Planification",C:"Application et exécution",D:"Réflexion et amélioration"},"L.L":{A:"Analyse",B:"Organisation",C:"Production de texte",D:"Utilisation de la langue"},"I.S":{A:"Connaissances et compréhension",B:"Recherche",C:"Communication",D:"Pensée critique"},"E.S":{A:"Connaissances et compréhension",B:"Recherche et élaboration",C:"Traitement et évaluation",D:"Réflexion sur les répercussions"}};

// --- ORDRE SOUHAITÉ DES MATIÈRES POUR LE WORD ---
const subjectOrderPriority = { "L.L": 1,"Mathématiques": 2,"I.S": 3,"Biologie": 4,"Sciences": 4,"E.S": 4,"Physique-Chimie": 5,"Design": 6,"Langue Anglaise": 8,"Musique": 10,"ART": 10,"Éducation Physique": 11 };
const defaultSubjectPriority = 99;

// --- Connexion Base de Données ---
async function connectToMongo() {
  if (!MONGODB_URI) {
    console.error("FATAL ERROR: MONGODB_URI is not defined. Set it in your Vercel env or .env");
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 8000,
  });

  try {
    await client.connect();
    console.log('✅ Successfully connected to MongoDB.');
    const db = client.db(dbName);
    contributionsCollection = db.collection(contributionsCollectionName);
    studentsCollection = db.collection(studentsCollectionName);
    isDbConnected = true;

    await ensureIndexes();
    initializeSocketEvents();
    io.emit('db_ready');

    client.on('close', () => {
      console.warn('MongoDB connection closed!');
      isDbConnected = false;
      contributionsCollection = null;
      studentsCollection = null;
      io.emit('db_disconnected');
    });
  } catch (error) {
    console.error('❌ FATAL ERROR: Could not connect to MongoDB:', error);
    isDbConnected = false;
    process.exit(1);
  }
}

// Assurer les index
async function ensureIndexes() {
  if (!isDbConnected) return;
  try {
    await contributionsCollection.createIndex({ studentSelected: 1, subjectSelected: 1 }, { unique: true, name: "student_subject_unique" });
    await contributionsCollection.createIndex({ studentSelected: 1 }, { name: "student_lookup" });
    await studentsCollection.createIndex({ studentSelected: 1 }, { unique: true, name: "student_name_unique" });
    console.log('👍 Database indexes ensured.');
  } catch (indexError) {
    if (indexError.code === 85 || indexError.codeName === 'IndexOptionsConflict' || indexError.codeName === 'IndexKeySpecsConflict') {
      console.log('ℹ️ Indexes already exist or options conflict (OK).');
    } else {
      console.warn('⚠️ Warning creating indexes:', indexError.message);
    }
  }
}

// --- Nettoyage exports ---
function cleanExportDirectory(extension) {
  console.log(`🧹 Cleaning old *.${extension} files in ${EXPORT_DIR}...`);
  try {
    const files = fs.readdirSync(EXPORT_DIR);
    let deletedCount = 0;
    files.forEach(file => {
      if (file.endsWith(`.${extension}`)) {
        const filePath = path.join(EXPORT_DIR, file);
        try { fs.unlinkSync(filePath); deletedCount++; } catch (e) {}
      }
    });
    console.log(`   Deleted ${deletedCount} *.${extension} file(s).`);
  } catch (readErr) {
    console.error(`   Error reading export directory ${EXPORT_DIR}:`, readErr);
  }
}

// --- Logique Socket.IO ---
function initializeSocketEvents() {
  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);
    if (isDbConnected) socket.emit('db_ready'); else socket.emit('db_disconnected');

    const checkDbReady = () => {
      if (!isDbConnected || !contributionsCollection || !studentsCollection) {
        socket.emit('error', { message: 'La connexion à la base de données est indisponible. Veuillez réessayer plus tard.' });
        return false;
      }
      return true;
    };

    // --- CRUD Contributions & Gestion Élèves ---
    socket.on('fetchData', async ({ studentSelected, subjectSelected }) => {
      if (!checkDbReady()) return;
      try {
        const contribution = await contributionsCollection.findOne({ studentSelected, subjectSelected });
        const studentInfo = await studentsCollection.findOne({ studentSelected }, { projection: { studentBirthdate: 1 } });
        if (contribution) {
          socket.emit('previousData', { ...contribution, studentBirthdate: studentInfo?.studentBirthdate });
        } else {
          socket.emit('previousData', { noDataForSubject: true, studentSelected, studentBirthdate: studentInfo?.studentBirthdate });
        }
      } catch (e) { socket.emit('error', { message: 'Erreur lors de la récupération des données.' }); }
    });

    socket.on('fetchStudentInfo', async ({ studentSelected }, callback) => {
      if (!checkDbReady()) return callback?.(null);
      try {
        const studentInfo = await studentsCollection.findOne({ studentSelected }, { projection: { studentBirthdate: 1 } });
        if (typeof callback === 'function') callback(studentInfo);
      } catch { if (typeof callback === 'function') callback(null); }
    });

    socket.on('newContribution', async (data) => {
      if (!checkDbReady()) return;
      try {
        const { contributionId, studentBirthdate, studentPhoto, ...contribData } = data;
        contribData.timestamp = new Date();

        await studentsCollection.updateOne(
          { studentSelected: contribData.studentSelected },
          { $set: { studentBirthdate } },
          { upsert: true }
        );

        const result = await contributionsCollection.findOneAndUpdate(
          { studentSelected: contribData.studentSelected, subjectSelected: contribData.subjectSelected },
          { $set: contribData, $setOnInsert: { createdAt: new Date() } },
          { upsert: true, returnDocument: 'after' }
        );

        if (result.value) socket.emit('contributionReceived', { message: 'Contribution enregistrée/mise à jour', data: result.value._id });
        else socket.emit('error', { message: 'Erreur inattendue lors de la sauvegarde.' });
      } catch (e) {
        if (e.code === 11000) socket.emit('error', { message: 'Clé dupliquée (élève/matière déjà existants?).' });
        else socket.emit('error', { message: 'Erreur serveur lors de la sauvegarde.' });
      }
    });

    socket.on('updateContribution', async (data) => {
      if (!checkDbReady() || !data.contributionId) return socket.emit('error', { message: 'ID manquant ou base non prête.' });
      try {
        const { contributionId, studentBirthdate, studentPhoto, ...contribData } = data;
        contribData.timestamp = new Date();

        await studentsCollection.updateOne(
          { studentSelected: contribData.studentSelected },
          { $set: { studentBirthdate } },
          { upsert: true }
        );

        const result = await contributionsCollection.findOneAndUpdate(
          { _id: new ObjectId(contributionId) },
          { $set: contribData },
          { returnDocument: 'after' }
        );

        if (result.value) socket.emit('contributionUpdated', { message: 'Contribution mise à jour', data: result.value });
        else socket.emit('error', { message: 'Contribution non trouvée.' });
      } catch (e) {
        socket.emit('error', { message: 'Erreur serveur lors de la mise à jour.' });
      }
    });

    socket.on('fetchStudentContributions', async ({ student }) => {
      if (!checkDbReady()) return;
      try {
        const contributions = await contributionsCollection.find({ studentSelected: student }).sort({ subjectSelected: 1 }).toArray();
        socket.emit('studentContributions', contributions);
      } catch {
        socket.emit('error', { message: 'Erreur lors de la récupération des contributions.' });
      }
    });

    socket.on('fetchContribution', async ({ contributionId }, callback) => {
      if (!checkDbReady()) { if (typeof callback === 'function') callback(null); return; }
      try {
        const contribution = await contributionsCollection.findOne({ _id: new ObjectId(contributionId) });
        if (!contribution) { if (typeof callback === 'function') callback(null); return socket.emit('error', { message: 'Contribution non trouvée.' }); }
        const studentInfo = await studentsCollection.findOne({ studentSelected: contribution.studentSelected }, { projection: { studentBirthdate: 1 } });
        const fullData = { ...contribution, studentBirthdate: studentInfo?.studentBirthdate };
        if (typeof callback === 'function') callback(fullData); else socket.emit('contributionData', fullData);
      } catch {
        if (typeof callback === 'function') callback(null);
        socket.emit('error', { message: 'Erreur lors de la récupération des détails.' });
      }
    });

    socket.on('deleteContribution', async ({ contributionId }) => {
      if (!checkDbReady() || !contributionId) return socket.emit('deleteError', { message: 'Requête invalide ou base non prête.' });
      try {
        const result = await contributionsCollection.findOneAndDelete({ _id: new ObjectId(contributionId) });
        if (result.value) socket.emit('contributionDeleted', { message: 'Contribution supprimée', deletedId: contributionId });
        else socket.emit('deleteError', { message: 'Contribution non trouvée.' });
      } catch {
        socket.emit('deleteError', { message: 'Erreur serveur lors de la suppression.' });
      }
    });

    // --- Génération Fichiers ---
    socket.on('generateWordWithSection', async () => {
      socket.emit('wordGenerationError', { message: "Méthode ZIP désactivée. Utilisez la génération individuelle.", student: null });
    });

    socket.on('generateSingleWord', async ({ studentSelected, classSelected, sectionSelected, studentPhotoUrl }) => {
      if (!checkDbReady()) return socket.emit('wordGenerationError', { student: studentSelected, message: 'Base de données non prête' });
      if (!studentSelected || !classSelected || !sectionSelected) {
        return socket.emit('wordGenerationError', { student: studentSelected, message: 'Informations manquantes (élève, classe ou section).' });
      }

      let docFilePath = null;
      let docFileName = null;

      try {
        const studentContributionsOriginal = await contributionsCollection.find({
          studentSelected, sectionSelected
        }).toArray();

        if (studentContributionsOriginal.length === 0) {
          return socket.emit('wordGenerationError', { student: studentSelected, message: `Aucune contribution trouvée pour l'élève ${studentSelected}.` });
        }

        const studentInfo = await studentsCollection.findOne({ studentSelected }, { projection: { studentBirthdate: 1 } });
        const studentBirthdate = studentInfo?.studentBirthdate;

        let imageBuffer = null;
        if (studentPhotoUrl && /^https?:\/\//.test(studentPhotoUrl)) {
          imageBuffer = await fetchImage(studentPhotoUrl);
        }

        const docBuffer = await createWordDocumentBuffer(
          studentSelected, classSelected, studentBirthdate, imageBuffer, studentPhotoUrl, studentContributionsOriginal
        );

        const timestamp = Date.now();
        const safeStudentName = studentSelected.replace(/[\s/\\?%*:|"<>.]/g, '_');
        docFileName = `Livret-${safeStudentName}-${timestamp}.docx`;
        docFilePath = path.join(EXPORT_DIR, docFileName);

        fs.writeFileSync(docFilePath, docBuffer);

        socket.emit('wordGenerationComplete', {
          filePath: `/${docFileName}`,
          fileName: docFileName,
          student: studentSelected
        });

        setTimeout(() => {
          try { if (fs.existsSync(docFilePath)) fs.unlinkSync(docFilePath); } catch {}
        }, 15000);

      } catch (error) {
        let userMessage = `Erreur serveur lors de la génération pour ${studentSelected}: ${error.message || 'Erreur inconnue'}`;
        if (docFilePath && fs.existsSync(docFilePath)) { try { fs.unlinkSync(docFilePath); } catch {} }
        socket.emit('wordGenerationError', { student: studentSelected, message: userMessage });
      }
    });

    socket.on('generateExcelWithSection', async ({ section }) => {
      if (!checkDbReady()) return socket.emit('excelGenerationError', { message: 'Base de données non prête'});
      let excelFilePath = null, excelFileName = null;
      try {
        socket.emit('excelGenerationProgress', 10);
        const contributions = await contributionsCollection.find({ sectionSelected: section }).sort({ studentSelected: 1, subjectSelected: 1 }).toArray();
        if (!contributions || contributions.length === 0) {
          return socket.emit('excelGenerationError', { message: `Aucune contribution trouvée pour la section '${section}'.` });
        }
        socket.emit('excelGenerationProgress', 40);
        const excelData = formatDataForExcel(contributions);
        const worksheet = XLSX.utils.aoa_to_sheet(excelData);
        worksheet['!cols'] = fitToColumn(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Contributions");
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
        socket.emit('excelGenerationProgress', 80);

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        excelFileName = `Contributions-${section}-${timestamp}.xlsx`;
        excelFilePath = path.join(EXPORT_DIR, excelFileName);
        fs.writeFileSync(excelFilePath, excelBuffer);

        socket.emit('excelGenerationProgress', 100);
        socket.emit('excelGenerationComplete', { filePath: `/${excelFileName}`, fileName: excelFileName });

        setTimeout(() => { try { if (fs.existsSync(excelFilePath)) fs.unlinkSync(excelFilePath); } catch {} }, 10000);

      } catch (error) {
        socket.emit('excelGenerationError', { message: error.message || 'Erreur serveur inconnue lors de la génération Excel.' });
        if (excelFilePath && fs.existsSync(excelFilePath)) { try { fs.unlinkSync(excelFilePath); } catch {} }
      }
    });

    socket.on('disconnect', () => {});
  });
}

// --- Helpers Word/Excel ---
function calculateFinalNote(totalLevel) {
  if (totalLevel <= 0 || isNaN(totalLevel)) return "1";
  let note = Math.round(totalLevel / 4);
  if (note < 1) note = 1;
  if (note > 8) note = 8;
  return note.toString();
}

function createCriteriaDataForTemplate(criteriaValues, originalSubjectName) {
  const criteriaNames = criteriaBySubject[originalSubjectName] || {};
  const templateData = {}; let totalLevel = 0;
  ['A', 'B', 'C', 'D'].forEach(key => {
    const critData = criteriaValues?.[key] || {};
    const finalLevelValue = critData.finalLevel ?? "-";
    templateData[`criteriaKey.${key}`] = key;
    templateData[`criteriaName ${key}`] = criteriaNames[key] || `Critère ${key}`;
    templateData[`criteria${key}.sem1`] = critData.sem1 ?? "-";
    templateData[`criteria${key}.sem2`] = critData.sem2 ?? "-";
    templateData[`finalLevel.${key}`] = finalLevelValue;
    if (finalLevelValue !== "-" && !isNaN(finalLevelValue)) totalLevel += parseFloat(finalLevelValue);
  });
  const finalNote = calculateFinalNote(totalLevel);
  templateData['seuil'] = totalLevel.toString();
  templateData['note'] = finalNote;
  return templateData;
}

function prepareWordData(studentName, className, studentBirthdate, originalContributions) {
  if (!originalContributions || originalContributions.length === 0) {
    return { studentSelected: studentName, className: className || "", studentBirthdate: studentBirthdate ? new Date(studentBirthdate).toLocaleDateString('fr-FR') : "", atlSummaryTable: [], contributionsBySubject: [] };
  }
  const peiClasses = ["PEI1", "PEI2", "PEI3", "PEI4", "PEI5"];
  const isPEIClass = peiClasses.includes(className);
  const processedContributions = [];
  const subjectRenameMapPEI = { "Biologie": "Sciences", "Design": "Design", "Langue Anglaise": "Acquisition de langues (Anglais)", "Musique": "ARTs", "ART": "ARTs", "Éducation Physique": "Éducation physique et à la santé", "L.L": "Langues et littérature", "I.S": "Individus et Sociétés" };
  const subjectsToRemovePEI = ["Physique-Chimie"];

  for (const c of originalContributions) {
    let originalSubject = c.subjectSelected;
    let subjectToUse = originalSubject;
    let shouldKeep = true;
    if (isPEIClass) {
      if (subjectsToRemovePEI.includes(originalSubject)) shouldKeep = false;
      else subjectToUse = subjectRenameMapPEI[originalSubject] || originalSubject;
    }
    if (shouldKeep) {
      const processedC = { ...c };
      processedC.subjectSelected = subjectToUse;
      processedC.originalSubjectForCriteria = originalSubject;
      processedContributions.push(processedC);
    }
  }

  function getPriority(subjectName) { return subjectOrderPriority[subjectName] || defaultSubjectPriority; }
  processedContributions.sort((a, b) => {
    const priorityA = getPriority(a.subjectSelected);
    const priorityB = getPriority(b.subjectSelected);
    return priorityA !== priorityB ? priorityA - priorityB : (a.subjectSelected || "").localeCompare(b.subjectSelected || "");
  });

  const documentData = { studentSelected: studentName, className: className || "", studentBirthdate: studentBirthdate ? new Date(studentBirthdate).toLocaleDateString('fr-FR') : "", atlSummaryTable: [], contributionsBySubject: [] };

  for (const c of processedContributions) {
    const comm = c.communicationEvaluation || [];
    documentData.atlSummaryTable.push({
      subject: c.subjectSelected,
      communication: comm[0] || "-", collaboration: comm[1] || "-", autogestion: comm[2] || "-", recherche: comm[3] || "-", reflexion: comm[4] || "-"
    });
  }

  for (const c of processedContributions) {
    const criteriaTemplateData = createCriteriaDataForTemplate(c.criteriaValues, c.originalSubjectForCriteria);
    const subjectContributionData = { subjectSelected: c.subjectSelected, teacherName: c.teacherName || "N/A", teacherComment: c.teacherComment || "-", ...criteriaTemplateData };
    documentData.contributionsBySubject.push(subjectContributionData);
  }
  return documentData;
}

async function fetchImage(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return Buffer.from(await response.arrayBuffer());
  } catch {
    return null;
  }
}

async function createWordDocumentBuffer(studentName, className, studentBirthdate, imageBuffer, studentPhotoUrl, originalContributions) {
  const templateURL = process.env.TEMPLATE_URL;
  if (!templateURL) throw new Error('❌ Missing env TEMPLATE_URL');

  try {
    const response = await fetch(templateURL);
    if (!response.ok) throw new Error(`Fetch template failed: ${response.statusText}`);
    const templateContent = await response.arrayBuffer();
    const zip = new PizZip(templateContent);

    const pixels = 151;
    const imageOpts = {
      centered: false,
      getSize: () => [pixels, pixels],
      getImage: function () { return imageBuffer || null; },
      errorLogger: function (error) { console.error("   ImageModule Error:", error); }
    };
    const imageModule = new ImageModule(imageOpts);

    const doc = new DocxTemplater(zip, { modules: [imageModule], paragraphLoop: true, linebreaks: true, nullGetter: () => "" });
    const documentData = prepareWordData(studentName, className, studentBirthdate, originalContributions);
    const dataToRender = { ...documentData, image: imageBuffer ? 'placeholder_for_module' : "" };

    doc.render(dataToRender);
    return doc.getZip().generate({ type: "nodebuffer", compression: "DEFLATE" });
  } catch (error) {
    throw error;
  }
}

function formatDataForExcel(contributions) {
  const excelData = [];
  excelData.push(["Élève","Classe","Matière","Enseignant","Comp: Comm.","Comp: Collab.","Comp: Autog.","Comp: Rech.","Comp: Refl.","Crit.A S1","Crit.A S2","Crit.A Final","Crit.B S1","Crit.B S2","Crit.B Final","Crit.C S1","Crit.C S2","Crit.C Final","Crit.D S1","Crit.D S2","Crit.D Final","Seuil Total (/32)","Note Finale (/8)","Commentaire Enseignant"]);
  for (const c of contributions) {
    const crit = c.criteriaValues || {};
    const comm = c.communicationEvaluation || [];
    let totalLevel = 0;
    ['A','B','C','D'].forEach(k => { const v = crit[k]?.finalLevel; if (v != null && v !== "" && !isNaN(v)) totalLevel += parseFloat(v); });
    const finalNote = calculateFinalNote(totalLevel);
    excelData.push([c.studentSelected||"",c.classSelected||"",c.subjectSelected||"",c.teacherName||"",comm[0]||"",comm[1]||"",comm[2]||"",comm[3]||"",comm[4]||"",crit.A?.sem1??"",crit.A?.sem2??"",crit.A?.finalLevel??"",crit.B?.sem1??"",crit.B?.sem2??"",crit.B?.finalLevel??"",crit.C?.sem1??"",crit.C?.sem2??"",crit.C?.finalLevel??"",crit.D?.sem1??"",crit.D?.sem2??"",crit.D?.finalLevel??"",totalLevel,finalNote,c.teacherComment||""]);
  }
  return excelData;
}

function fitToColumn(arrayOfArray) {
  if (!arrayOfArray || arrayOfArray.length === 0) return [];
  return arrayOfArray[0].map((_, i) => {
    const colLengths = arrayOfArray.map(row => (row[i] ? String(row[i]).length : 0));
    const maxLen = Math.max(...colLengths);
    return { wch: Math.min(Math.max(maxLen + 2, 8), 50) };
  });
}

// --- Static ---
app.use(express.static(STATIC_DIR));   // sert l’UI
app.use(express.static(EXPORT_DIR));   // sert les fichiers générés

app.get('/', (req, res) => {
  const indexPath = path.join(STATIC_DIR, 'index.html');
  fs.access(indexPath, fs.constants.F_OK, (err) => {
    if (err) return res.status(404).send("Fichier principal de l'application introuvable.");
    res.sendFile(indexPath);
  });
});

// --- Démarrage Serveur ---
connectToMongo().then(() => {
  server.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
    cleanExportDirectory('docx');
    cleanExportDirectory('xlsx');
  });
}).catch(err => {
  console.error("❌ Failed to initialize database connection. Server not started.", err);
  process.exit(1);
});

// --- Arrêt propre ---
process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
