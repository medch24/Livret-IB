// Script pour corriger la faute dans le nom de Salah
require('dotenv').config({ path: ['.env.local', '.env.production', '.env'] });
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'teacherContributionsDB';

async function fixSalahName() {
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

        console.log('📊 ===== CORRECTION DU NOM DE SALAH =====\n');

        // Vérifier les variations du nom
        const salahVariations = [
            'Salah Bouamlouga',  // avec faute
            'Salah Boumalouga',  // correct
            'Salah'
        ];

        console.log('🔍 Recherche des variations du nom...\n');
        
        for (const variation of salahVariations) {
            const count = await contributionsCollection.countDocuments({ 
                studentSelected: variation 
            });
            if (count > 0) {
                console.log(`   "${variation}": ${count} contribution(s)`);
            }
        }
        console.log();

        // Corriger "Salah Bouamlouga" → "Salah Boumalouga"
        console.log('✏️  Correction en cours...\n');

        const contribResult = await contributionsCollection.updateMany(
            { studentSelected: 'Salah Bouamlouga' },  // avec faute
            { $set: { studentSelected: 'Salah Boumalouga' } }  // correct
        );

        console.log(`✅ Contributions corrigées: ${contribResult.modifiedCount}`);

        const studentResult = await studentsCollection.updateMany(
            { studentSelected: 'Salah Bouamlouga' },
            { $set: { studentSelected: 'Salah Boumalouga' } }
        );

        console.log(`✅ Entrées students corrigées: ${studentResult.modifiedCount}`);

        // Vérification finale
        console.log('\n📊 Vérification finale:\n');
        
        const finalCount = await contributionsCollection.countDocuments({ 
            studentSelected: 'Salah Boumalouga' 
        });
        
        console.log(`   "Salah Boumalouga" (correct): ${finalCount} contribution(s)`);

        const wrongCount = await contributionsCollection.countDocuments({ 
            studentSelected: 'Salah Bouamlouga' 
        });
        
        if (wrongCount > 0) {
            console.log(`   ⚠️  "Salah Bouamlouga" (avec faute): ${wrongCount} contribution(s) RESTANTES`);
        } else {
            console.log(`   ✅ Aucune contribution avec la faute "Bouamlouga"`);
        }

        // Afficher les matières de Salah
        console.log('\n📚 Matières de Salah Boumalouga:');
        const salahContribs = await contributionsCollection.find({
            studentSelected: 'Salah Boumalouga'
        }).toArray();

        salahContribs.forEach(contrib => {
            console.log(`   - ${contrib.subjectSelected} (${contrib.classSelected})`);
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

fixSalahName()
    .then(() => {
        console.log('\n✅ Correction du nom de Salah terminée !');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Erreur fatale:', error);
        process.exit(1);
    });
