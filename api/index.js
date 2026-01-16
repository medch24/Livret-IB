// --- Dépendances ---
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

// Configuration dotenv - TOUJOURS charger pour compatibilité locale et Vercel
try {
    require('dotenv').config({ path: ['.env.local', '.env.production', '.env'] });
} catch (err) {
    console.log('ℹ️ No dotenv file found (using system environment variables)');
}

const fs = require('fs');
const path = require('path');
const PizZip = require("pizzip");
const DocxTemplater = require("docxtemplater");
const ImageModule = require('docxtemplater-image-module-free');
const fetch = require('node-fetch');
const archiver = require('archiver');
const sharp = require('sharp');
// const XLSX = require('xlsx'); // Temporairement désactivé pour éviter les vulnérabilités

// --- Configuration ---
const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging middleware pour débugger
app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
});

// Servir les fichiers statiques AVANT les routes API
app.use(express.static(path.join(__dirname, '../public')));

// Security: hide Express signature
app.disable('x-powered-by');

// Vérification et configuration des variables d'environnement
console.log('🔧 ===== ENVIRONMENT DIAGNOSTICS =====');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('VERCEL:', process.env.VERCEL ? 'true' : 'false');
console.log('VERCEL_ENV:', process.env.VERCEL_ENV || 'N/A');
console.log('MONGODB_URI defined:', !!process.env.MONGODB_URI);
console.log('MONGODB_URI length:', process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0);
console.log('DB_NAME:', process.env.DB_NAME || 'teacherContributionsDB');
console.log('TEMPLATE_URL defined:', !!process.env.TEMPLATE_URL);
console.log('TEMPLATE_URL:', process.env.TEMPLATE_URL ? process.env.TEMPLATE_URL.substring(0, 50) + '...' : 'Not set');
console.log('TEMPLATE_URL_DP defined:', !!process.env.TEMPLATE_URL_DP);
console.log('TEMPLATE_URL_DP:', process.env.TEMPLATE_URL_DP ? process.env.TEMPLATE_URL_DP.substring(0, 50) + '...' : 'Not set');
console.log('All env vars containing MONGO or DB:', 
    Object.keys(process.env).filter(k => k.toLowerCase().includes('mongo') || k.toLowerCase().includes('db_'))
);
console.log('=====================================');

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'teacherContributionsDB';

// Validation critique des variables d'environnement
if (!MONGODB_URI) {
    console.error('❌ CRITICAL: MONGODB_URI environment variable is MISSING!');
    console.error('📋 URGENT: Configure environment variables in Vercel Dashboard:');
    console.error('   1. Go to: https://vercel.com/dashboard');
    console.error('   2. Select your project: livret-ib2026');
    console.error('   3. Navigate to: Settings > Environment Variables');
    console.error('   4. Add variable: MONGODB_URI');
    console.error('   5. Add variable: DB_NAME = teacherContributionsDB');
    console.error('   6. Check all environments: Production, Preview, Development');
    console.error('   7. Save and Redeploy');
    console.error('');
    console.error('Current environment variables available:', Object.keys(process.env).slice(0, 20).join(', '));
} else {
    console.log('✅ MONGODB_URI is defined and available');
}
const contributionsCollectionName = 'contributions';
const studentsCollectionName = 'students';
const PUBLIC_DIR = path.join(__dirname, '../public');

let contributionsCollection;
let studentsCollection;
let isDbConnected = false;

// --- Structure Données (Référence pour les critères) ---
const criteriaBySubject = {
    // Matières PEI (PEI1-PEI5) et DP (DP1-DP2) - CRITÈRES IDENTIQUES A-D
    "Mathématiques":{A:"Connaissances et compréhension",B:"Recherche de modèles",C:"Communication",D:"Application des mathématiques"},
    "Individus et sociétés":{A:"Connaissances et compréhension",B:"Recherche",C:"Communication",D:"Pensée critique"},
    "Langue et littérature":{A:"Analyse",B:"Organisation",C:"Production de texte",D:"Utilisation de la langue"},
    "Design":{A:"Recherche et analyse",B:"Développement des idées",C:"Création de la solution",D:"Évaluation"},
    "Sciences":{A:"Connaissances et compréhension",B:"Recherche et élaboration",C:"Traitement et évaluation",D:"Réflexion sur les répercussions"},
    "Art visuel":{A:"Connaissances et compréhension",B:"Développement des compétences",C:"Pensée créative",D:"Réaction"},
    "Éducation physique et sportive":{A:"Connaissances et compréhension",B:"Planification",C:"Application et exécution",D:"Réflexion et amélioration"},
    "Acquisition de langue (Anglais)":{A:"Listening",B:"Reading",C:"Speaking",D:"Writing"},
    "Acquisition de langue (اللغة العربية)":{A:"الاستماع",B:"القراءة",C:"التحدث",D:"الكتابة"},
    // Anciennes matières pour rétrocompatibilité
    "Acquisition de langues (Anglais)":{A:"Listening",B:"Reading",C:"Speaking",D:"Writing"},
    "Langue et littérature (Français)":{A:"Analyse",B:"Organisation",C:"Production de texte",D:"Utilisation de la langue"},
    "Langues et littérature":{A:"Analyse",B:"Organisation",C:"Production de texte",D:"Utilisation de la langue"},
    "Biologie":{A:"Connaissances et compréhension",B:"Recherche et élaboration",C:"Traitement et évaluation",D:"Réflexion sur les répercussions"},
    "Physique-Chimie":{A:"Connaissances et compréhension",B:"Recherche et élaboration",C:"Traitement et évaluation",D:"Réflexion sur les répercussions"},
    "Langue Anglaise":{A:"Listening",B:"Reading",C:"Speaking",D:"Writing"},
    "Musique":{A:"Connaissances et comprehensions",B:"Développement des competences",C:"Pensée créative",D:"Réaction"},
    "Arts":{A:"Connaissances et comprehensions",B:"Développement des competences",C:"Pensée créative",D:"Réaction"},
    "ART":{A:"Connaissances et comprehensions",B:"Développement des competences",C:"Pensée créative",D:"Réaction"},
    "Éducation Physique":{A:"Connaissances et compréhension",B:"Planification",C:"Application et exécution",D:"Réflexion et amélioration"},
    "Éducation physique et à la santé":{A:"Connaissances et compréhension",B:"Planification",C:"Application et exécution",D:"Réflexion et amélioration"},
    "L.L":{A:"Analyse",B:"Organisation",C:"Production de texte",D:"Utilisation de la langue"},
    "I.S":{A:"Connaissances et compréhension",B:"Recherche",C:"Communication",D:"Pensée critique"},
    "E.S":{A:"Connaissances et compréhension",B:"Recherche et élaboration",C:"Traitement et évaluation",D:"Réflexion sur les répercussions"}
};

// --- Connexion Base de Données ---
let mongoClient = null;
let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 3;
const CONNECTION_RETRY_DELAY = 2000; // 2 secondes

async function connectToMongo(retryCount = 0) {
    if (!MONGODB_URI) {
        console.error("❌ FATAL ERROR: MONGODB_URI is not defined!");
        console.error("📋 Without MONGODB_URI, the application cannot function.");
        console.error("📋 Please set MONGODB_URI in Vercel Environment Variables.");
        return false;
    }
    
    connectionAttempts++;
    console.log(`🔄 MongoDB connection attempt ${connectionAttempts}/${MAX_CONNECTION_ATTEMPTS}...`);
    
    try {
        // Configuration optimale pour MongoDB Atlas
        const clientOptions = {
            serverSelectionTimeoutMS: 10000, // 10 secondes timeout
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
            minPoolSize: 2,
            retryWrites: true,
            retryReads: true,
            w: 'majority'
        };
        
        mongoClient = new MongoClient(MONGODB_URI, clientOptions);
        
        console.log('🔌 Connecting to MongoDB Atlas...');
        await mongoClient.connect();
        
        console.log('✅ Successfully connected to MongoDB!');
        console.log(`📊 Database: ${dbName}`);
        
        const db = mongoClient.db(dbName);
        contributionsCollection = db.collection(contributionsCollectionName);
        studentsCollection = db.collection(studentsCollectionName);
        isDbConnected = true;
        
        // Test de ping pour vérifier la connexion
        await db.admin().ping();
        console.log('✅ MongoDB ping successful');
        
        // Créer les index
        try {
            console.log('🔧 Setting up database indexes...');
            const idx = await contributionsCollection.indexes();
            const legacy = idx.find(i => i.unique && i.key && i.key.studentSelected === 1 && i.key.subjectSelected === 1 && Object.keys(i.key).length === 2);
            if (legacy) {
                try {
                    await contributionsCollection.dropIndex(legacy.name);
                    console.log(`ℹ️ Dropped legacy unique index: ${legacy.name}`);
                } catch (dropErr) {
                    console.warn('⚠️ Could not drop legacy index (will continue):', dropErr.message);
                }
            }
            await contributionsCollection.createIndex({ studentSelected: 1, subjectSelected: 1, classSelected: 1, sectionSelected: 1 }, { unique: true, name: 'uniq_student_subject_class_section' });
            await studentsCollection.createIndex({ studentSelected: 1 }, { unique: true });
            console.log('✅ Database indexes created successfully');
        } catch (indexError) {
            console.log('ℹ️ Indexes already exist (this is OK)');
        }
        
        connectionAttempts = 0; // Reset counter on success
        return true;
        
    } catch (error) {
        console.error('❌ MongoDB connection failed!');
        console.error('Error type:', error.name);
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        
        if (error.message.includes('authentication')) {
            console.error('🔐 Authentication failed - check username and password in MONGODB_URI');
        } else if (error.message.includes('network') || error.message.includes('ENOTFOUND')) {
            console.error('🌐 Network error - check internet connection and MongoDB Atlas network access');
        } else if (error.message.includes('timeout')) {
            console.error('⏱️ Connection timeout - MongoDB Atlas might be unreachable');
        }
        
        isDbConnected = false;
        
        // Retry logic
        if (retryCount < MAX_CONNECTION_ATTEMPTS - 1) {
            console.log(`⏳ Retrying in ${CONNECTION_RETRY_DELAY/1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, CONNECTION_RETRY_DELAY));
            return connectToMongo(retryCount + 1);
        } else {
            console.error(`❌ Failed to connect to MongoDB after ${MAX_CONNECTION_ATTEMPTS} attempts`);
            console.error('📋 Please verify:');
            console.error('   1. MONGODB_URI is correctly set in Vercel Environment Variables');
            console.error('   2. MongoDB Atlas cluster is running');
            console.error('   3. Network Access allows connections from 0.0.0.0/0');
            console.error('   4. Database user credentials are correct');
            return false;
        }
    }
}

// Reconnection handler for connection drops
function setupMongoReconnection() {
    if (mongoClient) {
        mongoClient.on('close', () => {
            console.log('⚠️ MongoDB connection closed');
            isDbConnected = false;
            // Attempt reconnection
            setTimeout(() => {
                console.log('🔄 Attempting to reconnect to MongoDB...');
                connectToMongo();
            }, 5000);
        });
        
        mongoClient.on('error', (error) => {
            console.error('❌ MongoDB client error:', error.message);
            isDbConnected = false;
        });
    }
}

// --- Helper Functions ---
function calculateFinalNote(totalLevel, maxNote = 8) {
    if (totalLevel <= 0 || isNaN(totalLevel)) return "1";
    let note = Math.round(totalLevel / 4);
    if (note < 1) note = 1;
    if (note > maxNote) note = maxNote;
    return note.toString();
}

async function fetchImage(url) {
    try {
        // Convertir les URLs Google Drive au format téléchargeable
        let downloadUrl = url;
        if (url.includes('googleusercontent.com/d/')) {
            // Format: https://lh3.googleusercontent.com/d/FILE_ID
            // On garde l'URL telle quelle, mais on force le téléchargement avec des headers
            downloadUrl = url;
            console.log(`📷 Google Drive image détectée`);
        } else if (url.includes('drive.google.com/file/d/')) {
            // Format alternatif: https://drive.google.com/file/d/FILE_ID/view
            const fileId = url.match(/\/d\/([^\/]+)/)?.[1];
            if (fileId) {
                downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
                console.log(`📷 URL Google Drive convertie pour téléchargement`);
            }
        }
        
        console.log(`📷 Fetching image: ${downloadUrl.substring(0, 60)}...`);
        
        // Timeout de 10 secondes pour les images Google Drive (peuvent être lentes)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        // Ajouter des headers pour forcer le téléchargement
        const response = await fetch(downloadUrl, { 
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
            },
            redirect: 'follow'
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            console.warn(`⚠️ Image fetch failed: ${response.status} ${response.statusText}`);
            return null;
        }
        
        const originalBuffer = Buffer.from(await response.arrayBuffer());
        console.log(`✅ Image fetched: ${originalBuffer.length} bytes`);
        
        // Vérifier que c'est bien une image (magic bytes)
        const isPNG = originalBuffer[0] === 0x89 && originalBuffer[1] === 0x50;
        const isJPG = originalBuffer[0] === 0xFF && originalBuffer[1] === 0xD8;
        const isWebP = originalBuffer[8] === 0x57 && originalBuffer[9] === 0x45 && originalBuffer[10] === 0x42 && originalBuffer[11] === 0x50;
        
        if (!isPNG && !isJPG && !isWebP) {
            console.warn(`⚠️ Format d'image invalide (premiers bytes: ${originalBuffer.slice(0, 4).toString('hex')})`);
            return null;
        }
        
        console.log(`📐 Redimensionnement et compression de l'image...`);
        
        // SOLUTION DÉFINITIVE: Redimensionner et compresser l'image avec Sharp
        // Taille: 60x60 pixels en JPEG qualité 75% pour un fichier plus léger
        const resizedBuffer = await sharp(originalBuffer)
            .resize(60, 60, {
                fit: 'cover',
                position: 'center'
            })
            .jpeg({ 
                quality: 75,
                mozjpeg: true  // Utiliser mozjpeg pour une meilleure compression
            })
            .toBuffer();
        
        console.log(`✅ Image redimensionnée: ${originalBuffer.length} → ${resizedBuffer.length} bytes (60x60px, JPEG 75%)`);
        
        // Vérifier la taille finale (sécurité supplémentaire)
        const MAX_IMAGE_SIZE = 30 * 1024; // 30KB max après compression
        if (resizedBuffer.length > MAX_IMAGE_SIZE) {
            console.log(`⚠️ Image encore trop grande (${resizedBuffer.length} bytes), compression supplémentaire...`);
            // Réduire encore la qualité si trop grande
            const finalBuffer = await sharp(originalBuffer)
                .resize(60, 60, { fit: 'cover', position: 'center' })
                .jpeg({ 
                    quality: 60,
                    mozjpeg: true
                })
                .toBuffer();
            
            console.log(`✅ Image re-compressée: ${resizedBuffer.length} → ${finalBuffer.length} bytes (JPEG 60%)`);
            return finalBuffer;
        }
        
        return resizedBuffer;
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error(`⏱️ Image fetch timeout après 5s`);
        } else {
            console.error(`❌ Error fetching/processing image:`, error.message);
        }
        return null;
    }
}

// Table de mapping: Prénom (DB) → Nom complet (affichage/Word)
const studentNameMapping = {
    // PEI 1
    'Faysal': 'Faysal Achar',
    'Bilal': 'Bilal Molina',
    'Jad': 'Jad Mahayni',
    'Manaf': 'Manaf Kotbi',
    // PEI 2
    'Ahmed': 'Ahmed Bouaziz',
    'Ali': 'Ali Kutbi',
    'Eyad': 'Eyad Hassan',
    'Yasser': 'Yasser Younes',
    // PEI 3
    'Adam': 'Adam Kaaki',
    'Ahmad': 'Ahmad Mahayni',
    'Seifeddine': 'Seifeddine Ayadi',
    'Wajih': 'Wajih Sabadine',
    // PEI 4
    'Abdulrahman': 'Abdulrahman Bouaziz',
    'Samir': 'Samir Kaaki',
    'Youssef': 'Youssef Baakak',
    // DP 2
    'Habib': 'Habib Lteif',
    'Salah': 'Salah Boumalouga',
    // Noms déjà complets (ne pas modifier)
    'Mohamed Chalak': 'Mohamed Chalak',
    'Mohamed Younes': 'Mohamed Younes',
    'Mohamed Amine Sgheir': 'Mohamed Amine Sgheir',
    'Mohamed Amine': 'Mohamed Amine Sgheir',
    'Mohamed': 'Mohamed Chalak' // Par défaut si ambiguïté
};

function getFullStudentName(firstName) {
    return studentNameMapping[firstName] || firstName;
}

function createCriteriaDataForTemplate(criteriaValues, originalSubjectName, className) {
    const criteriaNames = criteriaBySubject[originalSubjectName] || {};
    const templateData = {};
    let totalLevel = 0;
    
    // Utiliser A-D pour toutes les classes (PEI et DP)
    const criteriaKeys = ['A', 'B', 'C', 'D'];
    const maxNote = (className === 'DP1' || className === 'DP2') ? 7 : 8;
    
    criteriaKeys.forEach(key => {
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
    
    const finalNote = calculateFinalNote(totalLevel, maxNote);
    templateData['seuil'] = totalLevel.toString();
    templateData['note'] = finalNote;
    return templateData;
}

// Fonction pour détecter la catégorie d'une matière (flexible avec variations de noms)
function getSubjectCategory(subjectName) {
    if (!subjectName) return 999;
    
    const name = subjectName.toLowerCase();
    
    // 1. Langue et littérature (LL, Français, etc.)
    if (name.includes('langue et litt') || name.includes('ll') || 
        (name.includes('langue') && name.includes('français'))) {
        return 1;
    }
    
    // 2. Acquisition de langue - ARABE (avec caractères arabes)
    if (name.includes('arabe') || name.includes('العربية') || name.includes('اللغة')) {
        return 2;
    }
    
    // 3. Acquisition de langue - ANGLAIS
    if (name.includes('anglais') || name.includes('english')) {
        return 3;
    }
    
    // 4. Individus et sociétés
    if (name.includes('individu') || name.includes('société')) {
        return 4;
    }
    
    // 5. Sciences
    if (name.includes('science')) {
        return 5;
    }
    
    // 6. Mathématiques
    if (name.includes('math')) {
        return 6;
    }
    
    // 7. Arts (Art visuel, Arts plastiques, etc.)
    if (name.includes('art')) {
        return 7;
    }
    
    // 8. Éducation physique (sportive, santé, etc.)
    if (name.includes('éducation physique') || name.includes('education physique') || 
        name.includes('eps') || (name.includes('physique') && name.includes('sport'))) {
        return 8;
    }
    
    // 9. Design
    if (name.includes('design')) {
        return 9;
    }
    
    // Si aucune catégorie trouvée, mettre à la fin
    return 999;
}

// Fonction pour trier les matières dans l'ordre pédagogique requis
function sortSubjectsByOrder(contributions) {
    return contributions.sort((a, b) => {
        const orderA = getSubjectCategory(a.subjectSelected);
        const orderB = getSubjectCategory(b.subjectSelected);
        
        // Si même catégorie, trier alphabétiquement
        if (orderA === orderB) {
            return (a.subjectSelected || '').localeCompare(b.subjectSelected || '');
        }
        
        return orderA - orderB;
    });
}

function prepareWordData(studentName, className, studentBirthdate, originalContributions) {
    // Utiliser le nom complet pour le document Word
    const fullName = getFullStudentName(studentName);
    
    // CORRECTION: Si pas de contributions, créer des tableaux avec données vides
    // pour éviter l'erreur DocxTemplater sur boucles vides dans tableaux Word
    if (!originalContributions || originalContributions.length === 0) {
        return {
            studentSelected: fullName,
            className: className || "",
            studentBirthdate: studentBirthdate ? new Date(studentBirthdate).toLocaleDateString('fr-FR') : "",
            // Au lieu de tableaux vides, créer une entrée avec des tirets
            atlSummaryTable: [{
                subject: "-",
                communication: "-",
                collaboration: "-",
                autogestion: "-",
                recherche: "-",
                reflexion: "-"
            }],
            contributionsBySubject: [{
                subjectSelected: "-",
                teacherName: "-",
                teacherComment: "-",
                "criteriaKey.A": "A",
                "criteriaName A": "-",
                "criteriaA.sem1": "-",
                "criteriaA.sem2": "-",
                "finalLevel.A": "-",
                "criteriaKey.B": "B",
                "criteriaName B": "-",
                "criteriaB.sem1": "-",
                "criteriaB.sem2": "-",
                "finalLevel.B": "-",
                "criteriaKey.C": "C",
                "criteriaName C": "-",
                "criteriaC.sem1": "-",
                "criteriaC.sem2": "-",
                "finalLevel.C": "-",
                "criteriaKey.D": "D",
                "criteriaName D": "-",
                "criteriaD.sem1": "-",
                "criteriaD.sem2": "-",
                "finalLevel.D": "-",
                "seuil": "-",
                "note": "-"
            }]
        };
    }
    
    const documentData = {
        studentSelected: fullName,
        className: className || "",
        studentBirthdate: studentBirthdate ? new Date(studentBirthdate).toLocaleDateString('fr-FR') : "",
        atlSummaryTable: [],
        contributionsBySubject: []
    };
    
    // Trier les contributions selon l'ordre pédagogique
    const sortedContributions = sortSubjectsByOrder([...originalContributions]);
    console.log('📚 Ordre des matières dans le Word:', sortedContributions.map(c => c.subjectSelected));
    
    for (const c of sortedContributions) {
        const comm = c.communicationEvaluation || [];
        documentData.atlSummaryTable.push({
            subject: c.subjectSelected,
            communication: comm[0] || "-",
            collaboration: comm[1] || "-",
            autogestion: comm[2] || "-",
            recherche: comm[3] || "-",
            reflexion: comm[4] || "-"
        });
        
        const criteriaTemplateData = createCriteriaDataForTemplate(c.criteriaValues, c.subjectSelected, className);
        
        // Détecter si c'est la matière arabe pour appliquer RTL
        const isArabicSubject = c.subjectSelected && c.subjectSelected.includes('اللغة العربية');
        
        const subjectContributionData = {
            subjectSelected: c.subjectSelected,
            teacherName: c.teacherName || "N/A",
            teacherComment: c.teacherComment || "-",
            isArabic: isArabicSubject,  // Indicateur bool\u00e9en pour RTL dans le template
            ...criteriaTemplateData
        };
        documentData.contributionsBySubject.push(subjectContributionData);
    }
    
    return documentData;
}

async function createWordDocumentBuffer(studentName, className, studentBirthdate, imageBuffer, originalContributions) {
    // CORRECTION: Toutes les classes (PEI et DP) utilisent le MÊME modèle
    console.log(`🎓 Class: ${className} - Utilisation du modèle PEI unique`);
    
    try {
        // Utiliser l'URL du template depuis les variables d'environnement
        const TEMPLATE_URL = process.env.TEMPLATE_URL;
        
        if (!TEMPLATE_URL) {
            throw new Error('TEMPLATE_URL not found in environment variables');
        }
        
        console.log(`📁 Loading template from: ${TEMPLATE_URL.substring(0, 50)}...`);
        
        // Télécharger le template depuis l'URL
        const templateResponse = await fetch(TEMPLATE_URL);
        if (!templateResponse.ok) {
            throw new Error(`Failed to fetch template: ${templateResponse.status} ${templateResponse.statusText}`);
        }
        
        const templateArrayBuffer = await templateResponse.arrayBuffer();
        const templateContent = Buffer.from(templateArrayBuffer);
        console.log(`✅ Template loaded: ${templateContent.length} bytes`);
        
        const zip = new PizZip(templateContent);
        console.log(`✅ PizZip created successfully`);
        
        // CORRECTION CRITIQUE: Gestion de l'image avec DocxTemplater
        // Le module ImageModule doit TOUJOURS être présent, même sans image
        // Pour éviter l'erreur, on configure le module pour gérer les images vides
        
        // SOLUTION DÉFINITIVE: Ne jamais utiliser le module ImageModule
        // car il corrompt le fichier Word même avec des images valides
        // À la place, on remplace {image} par un texte placeholder
        
        let docTemplaterOptions = {
            paragraphLoop: true,
            linebreaks: true,
            nullGetter: (part) => {
                // Retourner une chaîne vide pour toutes les valeurs nulles
                return '';
            }
        };
        
        const doc = new DocxTemplater(zip, docTemplaterOptions);
        
        console.log(`🔄 Preparing Word data for ${studentName}...`);
        const documentData = prepareWordData(studentName, className, studentBirthdate, originalContributions);
        
        // SOLUTION DÉFINITIVE: Remplacer {image} par un placeholder texte
        // car ImageModule corrompt le fichier Word
        const dataToRender = {
            ...documentData,
            image: imageBuffer && imageBuffer.length > 0 ? '[PHOTO]' : '[PAS DE PHOTO]'
        };
        
        console.log(`📷 Image status: ${dataToRender.image}`);
        
        console.log(`🔄 Rendering Word document for ${studentName}...`);
        console.log(`   Data keys: ${Object.keys(dataToRender).join(', ')}`);
        doc.render(dataToRender);
        console.log(`✅ Document rendered successfully`);
        
        console.log(`🔄 Generating final buffer for ${studentName}...`);
        const buffer = doc.getZip().generate({
            type: "nodebuffer",
            compression: "DEFLATE"
        });
        console.log(`✅ Buffer generated: ${buffer.length} bytes`);
        
        return buffer;
    } catch (error) {
        console.error(`Error creating Word buffer for ${studentName}:`, error.message);
        throw error;
    }
}

// --- API Routes ---

// Static files served for local dev; on Vercel, public/ is served directly
app.use(express.static(PUBLIC_DIR));

// Root is handled by Vercel to serve public/index.html (see vercel.json)

// Middleware pour garantir la connexion MongoDB avant les requêtes API
async function ensureDbConnection(req, res, next) {
    // Si déjà connecté, continuer
    if (isDbConnected && mongoClient && contributionsCollection && studentsCollection) {
        return next();
    }
    
    console.log('⚠️ Database not connected, attempting connection...');
    
    try {
        const connected = await connectToMongo();
        if (connected) {
            console.log('✅ Database connection established in middleware');
            return next();
        } else {
            console.error('❌ Failed to establish database connection in middleware');
            return res.status(503).json({ 
                error: 'Service temporairement indisponible',
                details: 'Impossible de se connecter à la base de données. Veuillez réessayer dans quelques instants.',
                dbConnected: false
            });
        }
    } catch (error) {
        console.error('❌ Error in database connection middleware:', error);
        return res.status(503).json({ 
            error: 'Service temporairement indisponible',
            details: 'Erreur lors de la connexion à la base de données.',
            dbConnected: false
        });
    }
}

// Appliquer le middleware à toutes les routes API sauf /api/test et /api/health
app.use('/api', (req, res, next) => {
    // Exclure les routes de santé du middleware de connexion DB
    if (req.path === '/test' || req.path === '/health') {
        return next();
    }
    return ensureDbConnection(req, res, next);
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
    // Le middleware ensureDbConnection garantit que la DB est connectée
    try {
        const { studentSelected, subjectSelected, classSelected, sectionSelected } = req.body;
        if (!studentSelected || !subjectSelected) {
            return res.json({ noDataForSubject: true, studentSelected });
        }
        const query = { studentSelected, subjectSelected };
        if (classSelected) query.classSelected = classSelected;
        if (sectionSelected) query.sectionSelected = sectionSelected;
        const contribution = await contributionsCollection.findOne(query);
        const studentInfo = await studentsCollection.findOne({ studentSelected }, { projection: { studentBirthdate: 1 } });
        
        if (contribution) {
            res.json({ ...contribution, studentBirthdate: studentInfo?.studentBirthdate });
        } else {
            res.json({ noDataForSubject: true, studentSelected, studentBirthdate: studentInfo?.studentBirthdate });
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        // Retourner un objet valide au lieu d'erreur 500
        const { studentSelected } = req.body;
        res.json({ noDataForSubject: true, studentSelected });
    }
});

// Récupérer les infos d'un élève
app.post('/api/fetchStudentInfo', async (req, res) => {
    // Le middleware ensureDbConnection garantit que la DB est connectée
    try {
        const { studentSelected } = req.body;
        if (!studentSelected) {
            return res.json(null);
        }
        const studentInfo = await studentsCollection.findOne(
            { studentSelected }, 
            { projection: { studentBirthdate: 1 } }
        );
        res.json(studentInfo || null);
    } catch (error) {
        console.error('Error fetching student info:', error);
        // Retourner null au lieu d'erreur 500 pour permettre à l'app de continuer
        res.json(null);
    }
});

// Enregistrer/Mettre à jour une contribution
app.post('/api/saveContribution', async (req, res) => {
    // Le middleware ensureDbConnection garantit que la DB est connectée
    try {
        const { contributionId, studentBirthdate, studentPhoto, ...contribData } = req.body;
        contribData.timestamp = new Date();
        
        console.log(`Saving contribution for ${contribData.studentSelected} - ${contribData.subjectSelected}`);
        // Minimal required fields validation to avoid invalid direct writes
        const required = ['studentSelected','subjectSelected','classSelected','sectionSelected','teacherName'];
        for (const key of required) {
            if (!contribData[key]) {
                return res.status(400).json({ success: false, error: `Champ manquant: ${key}` });
            }
        }
        
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
                { studentSelected: contribData.studentSelected, subjectSelected: contribData.subjectSelected, classSelected: contribData.classSelected, sectionSelected: contribData.sectionSelected },
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
    // Le middleware ensureDbConnection garantit que la DB est connectée
    try {
        const { studentSelected, classSelected, sectionSelected } = req.body;
        if (!studentSelected) {
            return res.json({ contributions: [] });
        }
        
        // Construire le filtre de requête
        const filter = { studentSelected };
        if (classSelected) filter.classSelected = classSelected;
        if (sectionSelected) filter.sectionSelected = sectionSelected;
        
        const contributions = await contributionsCollection.find(filter)
            .sort({ subjectSelected: 1 })
            .toArray();
        
        console.log(`📚 Contributions trouvées pour ${studentSelected}:`, contributions.length);
        res.json({ contributions });
    } catch (error) {
        console.error('Error fetching student contributions:', error);
        // Retourner un objet avec tableau vide au lieu d'erreur 500
        res.json({ contributions: [] });
    }
});

// Récupérer une contribution spécifique
app.post('/api/fetchContribution', async (req, res) => {
    // Le middleware ensureDbConnection garantit que la DB est connectée
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
    // Le middleware ensureDbConnection garantit que la DB est connectée
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
    // Le middleware ensureDbConnection garantit que la DB est connectée
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
            console.warn(`⚠️ No contributions found for ${studentSelected}, generating empty document`);
            // Permettre la génération d'un document vide plutôt que de retourner 404
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
        
        // Générer nom de fichier pour le téléchargement
        // Format: Livret-Nom-Prenom-Semestre.docx (sans caractères spéciaux)
        const fullName = getFullStudentName(studentSelected); // Utiliser nom complet
        // Remplacer espaces par tirets, supprimer caractères spéciaux
        const safeStudentName = fullName
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Supprimer accents
            .replace(/[\s]+/g, '-') // Espaces -> tirets
            .replace(/[^a-zA-Z0-9\-]/g, '') // Garder seulement lettres, chiffres, tirets
            .replace(/\-+/g, '-') // Éviter tirets multiples
            .replace(/^\-|\-$/g, ''); // Supprimer tirets début/fin
        const docFileName = `Livret-${safeStudentName}-Semestre.docx`;
        
        // VERCEL COMPATIBLE: Stream direct sans écriture de fichier
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${docFileName}"`);
        res.setHeader('Content-Length', docBuffer.length);
        
        console.log(`✅ Streaming Word document for ${fullName} (${docBuffer.length} bytes)`);
        res.send(docBuffer);
        
    } catch (error) {
        console.error('❌ Error generating Word document:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            studentSelected: req.body.studentSelected
        });
        
        // Provide more detailed error message
        let errorMessage = 'Erreur génération Word';
        if (error.message.includes('template')) {
            errorMessage = 'Erreur: Le modèle Word est inaccessible. Veuillez contacter l\'administrateur.';
        } else if (error.message.includes('fetch')) {
            errorMessage = 'Erreur: Impossible de télécharger le modèle Word. Vérifiez votre connexion internet.';
        } else {
            errorMessage = `Erreur génération Word: ${error.message}`;
        }
        
        res.status(500).json({ error: errorMessage });
    }
});

// Nouvelle route: Générer un ZIP pour toute une classe
app.post('/api/generateClassZip', async (req, res) => {
    // Le middleware ensureDbConnection garantit que la DB est connectée
    try {
        const { classSelected, sectionSelected } = req.body;
        
        if (!classSelected || !sectionSelected) {
            return res.status(400).json({ error: 'Classe et section sont requis' });
        }
        
        console.log(`📦 Génération ZIP pour classe: ${classSelected} (${sectionSelected})`);
        
        // Récupérer tous les élèves de la classe
        const classStudents = await studentsCollection.find({
            classSelected: classSelected,
            sectionSelected: sectionSelected
        }).toArray();
        
        if (classStudents.length === 0) {
            return res.status(404).json({ error: 'Aucun élève trouvé pour cette classe' });
        }
        
        console.log(`✅ ${classStudents.length} élèves trouvés`);
        
        // Créer un fichier ZIP en mémoire
        const archive = archiver('zip', {
            zlib: { level: 9 } // Compression maximale
        });
        
        // Headers pour le téléchargement ZIP
        const zipFileName = `Livrets-${classSelected}-${sectionSelected}.zip`;
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);
        
        // Pipe l'archive vers la réponse
        archive.pipe(res);
        
        // Gérer les erreurs de l'archive
        archive.on('error', (err) => {
            console.error('❌ Erreur archive:', err);
            throw err;
        });
        
        // Générer un document Word pour chaque élève
        let successCount = 0;
        let errorCount = 0;
        
        for (const student of classStudents) {
            try {
                const studentName = student.studentSelected;
                console.log(`📄 Génération pour: ${studentName}`);
                
                // Récupérer les contributions de l'élève
                const studentContributions = await contributionsCollection.find({
                    studentSelected: studentName,
                    sectionSelected: sectionSelected
                }).toArray();
                
                // Récupérer l'image de l'élève
                let imageBuffer = null;
                if (student.studentPhotoUrl && student.studentPhotoUrl.startsWith('http')) {
                    imageBuffer = await fetchImage(student.studentPhotoUrl);
                    if (imageBuffer) {
                        console.log(`✅ Photo récupérée pour ${studentName}: ${imageBuffer.length} bytes`);
                    } else {
                        console.log(`⚠️ Pas de photo pour ${studentName}`);
                    }
                }
                
                // Créer le document Word
                const docBuffer = await createWordDocumentBuffer(
                    studentName,
                    classSelected,
                    student.studentBirthdate,
                    imageBuffer,
                    studentContributions
                );
                
                // Nom du fichier dans le ZIP
                const fullName = getFullStudentName(studentName);
                const safeStudentName = fullName
                    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                    .replace(/[\s]+/g, '-')
                    .replace(/[^a-zA-Z0-9\-]/g, '')
                    .replace(/\-+/g, '-')
                    .replace(/^\-|\-$/g, '');
                const docFileName = `Livret-${safeStudentName}.docx`;
                
                // Ajouter le fichier au ZIP
                archive.append(docBuffer, { name: docFileName });
                successCount++;
                console.log(`✅ ${successCount}/${classStudents.length}: ${docFileName}`);
                
            } catch (error) {
                errorCount++;
                console.error(`❌ Erreur pour ${student.studentSelected}:`, error.message);
                // Continuer avec les autres élèves même en cas d'erreur
            }
        }
        
        // Finaliser l'archive
        await archive.finalize();
        
        console.log(`✅ ZIP généré: ${successCount} réussites, ${errorCount} erreurs`);
        
    } catch (error) {
        console.error('❌ Erreur génération ZIP:', error);
        if (!res.headersSent) {
            res.status(500).json({ 
                error: 'Erreur génération ZIP',
                details: error.message 
            });
        }
    }
});

// Endpoint pour ajouter des données de test (temporaire pour débugger)
app.post('/api/addTestData', async (req, res) => {
    // Le middleware ensureDbConnection garantit que la DB est connectée
    try {
        // Données de test pour Bilal
        const testContribution = {
            studentSelected: 'Bilal',
            sectionSelected: 'garcons',
            subjectSelected: 'Mathématiques',
            teacherName: 'Professeur Test',
            teacherComment: 'Excellent travail en mathématiques',
            criteriaValues: {
                A: { sem1: '6', sem2: '7', finalLevel: '7' },
                B: { sem1: '5', sem2: '6', finalLevel: '6' },
                C: { sem1: '7', sem2: '7', finalLevel: '7' },
                D: { sem1: '6', sem2: '7', finalLevel: '7' }
            },
            communicationEvaluation: ['B', 'A', 'B', 'A', 'B']
        };
        
        // Insérer ou mettre à jour
        await contributionsCollection.replaceOne(
            { studentSelected: 'Bilal', subjectSelected: 'Mathématiques' },
            testContribution,
            { upsert: true }
        );
        
        res.json({ success: true, message: 'Données de test ajoutées pour Bilal' });
        
    } catch (error) {
        console.error('Error adding test data:', error);
        res.status(500).json({ error: error.message });
    }
});

// Route de diagnostic complète pour débugger les problèmes
app.get('/api/health', async (req, res) => {
    const healthStatus = {
        status: isDbConnected ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: {
            NODE_ENV: process.env.NODE_ENV || 'development',
            VERCEL: !!process.env.VERCEL,
            VERCEL_ENV: process.env.VERCEL_ENV || 'N/A',
            MONGODB_URI_defined: !!MONGODB_URI,
            MONGODB_URI_length: MONGODB_URI ? MONGODB_URI.length : 0,
            DB_NAME: dbName
        },
        database: {
            connected: isDbConnected,
            connectionAttempts: connectionAttempts,
            collections: {
                contributions: !!contributionsCollection,
                students: !!studentsCollection
            }
        }
    };
    
    // Test de ping MongoDB si connecté
    if (isDbConnected && mongoClient) {
        try {
            const db = mongoClient.db(dbName);
            await db.admin().ping();
            healthStatus.database.pingSuccess = true;
            healthStatus.database.lastPing = new Date().toISOString();
        } catch (pingError) {
            healthStatus.database.pingSuccess = false;
            healthStatus.database.pingError = pingError.message;
        }
    }
    
    res.json(healthStatus);
});

// Endpoint de diagnostic détaillé (accessible uniquement si besoin)
app.get('/api/diagnostics', async (req, res) => {
    const diagnostics = {
        timestamp: new Date().toISOString(),
        application: {
            name: 'Livret-IB',
            version: '1.0.0',
            uptime: `${Math.floor(process.uptime())} seconds`
        },
        environment: {
            nodeVersion: process.version,
            platform: process.platform,
            NODE_ENV: process.env.NODE_ENV || 'development',
            isVercel: !!process.env.VERCEL,
            vercelEnv: process.env.VERCEL_ENV || 'N/A'
        },
        configuration: {
            MONGODB_URI: MONGODB_URI ? '✅ Defined (hidden for security)' : '❌ NOT DEFINED',
            DB_NAME: dbName,
            PORT: PORT
        },
        database: {
            connectionStatus: isDbConnected ? '✅ Connected' : '❌ Not Connected',
            connectionAttempts: connectionAttempts,
            contributionsCollection: contributionsCollection ? '✅ Available' : '❌ Not Available',
            studentsCollection: studentsCollection ? '✅ Available' : '❌ Not Available'
        },
        endpoints: {
            '/api/test': 'API test endpoint',
            '/api/health': 'Health check endpoint',
            '/api/diagnostics': 'Detailed diagnostics',
            '/api/fetchData': 'Fetch student/subject data',
            '/api/saveContribution': 'Save contribution',
            '/api/generateSingleWord': 'Generate Word document'
        }
    };
    
    // Test database connection if connected
    if (isDbConnected) {
        try {
            const db = mongoClient.db(dbName);
            await db.admin().ping();
            diagnostics.database.pingTest = '✅ Success';
            
            // Count documents
            const contribCount = await contributionsCollection.countDocuments();
            const studentCount = await studentsCollection.countDocuments();
            diagnostics.database.contributionsCount = contribCount;
            diagnostics.database.studentsCount = studentCount;
        } catch (err) {
            diagnostics.database.pingTest = `❌ Failed: ${err.message}`;
        }
    }
    
    res.json(diagnostics);
});

// Route '/' handled by Vercel (public/index.html)

// Catch-all for API only; static routing is handled by Vercel
app.all('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.status(404).end();
});

// --- Démarrage ---
console.log('🚀 ===== APPLICATION STARTUP =====');
console.log('Starting Livret-IB application...');

// Initialiser la connexion MongoDB
connectToMongo().then((success) => {
    if (success) {
        console.log('✅ Server initialized successfully with database connection');
        setupMongoReconnection(); // Configure reconnection handlers
    } else {
        console.warn('⚠️ Server initialized BUT database connection FAILED');
        console.warn('⚠️ The application will run in READ-ONLY mode (no save/update)');
        console.warn('📋 Please check Vercel Environment Variables:');
        console.warn('   - MONGODB_URI must be set correctly');
        console.warn('   - DB_NAME should be set to: teacherContributionsDB');
    }
    
    // Démarrage local (seulement si pas dans Vercel)
    if (require.main === module) {
        app.listen(PORT, () => {
            console.log('================================');
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`🌐 Local URL: http://localhost:${PORT}`);
            console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
            console.log(`📊 Diagnostics: http://localhost:${PORT}/api/diagnostics`);
            console.log('================================');
        });
    }
}).catch(err => {
    console.error('❌ CRITICAL: Failed to initialize server');
    console.error('Error details:', err);
    console.error('The application may not function correctly');
    
    // Sur Vercel, on continue quand même pour que l'app démarre
    if (process.env.VERCEL) {
        console.warn('⚠️ Running in Vercel - application will start despite DB error');
        console.warn('⚠️ Please fix environment variables in Vercel Dashboard');
    }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('📴 SIGTERM received, closing server gracefully...');
    if (mongoClient) {
        await mongoClient.close();
        console.log('✅ MongoDB connection closed');
    }
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('📴 SIGINT received, closing server gracefully...');
    if (mongoClient) {
        await mongoClient.close();
        console.log('✅ MongoDB connection closed');
    }
    process.exit(0);
});

console.log('✅ Server startup sequence complete');
console.log('==================================');

// ENDPOINT ADMINISTRATIF : Afficher les contributions DP2 garçons
// URL: /api/admin/view-dp2-garcons?secret=merge-dp2-2026
app.get('/api/admin/view-dp2-garcons', async (req, res) => {
    try {
        // Protection simple
        const secret = req.query.secret;
        if (secret !== 'merge-dp2-2026') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        if (!isDbConnected) {
            return res.status(503).json({ error: 'Database not connected' });
        }

        const dp2Students = ['Habib', 'Salah'];
        const result = {
            students: [],
            summary: {
                totalStudents: dp2Students.length,
                totalContributions: 0
            },
            orphanedContributions: []
        };

        // Récupérer les contributions pour chaque élève
        for (const studentName of dp2Students) {
            const contributions = await contributionsCollection.find({ 
                studentSelected: studentName,
                classSelected: 'DP2',
                sectionSelected: 'garcons'
            }).toArray();

            const studentData = {
                name: studentName,
                contributionsCount: contributions.length,
                subjects: contributions.map(c => ({
                    subject: c.subjectSelected,
                    teacher: c.teacherName || 'Non défini',
                    hasComment: !!(c.teacherComment && c.teacherComment !== '-'),
                    hasCriteria: !!c.criteriaValues,
                    hasATL: !!(c.communicationEvaluation && c.communicationEvaluation.length > 0)
                }))
            };

            result.students.push(studentData);
            result.summary.totalContributions += contributions.length;
        }

        // Vérifier les contributions orphelines (noms complets)
        const orphaned = await contributionsCollection.find({
            studentSelected: { $in: ['Habib Lteif', 'Salah Boumalouga'] },
            classSelected: 'DP2'
        }).toArray();

        result.orphanedContributions = orphaned.map(c => ({
            studentName: c.studentSelected,
            subject: c.subjectSelected,
            teacher: c.teacherName || 'Non défini'
        }));

        result.summary.orphanedCount = orphaned.length;
        result.summary.averagePerStudent = (result.summary.totalContributions / dp2Students.length).toFixed(1);

        res.json({
            success: true,
            message: 'Contributions DP2 garçons récupérées',
            data: result
        });

    } catch (error) {
        console.error('❌ Error viewing DP2 garcons contributions:', error);
        res.status(500).json({
            error: 'Failed to view DP2 garcons contributions',
            details: error.message
        });
    }
});

// ENDPOINT ADMINISTRATIF : Fusion des contributions DP2
// URL: /api/admin/merge-dp2-names?secret=VOTRE_SECRET
app.get('/api/admin/merge-dp2-names', async (req, res) => {
    try {
        // Protection simple (dans un environnement de production, utiliser un vrai système d'auth)
        const secret = req.query.secret;
        if (secret !== 'merge-dp2-2026') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        if (!isDbConnected) {
            return res.status(503).json({ error: 'Database not connected' });
        }

        const mergeMappings = [
            { fullName: 'Habib Lteif', firstName: 'Habib' },
            { fullName: 'Salah Boumalouga', firstName: 'Salah' }
        ];

        const results = [];

        for (const mapping of mergeMappings) {
            // 1. Mettre à jour les contributions
            const contribResult = await contributionsCollection.updateMany(
                { studentSelected: mapping.fullName },
                { $set: { studentSelected: mapping.firstName } }
            );

            // 2. Supprimer l'entrée avec le nom complet dans students
            const deleteResult = await studentsCollection.deleteMany({
                studentSelected: mapping.fullName
            });

            // 3. Vérifier que l'entrée avec le prénom existe
            const studentExists = await studentsCollection.findOne({
                studentSelected: mapping.firstName
            });

            results.push({
                mapping: `${mapping.fullName} → ${mapping.firstName}`,
                contributionsUpdated: contribResult.modifiedCount,
                studentsDeleted: deleteResult.deletedCount,
                studentExists: !!studentExists
            });
        }

        // Vérification finale
        const habibCount = await contributionsCollection.countDocuments({ studentSelected: 'Habib' });
        const salahCount = await contributionsCollection.countDocuments({ studentSelected: 'Salah' });

        res.json({
            success: true,
            results: results,
            finalCounts: {
                Habib: habibCount,
                Salah: salahCount
            }
        });

    } catch (error) {
        console.error('❌ Error merging DP2 names:', error);
        res.status(500).json({
            error: 'Failed to merge DP2 names',
            details: error.message
        });
    }
});

// Export pour Vercel
module.exports = app;
