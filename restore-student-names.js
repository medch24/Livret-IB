// Script pour RESTAURER les anciens prénoms dans la base de données
// Les contributions doivent utiliser les prénoms (comme avant)
// Le mapping vers noms complets se fait uniquement dans le frontend

require('dotenv').config({ path: ['.env.local', '.env.production', '.env'] });
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'teacherContributionsDB';

// RESTAURATION : Noms complets → Prénoms
const studentsData = [
    // Garçons PEI 1
    { newName: 'Bilal', oldName: 'Bilal Molina', className: 'PEI1' },
    { newName: 'Faysal', oldName: 'Faysal Achar', className: 'PEI1' },
    { newName: 'Jad', oldName: 'Jad Mahayni', className: 'PEI1' },
    { newName: 'Manaf', oldName: 'Manaf Kotbi', className: 'PEI1' },
    
    // Garçons PEI 2
    { newName: 'Ahmed', oldName: 'Ahmed Bouaziz', className: 'PEI2' },
    { newName: 'Ali', oldName: 'Ali Kutbi', className: 'PEI2' },
    { newName: 'Eyad', oldName: 'Eyad Hassan', className: 'PEI2' },
    { newName: 'Yasser', oldName: 'Yasser Younes', className: 'PEI2' },
    
    // Garçons PEI 3
    { newName: 'Adam', oldName: 'Adam Kaaki', className: 'PEI3' },
    { newName: 'Ahmad', oldName: 'Ahmad Mahayni', className: 'PEI3' },
    { newName: 'Mohamed', oldName: 'Mohamed Chalak', className: 'PEI3' },
    { newName: 'Seifeddine', oldName: 'Seifeddine Ayadi', className: 'PEI3' },
    { newName: 'Wajih', oldName: 'Wajih Sabadine', className: 'PEI3' },
    
    // Garçons PEI 4
    { newName: 'Abdulrahman', oldName: 'Abdulrahman Bouaziz', className: 'PEI4' },
    { newName: 'Mohamed Amine', oldName: 'Mohamed Amine Sgheir', className: 'PEI4' },
    { newName: 'Mohamed', oldName: 'Mohamed Younes', className: 'PEI4' },
    { newName: 'Samir', oldName: 'Samir Kaaki', className: 'PEI4' },
    { newName: 'Youssef', oldName: 'Youssef Baakak', className: 'PEI4' },
    
    // Garçons DP 2
    { newName: 'Habib', oldName: 'Habib Lteif', className: 'DP2' },
    { newName: 'Salah', oldName: 'Salah Boumalouga', className: 'DP2' }
];

async function restoreStudentNames() {
    if (!MONGODB_URI) {
        console.error('❌ MONGODB_URI non défini !');
        process.exit(1);
    }

    let client;
    try {
        console.log('🔌 Connexion à MongoDB...');
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        console.log('✅ Connecté à MongoDB');

        const db = client.db(dbName);
        const contributionsCollection = db.collection('contributions');
        const studentsCollection = db.collection('students');

        let updatedContributions = 0;
        let updatedStudents = 0;

        for (const student of studentsData) {
            console.log(`\n🔄 RESTAURATION: ${student.oldName} → ${student.newName}`);

            // Restaurer dans la collection contributions
            const contribResult = await contributionsCollection.updateMany(
                { studentSelected: student.oldName },
                { $set: { studentSelected: student.newName } }
            );
            
            if (contribResult.modifiedCount > 0) {
                console.log(`   ✅ ${contribResult.modifiedCount} contribution(s) restaurée(s)`);
                updatedContributions += contribResult.modifiedCount;
            }

            // Restaurer dans la collection students
            const studentResult = await studentsCollection.updateMany(
                { studentSelected: student.oldName },
                { $set: { studentSelected: student.newName } }
            );
            
            if (studentResult.modifiedCount > 0) {
                console.log(`   ✅ ${studentResult.modifiedCount} élève(s) restauré(s)`);
                updatedStudents += studentResult.modifiedCount;
            }

            // Vérification
            const contribCount = await contributionsCollection.countDocuments({ studentSelected: student.newName });
            const studentCount = await studentsCollection.countDocuments({ studentSelected: student.newName });
            console.log(`   📊 Vérification: ${contribCount} contributions, ${studentCount} élève(s) avec le prénom`);
        }

        console.log('\n✅ ===== RESTAURATION TERMINÉE =====');
        console.log(`📊 Total contributions restaurées: ${updatedContributions}`);
        console.log(`📊 Total élèves restaurés: ${updatedStudents}`);
        console.log('\n💡 NOTE: Les prénoms sont maintenant dans la DB.');
        console.log('💡 Le frontend affichera les noms complets via mapping.');

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

// Exécuter le script
restoreStudentNames()
    .then(() => {
        console.log('\n🎉 Script de restauration terminé avec succès !');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Erreur fatale:', error);
        process.exit(1);
    });
