#!/usr/bin/env node
/**
 * Test génération Word avec le vrai modèle
 */

require('dotenv').config({ path: ['.env.local', '.env.production', '.env'] });
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
const PizZip = require("pizzip");
const DocxTemplater = require("docxtemplater");

const MONGODB_URI = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'teacherContributionsDB';

// Critères par matière
const criteriaBySubject = {
    "Acquisition de langues (Anglais)":{A:"Listening",B:"Reading",C:"Speaking",D:"Writing"},
    "Acquisition de langue (اللغة العربية)":{A:"أ الاستماع",B:"ب القراءة",C:"ج التحدث",D:"د الكتابة"},
    "Langue et littérature (Français)":{A:"Analyse",B:"Organisation",C:"Production de texte",D:"Utilisation de la langue"},
    "Individus et sociétés":{A:"Connaissances et compréhension",B:"Recherche",C:"Communication",D:"Pensée critique"},
    "Sciences":{A:"Connaissances et compréhension",B:"Recherche et élaboration",C:"Traitement et évaluation",D:"Réflexion sur les répercussions"},
    "Mathématiques":{A:"Connaissances et compréhension",B:"Recherche de modèles",C:"Communication",D:"Application des mathématiques"},
    "Arts":{A:"Connaissances et compréhension",B:"Développement des compétences",C:"Pensée créative",D:"Réaction"},
    "Éducation physique et à la santé":{A:"Connaissances et compréhension",B:"Planification",C:"Application et exécution",D:"Réflexion et amélioration"},
    "Design":{A:"Recherche et analyse",B:"Développement des idées",C:"Création de la solution",D:"Évaluation"},
};

async function testGeneration() {
    console.log('🧪 TEST GÉNÉRATION AVEC VRAI MODÈLE');
    console.log('='.repeat(70));
    
    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        const db = client.db(dbName);
        const contributionsCollection = db.collection('contributions');
        const studentsCollection = db.collection('students');
        
        // Paramètres du test
        const studentSelected = 'Habib';
        const classSelected = 'DP2';
        const sectionSelected = 'garçons';
        
        console.log(`\n📋 Élève: ${studentSelected} - ${classSelected} ${sectionSelected}`);
        
        // 1. Récupérer contributions
        const contributions = await contributionsCollection.find({
            studentSelected,
            classSelected,
            sectionSelected
        }).toArray();
        
        console.log(`\n📚 ${contributions.length} contributions trouvées:`);
        contributions.forEach((c, i) => {
            console.log(`   ${i + 1}. ${c.subjectSelected}`);
        });
        
        if (contributions.length === 0) {
            console.error('\n❌ Aucune contribution trouvée!');
            process.exit(1);
        }
        
        // 2. Récupérer date de naissance
        const studentInfo = await studentsCollection.findOne({ studentSelected });
        const studentBirthdate = studentInfo?.studentBirthdate || 'N/A';
        
        // 3. Formater les contributions
        const formattedContributions = contributions.map(c => {
            const subjectCriteria = criteriaBySubject[c.subjectSelected] || {};
            
            return {
                // Informations de base
                teacherName: c.teacherName || '',
                subjectSelected: c.subjectSelected || '',
                subject: c.subjectSelected || '',
                teacherComment: c.teacherComment || c.comments || '',
                
                // Noms des critères (avec espace!)
                'criteriaName A': subjectCriteria.A || 'Critère A',
                'criteriaName B': subjectCriteria.B || 'Critère B',
                'criteriaName C': subjectCriteria.C || 'Critère C',
                'criteriaName D': subjectCriteria.D || 'Critère D',
                
                // Valeurs des critères
                'criteriaA.sem1': c.criteriaA_sem1 || '',
                'criteriaA.sem2': c.criteriaA_sem2 || '',
                'criteriaB.sem1': c.criteriaB_sem1 || '',
                'criteriaB.sem2': c.criteriaB_sem2 || '',
                'criteriaC.sem1': c.criteriaC_sem1 || '',
                'criteriaC.sem2': c.criteriaC_sem2 || '',
                'criteriaD.sem1': c.criteriaD_sem1 || '',
                'criteriaD.sem2': c.criteriaD_sem2 || '',
                
                // Niveaux finaux
                'finalLevel.A': c.criteriaA_final || '',
                'finalLevel.B': c.criteriaB_final || '',
                'finalLevel.C': c.criteriaC_final || '',
                'finalLevel.D': c.criteriaD_final || '',
                
                // Clés des critères
                'criteriaKey.A': 'A',
                'criteriaKey.B': 'B',
                'criteriaKey.C': 'C',
                'criteriaKey.D': 'D',
                
                // ATL
                communication: c.atlScores?.communication || '',
                collaboration: c.atlScores?.collaboration || '',
                autogestion: c.atlScores?.autogestion || '',
                recherche: c.atlScores?.recherche || '',
                reflexion: c.atlScores?.reflexion || '',
                
                // Note et seuil
                note: c.finalGrade || '',
                seuil: c.threshold || ''
            };
        });
        
        // 4. Données finales
        const renderData = {
            studentSelected: studentSelected,
            studentBirthdate: studentBirthdate,
            className: classSelected,
            image: '',
            contributionsBySubject: formattedContributions,
            atlSummaryTable: formattedContributions
        };
        
        console.log(`\n📊 Données préparées:`);
        console.log(`   - studentSelected: ${renderData.studentSelected}`);
        console.log(`   - studentBirthdate: ${renderData.studentBirthdate}`);
        console.log(`   - className: ${renderData.className}`);
        console.log(`   - contributionsBySubject: ${renderData.contributionsBySubject.length} items`);
        
        // Afficher un exemple de contribution
        if (renderData.contributionsBySubject.length > 0) {
            const example = renderData.contributionsBySubject[0];
            console.log(`\n📋 Exemple contribution 1:`);
            console.log(`   - subjectSelected: ${example.subjectSelected}`);
            console.log(`   - teacherName: ${example.teacherName}`);
            console.log(`   - criteriaName A: ${example['criteriaName A']}`);
            console.log(`   - criteriaA.sem1: ${example['criteriaA.sem1']}`);
        }
        
        // 5. Charger le template
        const templatePath = path.join(__dirname, 'public/templates/modele-pei.docx');
        console.log(`\n📄 Chargement template: ${templatePath}`);
        
        if (!fs.existsSync(templatePath)) {
            throw new Error(`Template non trouvé: ${templatePath}`);
        }
        
        const templateBuffer = fs.readFileSync(templatePath);
        console.log(`✅ Template chargé: ${templateBuffer.length} bytes`);
        
        // 6. Générer le document
        const zip = new PizZip(templateBuffer);
        const doc = new DocxTemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
            nullGetter: () => ''
        });
        
        console.log(`\n🔄 Rendu du document...`);
        doc.render(renderData);
        console.log(`✅ Document rendu`);
        
        // 7. Générer le buffer
        const buffer = doc.getZip().generate({
            type: 'nodebuffer',
            compression: 'STORE',
            compressionOptions: { level: 0 }
        });
        
        console.log(`✅ Buffer généré: ${buffer.length} bytes`);
        
        // 8. Sauvegarder
        const outputPath = path.join(__dirname, `TEST_${studentSelected}_${classSelected}_FINAL.docx`);
        fs.writeFileSync(outputPath, buffer);
        
        console.log(`\n💾 Document sauvegardé: ${outputPath}`);
        console.log(`\n✅ TEST RÉUSSI!`);
        console.log(`🔍 Ouvrez ${outputPath} dans Word pour vérifier`);
        
    } catch (error) {
        console.error('\n❌ ERREUR:', error.message);
        console.error(error.stack);
        process.exit(1);
    } finally {
        await client.close();
    }
}

testGeneration();
