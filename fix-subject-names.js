// Script pour standardiser les noms de matières DP dans la base de données
require('dotenv').config({ path: ['.env.local', '.env.production', '.env'] });
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'teacherContributionsDB';

// Mapping des noms de matières à corriger
const subjectNameMapping = {
    // Variations actuelles → Nom standardisé
    'Mathématiques AA (NS)': 'Mathématiques AA (NS)',
    'Mathématiques': 'Mathématiques AA (NS)',
    'Maths AA': 'Mathématiques AA (NS)',
    
    'Biologie (NS)': 'Biologie (NS)',
    'Biologie': 'Biologie (NS)',
    'Bio': 'Biologie (NS)',
    
    'Géographie (NM)': 'Géographie (NM)',
    'Géographie': 'Géographie (NM)',
    'Geo': 'Géographie (NM)',
    
    'Langue Anglaise (NM)': 'Langue Anglaise (NM)',
    'Langue Anglaise': 'Langue Anglaise (NM)',
    'Anglais': 'Langue Anglaise (NM)',
    'Anglais NM': 'Langue Anglaise (NM)',
    
    'Langue et Littérature (Français NM)': 'Langue et Littérature (Français NM)',
    'Langue et Littérature': 'Langue et Littérature (Français NM)',
    'Français': 'Langue et Littérature (Français NM)',
    'Français NM': 'Langue et Littérature (Français NM)',
    
    'Physique (NS)': 'Physique (NS)',
    'Physique': 'Physique (NS)',
    'Physique-Chimie': 'Physique (NS)',
    
    'Histoire géographie': 'Histoire géographie (NM)',
    'Histoire': 'Histoire géographie (NM)'
};

async function fixSubjectNames() {
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

        console.log('📊 ===== CORRECTION DES NOMS DE MATIÈRES =====\n');

        // Récupérer tous les noms de matières uniques
        const uniqueSubjects = await contributionsCollection.distinct('subjectSelected');
        console.log('📋 Matières actuelles dans la base:');
        uniqueSubjects.sort().forEach(subject => {
            console.log(`   - ${subject}`);
        });
        console.log();

        let totalUpdated = 0;
        const corrections = [];

        // Pour chaque mapping, mettre à jour les documents
        for (const [oldName, newName] of Object.entries(subjectNameMapping)) {
            if (oldName === newName) continue; // Skip si déjà correct

            const result = await contributionsCollection.updateMany(
                { subjectSelected: oldName },
                { $set: { subjectSelected: newName } }
            );

            if (result.modifiedCount > 0) {
                console.log(`✅ "${oldName}" → "${newName}": ${result.modifiedCount} contribution(s) mise(s) à jour`);
                corrections.push({
                    oldName,
                    newName,
                    count: result.modifiedCount
                });
                totalUpdated += result.modifiedCount;
            }
        }

        console.log('\n' + '='.repeat(80));
        console.log(`\n📊 RÉSUMÉ:`);
        console.log(`   Total corrections: ${corrections.length}`);
        console.log(`   Total contributions mises à jour: ${totalUpdated}`);
        console.log();

        // Afficher les matières après correction
        const uniqueSubjectsAfter = await contributionsCollection.distinct('subjectSelected');
        console.log('📋 Matières après correction:');
        uniqueSubjectsAfter.sort().forEach(subject => {
            console.log(`   - ${subject}`);
        });
        console.log();

        // Compter les contributions par matière pour DP2
        console.log('📊 Contributions DP2 par matière:');
        const dp2Subjects = await contributionsCollection.aggregate([
            { $match: { classSelected: 'DP2' } },
            { $group: { _id: '$subjectSelected', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]).toArray();

        dp2Subjects.forEach(item => {
            console.log(`   ${item._id}: ${item.count} contribution(s)`);
        });
        console.log();

    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    } finally {
        if (client) {
            await client.close();
            console.log('🔌 Connexion MongoDB fermée');
        }
    }
}

fixSubjectNames()
    .then(() => {
        console.log('\n✅ Correction des noms de matières terminée !');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Erreur fatale:', error);
        process.exit(1);
    });
