// Script pour vérifier la correspondance des noms d'élèves
require('dotenv').config({ path: ['.env.local', '.env.production', '.env'] });
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'teacherContributionsDB';

// Mapping des noms courts vers fullName (depuis script.js)
const studentMapping = {
    // Garçons
    'Faysal': 'Faysal Achar',
    'Bilal': 'Bilal Molina',
    'Jad': 'Jad Mahayni',
    'Manaf': 'Manaf Kotbi',
    'Ahmed': 'Ahmed Bouaziz',
    'Yasser': 'Yasser Younes',
    'Eyad': 'Eyad Hassan',
    'Ali': 'Ali Kutbi',
    'Seifeddine': 'Seifeddine Ayadi',
    'Mohamed Chalak': 'Mohamed Chalak',
    'Wajih': 'Wajih Sabadine',
    'Ahmad': 'Ahmad Mahayni',
    'Adam': 'Adam Kaaki',
    'Mohamed Younes': 'Mohamed Younes',
    'Mohamed Amine Sgheir': 'Mohamed Amine Sgheir',
    'Samir': 'Samir Kaaki',
    'Abdulrahman': 'Abdulrahman Bouaziz',
    'Youssef': 'Youssef Baakak',
    'Habib': 'Habib Lteif',
    'Salah': 'Salah Boumalouga',
    // Filles
    'Yomna Masrouhi': 'Yomna Masrouhi',
    'Isra Elalmi': 'Isra Elalmi',
    'Naya Sabbidine': 'Naya Sabbidine',
    'Israa Alkattan': 'Israa Alkattan',
    'Dina Tlili': 'Dina Tlili',
    'Lina Tlili': 'Lina Tlili',
    'Cynthia Fadlallah': 'Cynthia Fadlallah',
    'Neyla Molina': 'Neyla Molina',
    'Jawahair Eshmawi': 'Jawahair Eshmawi',
    'Yousr Letaief': 'Yousr Letaief',
    'Sarah Aldebasy': 'Sarah Aldebasy',
    'Maria Wahib': 'Maria Wahib',
    'Badia Khaldi': 'Badia Khaldi',
    'Luluwah Alghabashi': 'Luluwah Alghabashi'
};

async function checkStudentNames() {
    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        console.log('✅ Connexion MongoDB établie\n');
        
        const db = client.db(dbName);
        const contributionsCollection = db.collection('contributions');
        const studentsCollection = db.collection('students');
        
        // Récupérer tous les noms uniques dans contributions
        const contributionNames = await contributionsCollection.distinct('studentSelected');
        console.log('📋 Noms dans contributions:', contributionNames.length);
        console.log(contributionNames);
        
        // Récupérer tous les élèves dans students
        const students = await studentsCollection.find({}).toArray();
        console.log('\n📋 Élèves dans students:', students.length);
        students.forEach(s => console.log(`  - ${s.fullName}`));
        
        // Vérifier les correspondances
        console.log('\n🔍 Vérification des correspondances:\n');
        
        const mismatches = [];
        for (const name of contributionNames) {
            const expectedFullName = studentMapping[name];
            const studentInDb = students.find(s => s.fullName === expectedFullName);
            
            if (!expectedFullName) {
                console.log(`⚠️  "${name}" - Pas de mapping défini`);
                mismatches.push({ name, issue: 'no_mapping' });
            } else if (!studentInDb) {
                console.log(`❌ "${name}" → "${expectedFullName}" - Élève non trouvé dans DB`);
                mismatches.push({ name, expectedFullName, issue: 'not_in_db' });
            } else {
                console.log(`✅ "${name}" → "${expectedFullName}"`);
            }
        }
        
        if (mismatches.length > 0) {
            console.log('\n⚠️  Problèmes détectés:', mismatches.length);
            console.log(JSON.stringify(mismatches, null, 2));
        } else {
            console.log('\n✅ Toutes les correspondances sont correctes !');
        }
        
    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await client.close();
        console.log('\n👋 Connexion fermée');
    }
}

checkStudentNames();
