#!/usr/bin/env node
/**
 * Script de test pour la génération de documents Word
 * Teste la génération avec le nouveau modèle sans images
 */

require('dotenv').config({ path: ['.env.local', '.env.production', '.env'] });
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
const PizZip = require("pizzip");
const DocxTemplater = require("docxtemplater");

const MONGODB_URI = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'teacherContributionsDB';

async function testWordGeneration() {
    console.log('🔬 TEST GÉNÉRATION WORD - NOUVEAU MODÈLE SANS IMAGES');
    console.log('=' .repeat(60));
    
    if (!MONGODB_URI) {
        console.error('❌ MONGODB_URI non défini');
        process.exit(1);
    }
    
    let client;
    try {
        // Connexion MongoDB
        console.log('\n📊 Connexion à MongoDB...');
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        const db = client.db(dbName);
        const contributionsCollection = db.collection('contributions');
        
        // Récupérer les contributions de Habib Lteif DP2
        console.log('\n📥 Récupération des contributions Habib Lteif DP2 garçons...');
        const contributions = await contributionsCollection.find({
            studentSelected: 'Habib Lteif',
            classSelected: 'DP2',
            sectionSelected: 'garçons'
        }).toArray();
        
        console.log(`✅ ${contributions.length} contributions trouvées`);
        contributions.forEach((c, i) => {
            console.log(`   ${i + 1}. ${c.subjectSelected}`);
        });
        
        if (contributions.length === 0) {
            console.log('\n⚠️  Aucune contribution trouvée. Test avec données simulées.');
            contributions.push({
                studentSelected: 'Habib Lteif',
                classSelected: 'DP2',
                sectionSelected: 'garçons',
                subjectSelected: 'Mathématiques AA (NS)',
                teacherName: 'Test Teacher',
                criteriaA_name: 'Connaissances',
                criteriaA_sem1: 5,
                criteriaA_sem2: 6
            });
        }
        
        // Test génération Word
        console.log('\n📝 Génération du document Word...');
        const templatePath = path.join(__dirname, 'public/templates/modele-dp.docx');
        
        if (!fs.existsSync(templatePath)) {
            console.error(`❌ Template non trouvé: ${templatePath}`);
            process.exit(1);
        }
        
        console.log(`📁 Template: ${templatePath}`);
        const templateContent = fs.readFileSync(templatePath);
        console.log(`✅ Template chargé: ${templateContent.length} bytes`);
        
        // Créer le document SANS module d'images
        const zip = new PizZip(templateContent);
        const doc = new DocxTemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
            nullGetter: () => ""
        });
        
        // Données simplifiées
        const documentData = {
            studentSelected: 'Habib Lteif',
            className: 'DP2',
            studentBirthdate: '2008-05-15',
            contributionsBySubject: contributions.map(c => ({
                subjectSelected: c.subjectSelected,
                teacherName: c.teacherName,
                criteriaA_name: c.criteriaA_name || 'Critère A',
                criteriaA_sem1: c.criteriaA_sem1 || '',
                criteriaA_sem2: c.criteriaA_sem2 || '',
                criteriaB_name: c.criteriaB_name || 'Critère B',
                criteriaB_sem1: c.criteriaB_sem1 || '',
                criteriaB_sem2: c.criteriaB_sem2 || ''
            }))
        };
        
        console.log(`\n🔄 Rendu du document avec ${documentData.contributionsBySubject.length} contributions...`);
        doc.render(documentData);
        console.log('✅ Document rendu avec succès');
        
        // Générer le buffer avec compression STORE
        console.log('\n🔄 Génération du buffer final...');
        const buffer = doc.getZip().generate({
            type: "nodebuffer",
            compression: "STORE",
            compressionOptions: { level: 0 }
        });
        console.log(`✅ Buffer généré: ${buffer.length} bytes`);
        
        // Sauvegarder le fichier de test
        const outputPath = path.join(__dirname, 'TEST_Habib_Lteif_DP2.docx');
        fs.writeFileSync(outputPath, buffer);
        console.log(`\n💾 Document de test sauvegardé: ${outputPath}`);
        console.log('✅ Ouvrez ce fichier dans Word pour vérifier qu\'il s\'ouvre correctement');
        
        console.log('\n' + '='.repeat(60));
        console.log('✅ TEST RÉUSSI - Document Word généré sans erreur');
        console.log('🔍 Vérifiez que le fichier s\'ouvre dans Word');
        
    } catch (error) {
        console.error('\n❌ ERREUR:', error.message);
        console.error(error.stack);
        process.exit(1);
    } finally {
        if (client) {
            await client.close();
            console.log('\n🔌 Connexion MongoDB fermée');
        }
    }
}

testWordGeneration();
