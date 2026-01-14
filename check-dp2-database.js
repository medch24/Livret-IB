#!/usr/bin/env node
require('dotenv').config({ path: ['.env.local', '.env.production', '.env'] });
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'teacherContributionsDB';

async function checkDB() {
    console.log('🔍 VÉRIFICATION BASE DE DONNÉES DP2 GARÇONS');
    console.log('='.repeat(60));
    
    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        const db = client.db(dbName);
        const contributionsCollection = db.collection('contributions');
        
        // Chercher toutes les contributions DP2 garçons
        console.log('\n📊 Recherche TOUTES contributions DP2 garçons...');
        const allDP2Garcons = await contributionsCollection.find({
            classSelected: 'DP2',
            sectionSelected: 'garçons'
        }).toArray();
        
        console.log(`\n✅ ${allDP2Garcons.length} contributions trouvées:`);
        allDP2Garcons.forEach((c, i) => {
            console.log(`\n${i + 1}. Élève: ${c.studentSelected}`);
            console.log(`   Matière: ${c.subjectSelected}`);
            console.log(`   Enseignant: ${c.teacherName || 'N/A'}`);
            console.log(`   Date: ${c.timestamp || c.createdAt || 'N/A'}`);
        });
        
        // Vérifier les noms uniques
        console.log('\n📋 NOMS D\'ÉLÈVES UNIQUES:');
        const uniqueStudents = [...new Set(allDP2Garcons.map(c => c.studentSelected))];
        uniqueStudents.forEach((name, i) => {
            const count = allDP2Garcons.filter(c => c.studentSelected === name).length;
            console.log(`   ${i + 1}. ${name} (${count} contributions)`);
        });
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        await client.close();
        console.log('\n🔌 Connexion fermée');
    }
}

checkDB();
