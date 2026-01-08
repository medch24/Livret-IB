// Script pour diagnostiquer les contributions DP2
require('dotenv').config({ path: ['.env.local', '.env.production', '.env'] });
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'teacherContributionsDB';

async function checkDP2Contributions() {
    if (!MONGODB_URI) {
        console.error('❌ MONGODB_URI non défini !');
        process.exit(1);
    }

    let client;
    try {
        console.log('🔌 Connexion à MongoDB...');
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        console.log('✅ Connecté à MongoDB\n');

        const db = client.db(dbName);
        const contributionsCollection = db.collection('contributions');
        const studentsCollection = db.collection('students');

        // Chercher toutes les contributions
        console.log('📊 ===== ANALYSE DES CONTRIBUTIONS =====\n');
        
        const allContributions = await contributionsCollection.find({}).toArray();
        console.log(`Total contributions dans la DB: ${allContributions.length}\n`);

        // Grouper par élève
        const byStudent = {};
        allContributions.forEach(contrib => {
            const student = contrib.studentSelected;
            if (!byStudent[student]) {
                byStudent[student] = [];
            }
            byStudent[student].push(contrib);
        });

        console.log('📋 CONTRIBUTIONS PAR ÉLÈVE:\n');
        Object.keys(byStudent).sort().forEach(student => {
            console.log(`  ${student}: ${byStudent[student].length} contribution(s)`);
            console.log(`    Classes: ${[...new Set(byStudent[student].map(c => c.classSelected))].join(', ')}`);
            console.log(`    Matières: ${byStudent[student].map(c => c.subjectSelected).join(', ')}`);
            console.log('');
        });

        // Chercher spécifiquement les DP2
        console.log('\n🎓 ===== CONTRIBUTIONS DP2 =====\n');
        
        const dp2Students = ['Habib', 'Habib Lteif', 'Salah', 'Salah Boumalouga'];
        
        for (const studentName of dp2Students) {
            const contribs = await contributionsCollection.find({ 
                studentSelected: studentName 
            }).toArray();
            
            if (contribs.length > 0) {
                console.log(`✅ ${studentName}:`);
                console.log(`   ${contribs.length} contribution(s) trouvée(s)`);
                contribs.forEach(c => {
                    console.log(`   - ${c.subjectSelected} (${c.classSelected})`);
                });
            } else {
                console.log(`❌ ${studentName}: Aucune contribution`);
            }
            console.log('');
        }

        // Vérifier la collection students
        console.log('\n👥 ===== COLLECTION STUDENTS =====\n');
        const allStudents = await studentsCollection.find({}).toArray();
        console.log(`Total élèves: ${allStudents.length}\n`);
        
        allStudents.forEach(s => {
            console.log(`  ${s.studentSelected} (${s.classSelected}) - Section: ${s.sectionSelected}`);
        });

    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    } finally {
        if (client) {
            await client.close();
            console.log('\n🔌 Connexion MongoDB fermée');
        }
    }
}

checkDP2Contributions()
    .then(() => {
        console.log('\n🎉 Diagnostic terminé !');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Erreur fatale:', error);
        process.exit(1);
    });
