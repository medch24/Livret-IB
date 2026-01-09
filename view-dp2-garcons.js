// Script pour afficher TOUTES les contributions de la classe DP2 garçons
require('dotenv').config({ path: ['.env.local', '.env.production', '.env'] });
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'teacherContributionsDB';

async function viewDP2GarconsContributions() {
    if (!MONGODB_URI) {
        console.error('❌ MONGODB_URI non défini !');
        console.error('Veuillez créer un fichier .env.local avec la variable MONGODB_URI');
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

        // Les élèves DP2 garçons
        const dp2Students = ['Habib', 'Salah'];
        
        console.log('='.repeat(80));
        console.log('📊 CONTRIBUTIONS DP2 GARÇONS - VUE COMPLÈTE');
        console.log('='.repeat(80));
        console.log();

        let totalContributions = 0;
        
        for (const studentName of dp2Students) {
            console.log('─'.repeat(80));
            console.log(`\n🎓 ÉLÈVE: ${studentName}`);
            console.log('─'.repeat(80));
            
            // Chercher toutes les contributions pour cet élève
            const contributions = await contributionsCollection.find({ 
                studentSelected: studentName,
                classSelected: 'DP2',
                sectionSelected: 'garcons'
            }).toArray();
            
            if (contributions.length === 0) {
                console.log('❌ Aucune contribution trouvée pour cet élève');
                console.log();
                continue;
            }
            
            console.log(`\n✅ ${contributions.length} contribution(s) trouvée(s):\n`);
            totalContributions += contributions.length;
            
            // Afficher chaque contribution
            contributions.forEach((contrib, index) => {
                console.log(`   ${index + 1}. 📚 ${contrib.subjectSelected}`);
                console.log(`      👨‍🏫 Enseignant: ${contrib.teacherName || 'Non défini'}`);
                
                // Afficher les critères (AO1-AO4 pour DP)
                if (contrib.criteriaValues) {
                    console.log('      📊 Critères:');
                    ['AO1', 'AO2', 'AO3', 'AO4'].forEach(key => {
                        if (contrib.criteriaValues[key]) {
                            const crit = contrib.criteriaValues[key];
                            console.log(`         ${key}: Sem1=${crit.sem1 || '-'}, Sem2=${crit.sem2 || '-'}, Final=${crit.finalLevel || '-'}`);
                        }
                    });
                }
                
                // Afficher le commentaire s'il existe
                if (contrib.teacherComment && contrib.teacherComment !== '-') {
                    console.log(`      💬 Commentaire: ${contrib.teacherComment.substring(0, 60)}${contrib.teacherComment.length > 60 ? '...' : ''}`);
                }
                
                // Afficher les ATL (compétences transversales)
                if (contrib.communicationEvaluation && contrib.communicationEvaluation.length > 0) {
                    const atl = contrib.communicationEvaluation;
                    console.log(`      🎯 ATL: Communication=${atl[0] || '-'}, Collaboration=${atl[1] || '-'}, Autogestion=${atl[2] || '-'}, Recherche=${atl[3] || '-'}, Réflexion=${atl[4] || '-'}`);
                }
                
                console.log();
            });
            
            // Afficher les matières de cet élève
            const subjects = contributions.map(c => c.subjectSelected).sort();
            console.log(`   📋 Liste des matières: ${subjects.join(', ')}`);
            console.log();
        }
        
        console.log('='.repeat(80));
        console.log(`\n📊 RÉSUMÉ:`);
        console.log(`   Total élèves DP2 garçons: ${dp2Students.length}`);
        console.log(`   Total contributions: ${totalContributions}`);
        console.log(`   Moyenne par élève: ${(totalContributions / dp2Students.length).toFixed(1)}`);
        console.log();
        console.log('='.repeat(80));
        
        // Vérifier s'il y a des contributions avec d'autres variantes de noms
        console.log('\n🔍 VÉRIFICATION: Contributions avec noms complets...\n');
        const fullNameContribs = await contributionsCollection.find({
            studentSelected: { $in: ['Habib Lteif', 'Salah Boumalouga'] },
            classSelected: 'DP2'
        }).toArray();
        
        if (fullNameContribs.length > 0) {
            console.log(`⚠️  ATTENTION: ${fullNameContribs.length} contribution(s) trouvée(s) avec les noms complets !`);
            console.log('   Ces contributions ne sont PAS affichées dans le frontend.');
            console.log('   Utilisez le script merge-dp2-contributions.js pour les fusionner.');
            fullNameContribs.forEach(c => {
                console.log(`   - ${c.studentSelected}: ${c.subjectSelected}`);
            });
        } else {
            console.log('✅ Aucune contribution orpheline avec les noms complets.');
        }
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

viewDP2GarconsContributions()
    .then(() => {
        console.log('\n✅ Consultation terminée !');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Erreur fatale:', error);
        process.exit(1);
    });
