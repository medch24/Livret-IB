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
const fetch = require('node-fetch'); // v2: npm install node-fetch@2
const XLSX = require('xlsx');

// --- Configuration ---
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'teacherContributionsDB';
const contributionsCollectionName = 'contributions';
const studentsCollectionName = 'students'; // Collection pour infos élèves (nom, date naissance SEULEMENT)
const PUBLIC_DIR = path.join(__dirname, '../public');
const VIEWS_DIR = path.join(__dirname, '../public');

// Créer les dossiers
if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
    console.log(`Created public directory at ${PUBLIC_DIR}`);
}

let contributionsCollection;
let studentsCollection;
let isDbConnected = false;

// --- Structure Données (Référence pour les critères) ---
const criteriaBySubject = {"Langues et littérature":{A:"Analyse",B:"Organisation",C:"Production de texte",D:"Utilisation de la langue"},"Mathématiques":{A:"Connaissances et compréhension",B:"Recherche de modèles",C:"Communication",D:"Application des mathématiques"},"Individus et Sociétés":{A:"Connaissances et compréhension",B:"Recherche",C:"Communication",D:"Pensée critique"},"Sciences":{A:"Connaissances et compréhension",B:"Recherche et élaboration",C:"Traitement et évaluation",D:"Réflexion sur les répercussions"},"Biologie":{A:"Connaissances et compréhension",B:"Recherche et élaboration",C:"Traitement et évaluation",D:"Réflexion sur les répercussions"},"Physique-Chimie":{A:"Connaissances et compréhension",B:"Recherche et élaboration",C:"Traitement et évaluation",D:"Réflexion sur les répercussions"},"Langue Anglaise":{A:"Listening",B:"Reading",C:"Speaking",D:"Writing"},"Design":{A:"Recherche et analyse",B:"Développement des idées",C:"Création de la solution",D:"Évaluation"},"Musique":{A:"Connaissances et comprehensions",B:"Développement des competences",C:"Pensée créative",D:"Réaction"},"ART":{A:"Connaissances et comprehensions",B:"Développement des competences",C:"Pensée créative",D:"Réaction"},"Éducation Physique":{A:"Connaissances et compréhension",B:"Planification",C:"Application et exécution",D:"Réflexion et amélioration"},"L.L":{A:"Analyse",B:"Organisation",C:"Production de texte",D:"Utilisation de la langue"},"I.S":{A:"Connaissances et compréhension",B:"Recherche",C:"Communication",D:"Pensée critique"},"E.S":{A:"Connaissances et compréhension",B:"Recherche et élaboration",C:"Traitement et évaluation",D:"Réflexion sur les répercussions"}};

// --- ORDRE SOUHAITÉ DES MATIÈRES POUR LE WORD ---
const subjectOrderPriority = {
    "L.L": 1,"Mathématiques": 2,"I.S": 3,"Biologie": 4,"Sciences": 4,"E.S": 4,"Physique-Chimie": 5,"Design": 6,"Langue Anglaise": 8,"Musique": 10,"ART": 10,"Éducation Physique": 11,
};
const defaultSubjectPriority = 99;

// --- Connexion Base de Données ---
async function connectToMongo() {
    if (!MONGODB_URI) {
        console.error("FATAL ERROR: MONGODB_URI is not defined. Please set it in your .env file.");
        process.exit(1);
    }
    const client = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
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
    } catch (error) {
        console.error('❌ FATAL ERROR: Could not connect to MongoDB:', error);
        isDbConnected = false;
        process.exit(1);
    }

    client.on('close', () => {
        console.warn('MongoDB connection closed!');
        isDbConnected = false;
        contributionsCollection = null;
        studentsCollection = null;
        io.emit('db_disconnected');
    });
}

// Assurer les index
async function ensureIndexes() {
    if (!isDbConnected) return;
    try {
        await contributionsCollection.createIndex( { studentSelected: 1, subjectSelected: 1 }, { unique: true, name: "student_subject_unique" });
        await contributionsCollection.createIndex({ studentSelected: 1 }, { name: "student_lookup" });
        await studentsCollection.createIndex({ studentSelected: 1 }, { unique: true, name: "student_name_unique" });
        console.log('👍 Database indexes ensured.');
    } catch (indexError) {
        if (indexError.code === 85 || indexError.codeName === 'IndexOptionsConflict' || indexError.codeName === 'IndexKeySpecsConflict') {
            console.log('ℹ️ Indexes already exist or options conflict (this is usually OK).');
        } else {
            console.warn('⚠️ Warning creating indexes:', indexError.message);
        }
    }
}

// --- Fonction de Nettoyage ---
function cleanPublicDirectory(extension) {
    console.log(`🧹 Cleaning old *.${extension} files in ${PUBLIC_DIR}...`);
    try {
        const files = fs.readdirSync(PUBLIC_DIR);
        let deletedCount = 0;
        files.forEach(file => {
            if (file.endsWith(`.${extension}`)) {
                const filePath = path.join(PUBLIC_DIR, file);
                console.log(`   Deleting ${filePath}`);
                try {
                    fs.unlinkSync(filePath);
                    deletedCount++;
                } catch (unlinkErr) {
                    console.error(`      Error deleting file ${filePath}:`, unlinkErr);
                }
            }
        });
        console.log(`   Finished cleaning. Deleted ${deletedCount} *.${extension} file(s).`);
    } catch (readErr) {
        console.error(`   Error reading public directory ${PUBLIC_DIR} for cleaning:`, readErr);
    }
}

// --- Logique Socket.IO ---
function initializeSocketEvents() {
    io.on('connection', (socket) => {
        console.log(`🔌 User connected: ${socket.id}`);
        if (isDbConnected) { socket.emit('db_ready'); } else { console.warn(`🟡 DB not ready upon connection for ${socket.id}`); }

        const checkDbReady = () => {
             if (!isDbConnected || !contributionsCollection || !studentsCollection) {
                 console.error(`DB Action requested by ${socket.id} but DB not ready.`);
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
                    socket.emit('previousData', { noDataForSubject: true, studentSelected: studentSelected, studentBirthdate: studentInfo?.studentBirthdate });
                }
            } catch (e) { console.error('Error fetching data:', e); socket.emit('error', { message: 'Erreur lors de la récupération des données.' }); }
        });

        socket.on('fetchStudentInfo', async ({ studentSelected }, callback) => {
            if (!checkDbReady()) return callback?.(null);
            try {
                const studentInfo = await studentsCollection.findOne({ studentSelected }, { projection: { studentBirthdate: 1 } });
                if (typeof callback === 'function') {
                    callback(studentInfo);
                }
            } catch (e) { console.error('Error fetching student info:', e); if (typeof callback === 'function') { callback(null); } }
        });

        socket.on('newContribution', async (data) => {
            if (!checkDbReady()) return;
            console.log('➡️ Received new/update contribution via upsert:', data.studentSelected, data.subjectSelected);
            try {
                const { contributionId, studentBirthdate, studentPhoto, ...contribData } = data;
                contribData.timestamp = new Date();
                console.log(`   Saving contribution with section: ${contribData.sectionSelected}`);

                await studentsCollection.updateOne(
                    { studentSelected: contribData.studentSelected },
                    { $set: { studentBirthdate } },
                    { upsert: true }
                );
                console.log(`   Student birthdate updated/created for ${contribData.studentSelected}`);

                const result = await contributionsCollection.findOneAndUpdate(
                    { studentSelected: contribData.studentSelected, subjectSelected: contribData.subjectSelected },
                    { $set: contribData, $setOnInsert: { createdAt: new Date() } },
                    { upsert: true, returnDocument: 'after' }
                );

                if (result.value) {
                    console.log('   Contribution saved/updated via upsert:', result.value._id);
                    socket.emit('contributionReceived', { message: 'Contribution enregistrée/mise à jour', data: result.value._id });
                } else {
                    console.error('   Upsert failed unexpectedly.');
                    socket.emit('error', { message: 'Erreur inattendue lors de la sauvegarde.' });
                }
            } catch (e) {
                console.error('Error saving contribution (upsert logic):', e);
                if (e.code === 11000) { socket.emit('error', { message: 'Erreur de clé dupliquée inattendue (contribution existe déjà pour cet élève/matière?).' }); }
                else { socket.emit('error', { message: 'Erreur serveur lors de la sauvegarde.' }); }
            }
        });

        socket.on('updateContribution', async (data) => {
             if (!checkDbReady() || !data.contributionId) { return socket.emit('error', { message: 'ID de contribution manquant ou base de données non prête.' }); }
             console.log('🔄 Received explicit update for contribution:', data.contributionId);
             try {
                 const { contributionId, studentBirthdate, studentPhoto, ...contribData } = data;
                 contribData.timestamp = new Date();
                 console.log(`   Updating contribution with section: ${contribData.sectionSelected}`);

                 await studentsCollection.updateOne(
                    { studentSelected: contribData.studentSelected },
                    { $set: { studentBirthdate } },
                    { upsert: true }
                 );
                 console.log(`   Student birthdate updated/created for ${contribData.studentSelected}`);

                 const result = await contributionsCollection.findOneAndUpdate(
                    { _id: new ObjectId(contributionId) },
                    { $set: contribData },
                    { returnDocument: 'after' }
                 );

                 if (result.value) {
                    console.log('   Contribution updated:', result.value._id);
                    socket.emit('contributionUpdated', { message: 'Contribution mise à jour', data: result.value });
                 } else {
                    console.warn(`   Contribution not found for explicit update: ${contributionId}`);
                    socket.emit('error', { message: 'La contribution à mettre à jour n\'a pas été trouvée.' });
                 }
            } catch (e) {
                console.error('Error updating contribution:', e);
                if (e instanceof TypeError && e.message.includes("Argument passed in must be a single String")) { socket.emit('error', { message: 'ID de contribution invalide.' }); }
                else { socket.emit('error', { message: 'Erreur serveur lors de la mise à jour.' }); }
            }
        });

        socket.on('fetchStudentContributions', async ({ student }) => {
            if (!checkDbReady()) return; try { const contributions = await contributionsCollection.find({ studentSelected: student }).sort({ subjectSelected: 1 }).toArray(); socket.emit('studentContributions', contributions); } catch (e) { console.error('Error fetching student contributions:', e); socket.emit('error', { message: 'Erreur lors de la récupération des contributions de l\'élève.' }); }
        });

        socket.on('fetchContribution', async ({ contributionId }, callback) => {
            if (!checkDbReady()) { if (typeof callback === 'function') callback(null); return; }
            try {
                const contribution = await contributionsCollection.findOne({ _id: new ObjectId(contributionId) });
                if (!contribution) { if(typeof callback === 'function') callback(null); return socket.emit('error', { message: 'Contribution non trouvée.' }); }

                const studentInfo = await studentsCollection.findOne({ studentSelected: contribution.studentSelected }, { projection: { studentBirthdate: 1 } });
                const fullData = { ...contribution, studentBirthdate: studentInfo?.studentBirthdate };

                if (typeof callback === 'function') {
                    callback(fullData);
                } else {
                    socket.emit('contributionData', fullData);
                }
            } catch (e) {
                console.error('Error fetching contribution details:', e);
                if (typeof callback === 'function') callback(null);
                if (e instanceof TypeError && e.message.includes("Argument passed in must be a single String")) { socket.emit('error', { message: 'ID de contribution invalide.' }); }
                else { socket.emit('error', { message: 'Erreur lors de la récupération des détails.' }); }
            }
        });

        socket.on('deleteContribution', async ({ contributionId }) => {
            if (!checkDbReady() || !contributionId) { return socket.emit('deleteError', { message: 'Requête invalide ou base de données non prête.' }); } try { const result = await contributionsCollection.findOneAndDelete({ _id: new ObjectId(contributionId) }); if (result.value) { console.log('🗑️ Contribution deleted:', contributionId); socket.emit('contributionDeleted', { message: 'Contribution supprimée', deletedId: contributionId }); } else { console.warn('   Contribution not found for deletion:', contributionId); socket.emit('deleteError', { message: 'Contribution non trouvée pour la suppression.' }); } } catch (e) { console.error('Error deleting contribution:', e); if (e instanceof TypeError && e.message.includes("Argument passed in must be a single String")) { socket.emit('deleteError', { message: 'ID de contribution invalide.' }); } else { socket.emit('deleteError', { message: 'Erreur serveur lors de la suppression.' }); } }
        });

        // --- Génération Fichiers ---

        socket.on('generateWordWithSection', async ({ section }) => {
             console.warn(`⚠️ Received 'generateWordWithSection' event (ZIP generation) from ${socket.id}, but this method is deprecated.`);
             socket.emit('wordGenerationError', { message: "This bulk generation method (ZIP) is no longer active. Please use individual generation.", student: null });
        });

        socket.on('generateSingleWord', async ({ studentSelected, classSelected, sectionSelected, studentPhotoUrl }) => {
            if (!checkDbReady()) return socket.emit('wordGenerationError', { student: studentSelected, message: 'Base de données non prête' });
            if (!studentSelected || !classSelected || !sectionSelected) {
                return socket.emit('wordGenerationError', { student: studentSelected, message: 'Informations manquantes (élève, classe ou section) pour la génération.' });
            }

            console.log(`📄 Word generation starting for SINGLE student: ${studentSelected} in section ${sectionSelected}, class ${classSelected}`);
            console.log(`   Using photo URL provided by client: ${studentPhotoUrl || 'None'}`);

            let docFilePath = null;
            let docFileName = null;

            try {
                console.log(`   Querying contributions for student "${studentSelected}" in section "${sectionSelected}"...`);
                const studentContributionsOriginal = await contributionsCollection.find({
                    studentSelected: studentSelected,
                    sectionSelected: sectionSelected
                }).toArray();

                if (studentContributionsOriginal.length === 0) {
                    console.warn(`   No contributions found for student: ${studentSelected}. Skipping.`);
                    return socket.emit('wordGenerationError', { student: studentSelected, message: `Aucune contribution trouvée pour l'élève ${studentSelected}.` });
                }

                const studentInfo = await studentsCollection.findOne({ studentSelected: studentSelected }, { projection: { studentBirthdate: 1 } });
                const studentBirthdate = studentInfo?.studentBirthdate;
                console.log(`   Fetched birthdate from students collection: ${studentBirthdate}`);

                const effectiveClassName = classSelected;

                let imageBuffer = null;
                if (studentPhotoUrl && studentPhotoUrl.startsWith('http')) {
                    console.log(`   Pre-fetching image for ${studentSelected} from CLIENT PROVIDED URL: ${studentPhotoUrl}`);
                    imageBuffer = await fetchImage(studentPhotoUrl);
                    if (!imageBuffer) { console.warn(`      Failed to pre-fetch/optimize image for ${studentSelected}, proceeding without image.`); }
                    else { console.log(`      Successfully pre-fetched image buffer, size: ${imageBuffer ? imageBuffer.length : 0} bytes.`); }
                } else if (studentPhotoUrl) { console.warn(`      Unsupported photo format/URL provided by client for ${studentSelected}: ${studentPhotoUrl}. Skipping image.`); }
                else { console.log(`      No photo URL provided by client for ${studentSelected}.`); }

                console.log(`   Attempting to create Word buffer for ${studentSelected}...`);
                const docBuffer = await createWordDocumentBuffer(
                    studentSelected,
                    effectiveClassName,
                    studentBirthdate,
                    imageBuffer,
                    studentPhotoUrl,
                    studentContributionsOriginal
                );

                const timestamp = Date.now();
                const safeStudentName = studentSelected.replace(/[\s/\\?%*:|"<>.]/g, '_');
                docFileName = `Livret-${safeStudentName}-${timestamp}.docx`;
                docFilePath = path.join(PUBLIC_DIR, docFileName);

                console.log(`   Writing temporary Word file to: ${docFilePath}`);
                fs.writeFileSync(docFilePath, docBuffer);
                console.log(`   ✅ Word file saved temporarily: ${docFileName}`);

                socket.emit('wordGenerationComplete', {
                    filePath: `/${docFileName}`,
                    fileName: docFileName,
                    student: studentSelected
                });

                const delaySeconds = 15;
                console.log(`   Scheduling deletion of ${docFileName} in ${delaySeconds} seconds...`);
                setTimeout(() => {
                    try {
                        if (fs.existsSync(docFilePath)) {
                            console.log(`   Attempting delayed deletion of temporary file: ${docFilePath}`);
                            fs.unlinkSync(docFilePath);
                            console.log(`   ✅ Temporary file deleted successfully after delay: ${docFileName}`);
                        } else {
                            console.log(`   File ${docFileName} was already deleted or moved.`);
                        }
                    } catch (unlinkErr) {
                        console.error(`   ⚠️ Error during delayed deletion of temporary file ${docFileName}:`, unlinkErr);
                    }
                }, delaySeconds * 1000);

            } catch (error) {
                 let userMessage = `Erreur serveur lors de la génération pour ${studentSelected}: ${error.message || 'Erreur inconnue'}`;
                 if (error.code === 'ENOSPC') {
                     console.error('❌❌❌ DISK FULL ERROR (ENOSPC) ❌❌❌');
                     userMessage = `Erreur: Espace disque insuffisant sur le serveur pour sauvegarder le fichier pour ${studentSelected}. Veuillez contacter l'administrateur.`;
                 } else {
                     console.error(`❌ ERROR generating document for student ${studentSelected}:`, error);
                      if (error.properties && error.properties.errors) {
                         console.error("   Docxtemplater Errors:");
                         error.properties.errors.forEach(err => console.error(`     - [${err.id}] ${err.message}`, err.properties || ''));
                      } else if(error.stack) {
                         console.error("   Stack Trace:", error.stack);
                      }
                 }
                 socket.emit('wordGenerationError', { student: studentSelected, message: userMessage });

                 if (docFilePath && fs.existsSync(docFilePath)) {
                    console.warn(`   Attempting to clean up file due to error: ${docFilePath}`);
                    try { fs.unlinkSync(docFilePath); console.log(`      Cleaned up ${docFileName}.`); }
                    catch (cleanupErr) { console.error(`      Failed to cleanup ${docFileName}:`, cleanupErr); }
                 }
            }
        });

        socket.on('generateExcelWithSection', async ({ section }) => {
             if (!checkDbReady()) return socket.emit('excelGenerationError', { message: 'Base de données non prête'});
             console.log(`📊 Excel generation starting for section: ${section}`);
             let excelFilePath = null;
             let excelFileName = null;
             try {
                 socket.emit('excelGenerationProgress', 5);
                 cleanPublicDirectory('xlsx');
                 const contributions = await contributionsCollection.find({ sectionSelected: section }).sort({ studentSelected: 1, subjectSelected: 1 }).toArray();
                 if (!contributions || contributions.length === 0) { console.warn(`   No contributions found for Excel export for section: ${section}`); return socket.emit('excelGenerationError', { message: `Aucune contribution trouvée pour la section '${section}'.` }); }
                 socket.emit('excelGenerationProgress', 20);
                 const excelData = formatDataForExcel(contributions);
                 socket.emit('excelGenerationProgress', 40);
                 const worksheet = XLSX.utils.aoa_to_sheet(excelData);
                 const colWidths = fitToColumn(excelData); worksheet['!cols'] = colWidths;
                 socket.emit('excelGenerationProgress', 60);
                 const workbook = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(workbook, worksheet, "Contributions");
                 const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
                 socket.emit('excelGenerationProgress', 80);
                 const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                 excelFileName = `Contributions-${section}-${timestamp}.xlsx`;
                 excelFilePath = path.join(PUBLIC_DIR, excelFileName);
                 console.log(`   Writing final XLSX to: ${excelFilePath}`);
                 fs.writeFileSync(excelFilePath, excelBuffer);
                 console.log(`   Excel file saved: ${excelFilePath}`);
                 socket.emit('excelGenerationProgress', 100);
                 socket.emit('excelGenerationComplete', { filePath: `/${excelFileName}`, fileName: excelFileName });

                 const delaySecondsExcel = 10;
                 console.log(`   Scheduling deletion of ${excelFileName} in ${delaySecondsExcel} seconds...`);
                 setTimeout(() => {
                    try {
                         if (fs.existsSync(excelFilePath)) {
                            console.log(`   Attempting delayed deletion of Excel file: ${excelFilePath}`);
                            fs.unlinkSync(excelFilePath);
                            console.log(`   ✅ Excel file deleted successfully after delay: ${excelFileName}`);
                         } else {
                             console.log(`   Excel file ${excelFileName} was already deleted or moved.`);
                         }
                    } catch (unlinkErr) {
                        console.error(`   ⚠️ Error during delayed deletion of Excel file ${excelFileName}:`, unlinkErr);
                    }
                 }, delaySecondsExcel * 1000);

             } catch (error) {
                 let userMessage = error.message || 'Erreur serveur inconnue lors de la génération Excel.';
                  if (error.code === 'ENOSPC') {
                     console.error('❌❌❌ DISK FULL ERROR (ENOSPC) during Excel generation ❌❌❌');
                      userMessage = 'Erreur : Espace disque insuffisant sur le serveur pour sauvegarder le fichier Excel. Veuillez contacter l\'administrateur.';
                  } else {
                      console.error('Erreur pendant la Génération Excel:', error);
                  }
                  socket.emit('excelGenerationError', { message: userMessage });

                  if (excelFilePath && fs.existsSync(excelFilePath)) {
                      console.warn(`   Attempting to clean up Excel file due to error: ${excelFilePath}`);
                      try { fs.unlinkSync(excelFilePath); console.log(`      Cleaned up Excel file: ${excelFileName}.`); }
                      catch (cleanupErr) { console.error(`      Failed to cleanup Excel file ${excelFileName}:`, cleanupErr); }
                  }
             }
        });

        socket.on('disconnect', () => { console.log(`🔌 User disconnected: ${socket.id}`); });
    });
}

// --- Fonctions Helpers Génération Fichiers ---

function calculateFinalNote(totalLevel) {
    if (totalLevel <= 0 || isNaN(totalLevel)) return "1";
    let note = Math.round(totalLevel / 4); if (note < 1) note = 1; if (note > 8) note = 8; return note.toString();
}

function createCriteriaDataForTemplate(criteriaValues, originalSubjectName) {
    const criteriaNames = criteriaBySubject[originalSubjectName] || {}; const templateData = {}; let totalLevel = 0;
    ['A', 'B', 'C', 'D'].forEach(key => { const critData = criteriaValues?.[key] || {}; const finalLevelValue = critData.finalLevel ?? "-"; templateData[`criteriaKey.${key}`] = key; templateData[`criteriaName ${key}`] = criteriaNames[key] || `Critère ${key}`; templateData[`criteria${key}.sem1`] = critData.sem1 ?? "-"; templateData[`criteria${key}.sem2`] = critData.sem2 ?? "-"; templateData[`finalLevel.${key}`] = finalLevelValue; if (finalLevelValue !== "-" && !isNaN(finalLevelValue)) { totalLevel += parseFloat(finalLevelValue); } });
    const finalNote = calculateFinalNote(totalLevel); templateData['seuil'] = totalLevel.toString(); templateData['note'] = finalNote; return templateData;
}

function prepareWordData(studentName, className, studentBirthdate, originalContributions) {
    if (!originalContributions || originalContributions.length === 0) { console.warn(`prepareWordData called with no contributions for ${studentName}`); return { studentSelected: studentName, className: className || "", studentBirthdate: studentBirthdate ? new Date(studentBirthdate).toLocaleDateString('fr-FR') : "", atlSummaryTable: [], contributionsBySubject: [] }; }
    const peiClasses = ["PEI1", "PEI2", "PEI3", "PEI4", "PEI5"]; const isPEIClass = peiClasses.includes(className); const processedContributions = [];
    const subjectRenameMapPEI = { "Biologie": "Sciences", "Design": "Design", "Langue Anglaise": "Acquisition de langues (Anglais)", "Musique": "ARTs", "ART": "ARTs", "Éducation Physique": "Éducation physique et à la santé", "L.L": "Langues et littérature", "I.S": "Individus et Sociétés" }; const subjectsToRemovePEI = ["Physique-Chimie"];
    for (const c of originalContributions) { let originalSubject = c.subjectSelected; let subjectToUse = originalSubject; let shouldKeep = true; if (isPEIClass) { if (subjectsToRemovePEI.includes(originalSubject)) { shouldKeep = false; } else { subjectToUse = subjectRenameMapPEI[originalSubject] || originalSubject; } } if (shouldKeep) { const processedC = { ...c }; processedC.subjectSelected = subjectToUse; processedC.originalSubjectForCriteria = originalSubject; processedContributions.push(processedC); } }
    function getPriority(subjectName) { return subjectOrderPriority[subjectName] || defaultSubjectPriority; }
    processedContributions.sort((a, b) => { const priorityA = getPriority(a.subjectSelected); const priorityB = getPriority(b.subjectSelected); return priorityA !== priorityB ? priorityA - priorityB : (a.subjectSelected || "").localeCompare(b.subjectSelected || ""); });
    const documentData = { studentSelected: studentName, className: className || "", studentBirthdate: studentBirthdate ? new Date(studentBirthdate).toLocaleDateString('fr-FR') : "", atlSummaryTable: [], contributionsBySubject: [] };
    for (const c of processedContributions) { const comm = c.communicationEvaluation || []; documentData.atlSummaryTable.push({ subject: c.subjectSelected, communication: comm[0] || "-", collaboration: comm[1] || "-", autogestion: comm[2] || "-", recherche: comm[3] || "-", reflexion: comm[4] || "-" }); }
    for (const c of processedContributions) { const criteriaTemplateData = createCriteriaDataForTemplate(c.criteriaValues, c.originalSubjectForCriteria); const subjectContributionData = { subjectSelected: c.subjectSelected, teacherName: c.teacherName || "N/A", teacherComment: c.teacherComment || "-", ...criteriaTemplateData }; documentData.contributionsBySubject.push(subjectContributionData); }
    return documentData;
}

async function fetchImage(url) {
    try { console.log(`   Attempting to fetch image URL: ${url}`); const response = await fetch(url); if (!response.ok) { console.error(`   Failed to fetch image ${url}. Status: ${response.status} ${response.statusText}`); return null; } const buffer = Buffer.from(await response.arrayBuffer()); console.log(`   Successfully fetched image from ${url}, size: ${buffer.length} bytes.`); return buffer; } catch (error) { console.error(`   Caught error during fetchImage for ${url}:`, error.message); return null; }
}

async function createWordDocumentBuffer(studentName, className, studentBirthdate, imageBuffer, studentPhotoUrl, originalContributions) {
    const templateURL = 'https://cdn.glitch.global/afba7f9d-6291-40ea-92bb-fe72daac96fd/Livret%20scolaire%20%20Modele%20400.docx?v=1743890021973';
    try { console.log(`   Fetching Word template from: ${templateURL}`); const response = await fetch(templateURL); if (!response.ok) throw new Error(`Fetch template failed: ${response.statusText}`); const templateContent = await response.arrayBuffer(); const zip = new PizZip(templateContent);
        const pixels = 151; const imageOpts = { centered: false, getSize: () => [pixels, pixels], getImage: function(tagValue, tagName) { if (!imageBuffer) { console.warn(`   ImageModule: No image buffer available for tag ${tagName}, returning null.`); return null; } return imageBuffer; }, errorLogger: function(error) { console.error("   ImageModule Error:", error); } };
        if (typeof imageOpts.getImage !== 'function') { throw new Error("Internal Error: imageOpts.getImage is not a function"); } const imageModule = new ImageModule(imageOpts);
        const doc = new DocxTemplater(zip, { modules: [imageModule], paragraphLoop: true, linebreaks: true, nullGetter: () => "" });
        const documentData = prepareWordData(studentName, className, studentBirthdate, originalContributions);
        const dataToRender = { ...documentData, image: imageBuffer ? 'placeholder_for_module' : "" };
        console.log(`   Rendering Word document for ${studentName}...`); try { doc.render(dataToRender); console.log(`   Rendering successful for ${studentName}.`); } catch (renderError) { console.error(`   Error during rendering for ${studentName}:`, renderError.message); if (renderError.properties?.errors) { console.error("   Docxtemplater Errors details:"); renderError.properties.errors.forEach(err => console.error(`     - [${err.id}] ${err.message}`, err.properties || '')); } else { console.error("   Render Error Stack:", renderError.stack); } throw renderError; }
        console.log(`   Generating final buffer for ${studentName}...`); const buffer = doc.getZip().generate({ type: "nodebuffer", compression: "DEFLATE" }); return buffer;
    } catch (error) { console.error(`   FATAL error during Word buffer creation for ${studentName}: ${error.message}`); if (error.stack) { console.error("   Buffer Creation Stack:", error.stack); } throw error; }
}

function formatDataForExcel(contributions) {
    const excelData = []; excelData.push([ "Élève", "Classe", "Matière", "Enseignant", "Comp: Comm.", "Comp: Collab.", "Comp: Autog.", "Comp: Rech.", "Comp: Refl.", "Crit.A S1", "Crit.A S2", "Crit.A Final", "Crit.B S1", "Crit.B S2", "Crit.B Final", "Crit.C S1", "Crit.C S2", "Crit.C Final", "Crit.D S1", "Crit.D S2", "Crit.D Final", "Seuil Total (/32)", "Note Finale (/8)", "Commentaire Enseignant" ]);
    for (const c of contributions) { const crit = c.criteriaValues || {}; const comm = c.communicationEvaluation || []; let totalLevel = 0; ['A', 'B', 'C', 'D'].forEach(key => { const finalLevel = crit[key]?.finalLevel; if (finalLevel != null && finalLevel !== "" && !isNaN(finalLevel)) { totalLevel += parseFloat(finalLevel); } }); const finalNote = calculateFinalNote(totalLevel); excelData.push([ c.studentSelected || "", c.classSelected || "", c.subjectSelected || "", c.teacherName || "", comm[0] || "", comm[1] || "", comm[2] || "", comm[3] || "", comm[4] || "", crit.A?.sem1 ?? "", crit.A?.sem2 ?? "", crit.A?.finalLevel ?? "", crit.B?.sem1 ?? "", crit.B?.sem2 ?? "", crit.B?.finalLevel ?? "", crit.C?.sem1 ?? "", crit.C?.sem2 ?? "", crit.C?.finalLevel ?? "", crit.D?.sem1 ?? "", crit.D?.sem2 ?? "", crit.D?.finalLevel ?? "", totalLevel, finalNote, c.teacherComment || "" ]); } return excelData;
}

function fitToColumn(arrayOfArray) {
    if (!arrayOfArray || arrayOfArray.length === 0) return []; return arrayOfArray[0].map((_, i) => { const colLengths = arrayOfArray.map(row => (row[i] ? String(row[i]).length : 0)); const maxLen = Math.max(...colLengths); return { wch: Math.min(Math.max(maxLen + 2, 8), 50) }; });
}

// --- Serveur Express ---
app.use(express.static(PUBLIC_DIR));

app.get('/', (req, res) => {
    const indexPath = path.join(PUBLIC_DIR, 'index.html');
    fs.access(indexPath, fs.constants.F_OK, (err) => {
        if (err) {
            console.error(`Error: ${indexPath} not found!`);
            res.status(404).send("Fichier principal de l'application introuvable.");
        } else {
            res.sendFile(indexPath);
        }
    });
});

// --- Démarrage Serveur ---
connectToMongo().then(() => {
    server.listen(PORT, () => {
        console.log(`✅ Server is running on port ${PORT}`);
        console.log(`   Visit http://localhost:${PORT} in your browser.`);
        console.log("Performing initial cleanup of export directories...");
        cleanPublicDirectory('docx');
        cleanPublicDirectory('xlsx');
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