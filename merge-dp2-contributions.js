/**
 * Script de fusion des contributions DP2
 * Fusionne "Habib Lteif" → "Habib" et "Salah Boumalouga" → "Salah"
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'teacherContributionsDB';

async function mergeDP2Contributions() {
    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        console.log('✅ Connecté à MongoDB');
        
        const db = client.db(dbName);
        const contributionsCollection = db.collection('contributions');
        const studentsCollection = db.collection('students');
        
        // Mapping: nom complet → prénom
        const mergeMappings = [
            { fullName: 'Habib Lteif', firstName: 'Habib' },
            { fullName: 'Salah Boumalouga', firstName: 'Salah' }
        ];
        
        for (const mapping of mergeMappings) {
            console.log(`\n🔄 Fusion: "${mapping.fullName}" → "${mapping.firstName}"`);
            
            // 1. Mettre à jour les contributions
            const contribResult = await contributionsCollection.updateMany(
                { studentSelected: mapping.fullName },
                { $set: { studentSelected: mapping.firstName } }
            );
            console.log(`   📝 Contributions mises à jour: ${contribResult.modifiedCount}`);
            
            // 2. Supprimer l'entrée avec le nom complet dans students
            const deleteResult = await studentsCollection.deleteMany({
                studentSelected: mapping.fullName
            });
            console.log(`   🗑️  Étudiants supprimés (nom complet): ${deleteResult.deletedCount}`);
            
            // 3. Vérifier que l'entrée avec le prénom existe
            const studentExists = await studentsCollection.findOne({
                studentSelected: mapping.firstName
            });
            
            if (!studentExists) {
                console.log(`   ⚠️  Aucun étudiant trouvé avec prénom "${mapping.firstName}"`);
                // On pourrait créer une entrée ici si nécessaire
            } else {
                console.log(`   ✅ Étudiant existe avec prénom "${mapping.firstName}"`);
            }
        }
        
        // Vérification finale
        console.log('\n📊 Vérification finale:');
        const habibCount = await contributionsCollection.countDocuments({ studentSelected: 'Habib' });
        const salahCount = await contributionsCollection.countDocuments({ studentSelected: 'Salah' });
        
        console.log(`   Habib: ${habibCount} contributions`);
        console.log(`   Salah: ${salahCount} contributions`);
        
        console.log('\n✅ Fusion terminée avec succès!');
        
    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await client.close();
    }
}

mergeDP2Contributions();
