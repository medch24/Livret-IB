// Script pour mettre à jour les noms complets des élèves
// Ce script doit être exécuté une seule fois pour corriger la base de données

require('dotenv').config({ path: ['.env.local', '.env.production', '.env'] });
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'teacherContributionsDB';

// Liste complète des élèves avec noms complets
const studentsData = [
    // Garçons PEI 1
    { oldName: 'Bilal', newName: 'Bilal Molina', className: 'PEI1' },
    { oldName: 'Faysal', newName: 'Faysal Achar', className: 'PEI1' },
    { oldName: 'Jad', newName: 'Jad Mahayni', className: 'PEI1' },
    { oldName: 'Manaf', newName: 'Manaf Kotbi', className: 'PEI1' },
    
    // Garçons PEI 2
    { oldName: 'Ahmed', newName: 'Ahmed Bouaziz', className: 'PEI2' },
    { oldName: 'Ali', newName: 'Ali Kutbi', className: 'PEI2' },
    { oldName: 'Eyad', newName: 'Eyad Hassan', className: 'PEI2' },
    { oldName: 'Yasser', newName: 'Yasser Younes', className: 'PEI2' },
    
    // Garçons PEI 3
    { oldName: 'Adam', newName: 'Adam Kaaki', className: 'PEI3' },
    { oldName: 'Ahmad', newName: 'Ahmad Mahayni', className: 'PEI3' },
    { oldName: 'Mohamed', newName: 'Mohamed Chalak', className: 'PEI3' },
    { oldName: 'Seifeddine', newName: 'Seifeddine Ayadi', className: 'PEI3' },
    { oldName: 'Wajih', newName: 'Wajih Sabadine', className: 'PEI3' },
    
    // Garçons PEI 4
    { oldName: 'Abdulrahman', newName: 'Abdulrahman Bouaziz', className: 'PEI4' },
    { oldName: 'Mohamed Amine', newName: 'Mohamed Amine Sgheir', className: 'PEI4' },
    { oldName: 'Mohamed', newName: 'Mohamed Younes', className: 'PEI4' },
    { oldName: 'Samir', newName: 'Samir Kaaki', className: 'PEI4' },
    { oldName: 'Youssef', newName: 'Youssef Baakak', className: 'PEI4' },
    
    // Garçons DP 2
    { oldName: 'Habib', newName: 'Habib Lteif', className: 'DP2' },
    { oldName: 'Salah', newName: 'Salah Boumalouga', className: 'DP2' }
];

async function updateStudentNames() {
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
            console.log(`\n🔄 Traitement de ${student.oldName} → ${student.newName}`);

            // Mettre à jour dans la collection contributions
            const contribResult = await contributionsCollection.updateMany(
                { studentSelected: student.oldName },
                { $set: { studentSelected: student.newName } }
            );
            
            if (contribResult.modifiedCount > 0) {
                console.log(`   ✅ ${contribResult.modifiedCount} contribution(s) mise(s) à jour`);
                updatedContributions += contribResult.modifiedCount;
            }

            // Mettre à jour dans la collection students
            const studentResult = await studentsCollection.updateMany(
                { studentSelected: student.oldName },
                { $set: { studentSelected: student.newName } }
            );
            
            if (studentResult.modifiedCount > 0) {
                console.log(`   ✅ ${studentResult.modifiedCount} élève(s) mis à jour`);
                updatedStudents += studentResult.modifiedCount;
            }

            // Vérification
            const contribCount = await contributionsCollection.countDocuments({ studentSelected: student.newName });
            const studentCount = await studentsCollection.countDocuments({ studentSelected: student.newName });
            console.log(`   📊 Vérification: ${contribCount} contributions, ${studentCount} élève(s) avec le nouveau nom`);
        }

        console.log('\n✅ ===== MISE À JOUR TERMINÉE =====');
        console.log(`📊 Total contributions mises à jour: ${updatedContributions}`);
        console.log(`📊 Total élèves mis à jour: ${updatedStudents}`);

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
updateStudentNames()
    .then(() => {
        console.log('\n🎉 Script terminé avec succès !');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Erreur fatale:', error);
        process.exit(1);
    });
