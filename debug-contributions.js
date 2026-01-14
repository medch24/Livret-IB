const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function debugContributions() {
    const client = new MongoClient(process.env.MONGODB_URI);
    
    try {
        await client.connect();
        console.log('✅ Connexion MongoDB réussie\n');
        
        const db = client.db(process.env.DB_NAME || 'teacherContributionsDB');
        const contributionsCollection = db.collection('contributions');
        const studentsCollection = db.collection('students');
        
        // 1. Vérifier les contributions pour Habib
        console.log('=== CONTRIBUTIONS HABIB ===');
        const habibContributions = await contributionsCollection.find({
            studentSelected: /Habib/i,
            classSelected: 'DP2',
            sectionSelected: 'garçons'
        }).toArray();
        
        console.log(`📊 Nombre de contributions: ${habibContributions.length}\n`);
        
        if (habibContributions.length > 0) {
            const firstContrib = habibContributions[0];
            console.log('📄 Première contribution (structure complète):');
            console.log(JSON.stringify(firstContrib, null, 2));
            console.log('\n');
            
            // Afficher les champs clés
            console.log('🔑 CHAMPS CLÉS:');
            console.log(`  - studentSelected: "${firstContrib.studentSelected}"`);
            console.log(`  - classSelected: "${firstContrib.classSelected}"`);
            console.log(`  - sectionSelected: "${firstContrib.sectionSelected}"`);
            console.log(`  - subjectSelected: "${firstContrib.subjectSelected}"`);
            console.log(`  - teacherName: "${firstContrib.teacherName}"`);
            console.log(`  - criteriaValues keys: ${Object.keys(firstContrib.criteriaValues || {}).join(', ')}`);
            console.log('\n');
        }
        
        // 2. Vérifier les infos élève pour Habib
        console.log('=== INFOS ÉLÈVE HABIB ===');
        const habibInfo = await studentsCollection.findOne({
            fullName: /Habib/i
        });
        
        if (habibInfo) {
            console.log('📋 Informations élève:');
            console.log(JSON.stringify(habibInfo, null, 2));
            console.log('\n');
            
            console.log('🔑 CHAMPS CLÉS:');
            console.log(`  - fullName: "${habibInfo.fullName}"`);
            console.log(`  - studentBirthdate: "${habibInfo.studentBirthdate || habibInfo.birthDate || 'N/A'}"`);
            console.log(`  - birthDate: "${habibInfo.birthDate || 'N/A'}"`);
            console.log(`  - classSelected: "${habibInfo.classSelected}"`);
        } else {
            console.log('❌ Aucune info élève trouvée pour Habib');
        }
        
    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await client.close();
    }
}

debugContributions();
