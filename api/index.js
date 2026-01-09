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
console.log('MONGODB_URI defined:', !!process.env.MONGODB_URI);
console.log('DB_NAME:', process.env.DB_NAME || 'teacherContributionsDB');
console.log('=====================================');

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'teacherContributionsDB';

const contributionsCollectionName = 'contributions';
const studentsCollectionName = 'students';
const PUBLIC_DIR = path.join(__dirname, '../public');

let mongoClient = null;
let contributionsCollection;
let studentsCollection;
let isDbConnected = false;

// --- Connexion Base de Données ---
async function connectToMongo() {
        if (!MONGODB_URI) return false;
        try {
                    mongoClient = new MongoClient(MONGODB_URI, {
                                    serverSelectionTimeoutMS: 10000,
                                    socketTimeoutMS: 45000,
                    });
                    await mongoClient.connect();
                    const db = mongoClient.db(dbName);
                    contributionsCollection = db.collection(contributionsCollectionName);
                    studentsCollection = db.collection(studentsCollectionName);
                    isDbConnected = true;
                    console.log('✅ Connected to MongoDB');
                    return true;
        } catch (error) {
                    console.error('❌ MongoDB connection failed:', error.message);
                    return false;
        }
}

async function ensureDbConnection(req, res, next) {
        if (!isDbConnected) {
                    const connected = await connectToMongo();
                    if (!connected) return res.status(500).json({ error: "Database connection failed" });
        }
        next();
}

// --- Mapping des noms ---
const studentNameMapping = {
        'Habib': 'Habib Lteif',
        'Salah': 'Salah Boumalouga',
        'Isra': 'Isra Elalmi',
        'Ahmad': 'Ahmad Mahayni',
        'Mohamed': 'Mohamed Chalak',
        'Adam': 'Adam Kaaki',
        'Seifeddine': 'Seifeddine Ayadi',
        'Wajih': 'Wajih Sabadine',
        'Bilal': 'Bilal Molina',
        'Faysal': 'Faysal Achar',
        'Jad': 'Jad Mahayni',
        'Manaf': 'Manaf Kotbi'
};

function getFullStudentName(firstName) {
        return studentNameMapping[firstName] || firstName;
}

// --- Fonctions Word ---
async function fetchImage(url) {
        if (!url) return null;
        try {
                    const response = await fetch(url);
                   
