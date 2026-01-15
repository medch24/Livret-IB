#!/usr/bin/env node
/**
 * Script de migration pour convertir les valeurs arabes en valeurs standardisées
 * 
 * Convertit:
 *   م   → E  (Excellent / ممتاز)
 *   م+  → A  (Acquis / مكتسب)
 *   ج   → PA (Partiellement Acquis / مكتسب جزئياً)
 *   غ   → I  (Insuffisant / غير كافٍ)
 * 
 * Usage: node migrate_arabic_values.js [--dry-run]
 */

const { MongoClient } = require('mongodb');

// Charger les variables d'environnement
require('dotenv').config({ path: ['.env.local', '.env.production', '.env'] });

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'teacherContributionsDB';

// Mapping des valeurs à convertir
const VALUE_MAPPING = {
    'م': 'E',    // Excellent
    'م+': 'A',   // Acquis
    'ج': 'PA',   // Partiellement Acquis
    'غ': 'I'     // Insuffisant
};

async function migrateArabicValues(dryRun = false) {
    if (!MONGODB_URI) {
        console.error('❌ MONGODB_URI non défini dans les variables d\'environnement');
        process.exit(1);
    }

    console.log('🔄 Connexion à MongoDB...');
    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        console.log('✅ Connecté à MongoDB');
        
        const db = client.db(DB_NAME);
        const collection = db.collection('contributions');
        
        // Trouver toutes les contributions avec des valeurs arabes
        console.log('\n🔍 Recherche des contributions avec valeurs arabes...');
        
        const contributions = await collection.find({
            communicationEvaluation: {
                $exists: true,
                $ne: null
            }
        }).toArray();
        
        console.log(`📊 ${contributions.length} contributions trouvées`);
        
        let updatedCount = 0;
        let skippedCount = 0;
        
        for (const contrib of contributions) {
            let needsUpdate = false;
            const originalEval = contrib.communicationEvaluation || [];
            const newEval = [...originalEval];
            
            // Vérifier et convertir chaque valeur
            for (let i = 0; i < newEval.length; i++) {
                const value = newEval[i];
                if (VALUE_MAPPING[value]) {
                    newEval[i] = VALUE_MAPPING[value];
                    needsUpdate = true;
                }
            }
            
            if (needsUpdate) {
                const changes = [];
                for (let i = 0; i < originalEval.length; i++) {
                    if (originalEval[i] !== newEval[i]) {
                        changes.push(`  [${i}] ${originalEval[i]} → ${newEval[i]}`);
                    }
                }
                
                console.log(`\n📝 ${contrib.studentSelected} - ${contrib.subjectSelected}:`);
                console.log(changes.join('\n'));
                
                if (!dryRun) {
                    await collection.updateOne(
                        { _id: contrib._id },
                        { 
                            $set: { 
                                communicationEvaluation: newEval,
                                migratedAt: new Date()
                            } 
                        }
                    );
                    console.log('  ✅ Mise à jour effectuée');
                }
                
                updatedCount++;
            } else {
                skippedCount++;
            }
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('📊 RÉSUMÉ DE LA MIGRATION');
        console.log('='.repeat(60));
        console.log(`Total contributions:     ${contributions.length}`);
        console.log(`À mettre à jour:         ${updatedCount}`);
        console.log(`Déjà à jour:             ${skippedCount}`);
        
        if (dryRun) {
            console.log('\n⚠️  MODE DRY-RUN: Aucune modification effectuée');
            console.log('Pour appliquer les changements, exécutez:');
            console.log('  node migrate_arabic_values.js');
        } else {
            console.log('\n✅ Migration terminée avec succès!');
        }
        
    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    } finally {
        await client.close();
        console.log('\n🔌 Connexion fermée');
    }
}

// Vérifier les arguments de ligne de commande
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run') || args.includes('-d');

if (dryRun) {
    console.log('🔍 MODE DRY-RUN: Simulation sans modifications\n');
}

// Exécuter la migration
migrateArabicValues(dryRun)
    .then(() => {
        console.log('\n✅ Script terminé');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Erreur fatale:', error);
        process.exit(1);
    });
