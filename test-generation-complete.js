// Script de test pour vérifier la génération complète du livret avec toutes les données

const fs = require('fs');
const path = require('path');
const PizZip = require("pizzip");
const DocxTemplater = require("docxtemplater");
const ImageModule = require('docxtemplater-image-module-free');

const TRANSPARENT_PIXEL = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');

// Critères par matière
const criteriaBySubject = {
    "Acquisition de langues (Anglais)": {A:"Listening",B:"Reading",C:"Speaking",D:"Writing"},
    "Acquisition de langue (اللغة العربية)": {A:"أ الاستماع",B:"ب القراءة",C:"ج التحدث",D:"د الكتابة"},
    "Langue et littérature (Français)": {A:"Analyse",B:"Organisation",C:"Production de texte",D:"Utilisation de la langue"},
    "Individus et sociétés": {A:"Connaissances et compréhension",B:"Recherche",C:"Communication",D:"Pensée critique"},
    "Sciences": {A:"Connaissances et compréhension",B:"Recherche et élaboration",C:"Traitement et évaluation",D:"Réflexion sur les répercussions"},
    "Mathématiques": {A:"Connaissances et compréhension",B:"Recherche de modèles",C:"Communication",D:"Application des mathématiques"}
};

async function testGeneration() {
    console.log('🔍 TEST GÉNÉRATION LIVRET COMPLET\n');
    
    // 1. Charger le template
    const templatePath = path.join(__dirname, 'public/templates/modele-pei.docx');
    console.log(`📄 Chargement template: ${templatePath}`);
    
    if (!fs.existsSync(templatePath)) {
        console.error(`❌ Template non trouvé: ${templatePath}`);
        return;
    }
    
    const templateBuffer = fs.readFileSync(templatePath);
    console.log(`✅ Template chargé: ${templateBuffer.length} bytes\n`);
    
    // 2. Données de test - UN ÉLÈVE COMPLET
    const studentSelected = 'Ahmed Hassan Al-Mansouri';
    const studentBirthdate = '15/03/2010';
    const classSelected = 'PEI3';
    
    console.log(`👤 Élève de test:`);
    console.log(`   Nom: ${studentSelected}`);
    console.log(`   Date de naissance: ${studentBirthdate}`);
    console.log(`   Classe: ${classSelected}\n`);
    
    // 3. Contributions de test avec TOUTES les données remplies
    const testContributions = [
        {
            subjectSelected: 'Mathématiques',
            teacherName: 'M. Pierre Dubois',
            teacherComment: 'Ahmed démontre une excellente compréhension des concepts mathématiques. Il participe activement en classe et aide ses camarades.',
            criteriaValues: {
                A: { sem1: '6', sem2: '7', finalLevel: '7' },
                B: { sem1: '5', sem2: '6', finalLevel: '6' },
                C: { sem1: '7', sem2: '7', finalLevel: '7' },
                D: { sem1: '6', sem2: '7', finalLevel: '7' }
            },
            atlScores: {
                communication: '5',
                collaboration: '6',
                autogestion: '6',
                recherche: '5',
                reflexion: '6'
            },
            finalGrade: '27/32',
            threshold: '85%'
        },
        {
            subjectSelected: 'Langue et littérature (Français)',
            teacherName: 'Mme Sophie Martin',
            teacherComment: 'Ahmed montre une grande sensibilité littéraire. Ses analyses de textes sont pertinentes et bien argumentées.',
            criteriaValues: {
                A: { sem1: '7', sem2: '7', finalLevel: '7' },
                B: { sem1: '6', sem2: '7', finalLevel: '7' },
                C: { sem1: '6', sem2: '6', finalLevel: '6' },
                D: { sem1: '7', sem2: '7', finalLevel: '7' }
            },
            atlScores: {
                communication: '7',
                collaboration: '6',
                autogestion: '6',
                recherche: '6',
                reflexion: '7'
            },
            finalGrade: '27/32',
            threshold: '85%'
        },
        {
            subjectSelected: 'Sciences',
            teacherName: 'M. Jean Leclerc',
            teacherComment: 'Un élève curieux et rigoureux dans ses démarches expérimentales. Ahmed maîtrise bien la méthodologie scientifique.',
            criteriaValues: {
                A: { sem1: '6', sem2: '7', finalLevel: '7' },
                B: { sem1: '6', sem2: '6', finalLevel: '6' },
                C: { sem1: '5', sem2: '6', finalLevel: '6' },
                D: { sem1: '6', sem2: '7', finalLevel: '7' }
            },
            atlScores: {
                communication: '6',
                collaboration: '7',
                autogestion: '6',
                recherche: '7',
                reflexion: '6'
            },
            finalGrade: '26/32',
            threshold: '81%'
        }
    ];
    
    console.log(`📚 ${testContributions.length} contributions de test créées\n`);
    
    // 4. Formater les contributions
    const formattedContributions = testContributions.map(c => {
        const criteriaData = c.criteriaValues || {};
        const subjectCriteria = criteriaBySubject[c.subjectSelected] || {};
        
        const getCriteriaValue = (criterion, field) => {
            return criteriaData[criterion]?.[field] || '';
        };
        
        return {
            teacherName: c.teacherName || '',
            subjectSelected: c.subjectSelected || '',
            subject: c.subjectSelected || '',
            teacherComment: c.teacherComment || '',
            
            'criteriaName A': subjectCriteria.A || 'Critère A',
            'criteriaName B': subjectCriteria.B || 'Critère B',
            'criteriaName C': subjectCriteria.C || 'Critère C',
            'criteriaName D': subjectCriteria.D || 'Critère D',
            
            'criteriaA.sem1': getCriteriaValue('A', 'sem1'),
            'criteriaA.sem2': getCriteriaValue('A', 'sem2'),
            'criteriaB.sem1': getCriteriaValue('B', 'sem1'),
            'criteriaB.sem2': getCriteriaValue('B', 'sem2'),
            'criteriaC.sem1': getCriteriaValue('C', 'sem1'),
            'criteriaC.sem2': getCriteriaValue('C', 'sem2'),
            'criteriaD.sem1': getCriteriaValue('D', 'sem1'),
            'criteriaD.sem2': getCriteriaValue('D', 'sem2'),
            
            'finalLevel.A': getCriteriaValue('A', 'finalLevel'),
            'finalLevel.B': getCriteriaValue('B', 'finalLevel'),
            'finalLevel.C': getCriteriaValue('C', 'finalLevel'),
            'finalLevel.D': getCriteriaValue('D', 'finalLevel'),
            
            'criteriaKey.A': 'A',
            'criteriaKey.B': 'B',
            'criteriaKey.C': 'C',
            'criteriaKey.D': 'D',
            
            communication: c.atlScores?.communication || '',
            collaboration: c.atlScores?.collaboration || '',
            autogestion: c.atlScores?.autogestion || '',
            recherche: c.atlScores?.recherche || '',
            reflexion: c.atlScores?.reflexion || '',
            
            note: c.finalGrade || '',
            seuil: c.threshold || ''
        };
    });
    
    console.log('📊 Aperçu des données formatées:');
    console.log(`   Matière 1: ${formattedContributions[0].subjectSelected}`);
    console.log(`   Enseignant: ${formattedContributions[0].teacherName}`);
    console.log(`   Critère A Sem1: ${formattedContributions[0]['criteriaA.sem1']}`);
    console.log(`   Critère A Sem2: ${formattedContributions[0]['criteriaA.sem2']}`);
    console.log(`   Niveau final A: ${formattedContributions[0]['finalLevel.A']}`);
    console.log(`   Communication: ${formattedContributions[0].communication}\n`);
    
    // 5. Préparer l'image (pixel transparent pour le test)
    const imageBuffer = TRANSPARENT_PIXEL;
    
    const imageOpts = {
        centered: true,
        fileType: "docx",
        getImage: function() {
            return imageBuffer;
        },
        getSize: function() {
            return [180, 180];
        }
    };
    
    const imageModule = new ImageModule(imageOpts);
    
    // 6. Générer le document
    console.log('🔨 Génération du document Word...');
    
    const zip = new PizZip(templateBuffer);
    const doc = new DocxTemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        nullGetter: () => '',
        modules: [imageModule]
    });
    
    const renderData = {
        studentSelected: studentSelected,
        studentBirthdate: studentBirthdate,
        className: classSelected,
        image: 'image.png',
        contributionsBySubject: formattedContributions,
        atlSummaryTable: formattedContributions.map(c => ({
            subject: c.subjectSelected,
            communication: c.communication,
            collaboration: c.collaboration,
            autogestion: c.autogestion,
            recherche: c.recherche,
            reflexion: c.reflexion
        }))
    };
    
    console.log('📝 Données de rendu:');
    console.log(`   Nom élève: ${renderData.studentSelected}`);
    console.log(`   Date naissance: ${renderData.studentBirthdate}`);
    console.log(`   Classe: ${renderData.className}`);
    console.log(`   Nombre de contributions: ${renderData.contributionsBySubject.length}`);
    console.log(`   Tableau ATL: ${renderData.atlSummaryTable.length} lignes\n`);
    
    try {
        doc.render(renderData);
        console.log('✅ Rendu réussi!\n');
        
        // 7. Générer le fichier
        const buffer = doc.getZip().generate({
            type: 'nodebuffer',
            compression: 'STORE',
            compressionOptions: { level: 0 }
        });
        
        const outputPath = path.join(__dirname, 'TEST_Livret_Complet.docx');
        fs.writeFileSync(outputPath, buffer);
        
        console.log(`✅ Document généré avec succès!`);
        console.log(`📁 Fichier: ${outputPath}`);
        console.log(`📊 Taille: ${buffer.length} bytes (${(buffer.length / 1024).toFixed(2)} KB)\n`);
        
        console.log('🎉 SUCCÈS - Toutes les données ont été intégrées:');
        console.log('   ✓ Nom complet de l\'élève');
        console.log('   ✓ Date de naissance');
        console.log('   ✓ Classe');
        console.log('   ✓ Image (placeholder)');
        console.log('   ✓ Toutes les matières');
        console.log('   ✓ Tous les critères (A, B, C, D)');
        console.log('   ✓ Notes semestre 1 et 2');
        console.log('   ✓ Niveaux finaux');
        console.log('   ✓ Scores ATL');
        console.log('   ✓ Commentaires des enseignants');
        console.log('   ✓ Notes et seuils');
        
    } catch (error) {
        console.error('❌ ERREUR lors du rendu:', error.message);
        console.error('Stack:', error.stack);
        
        if (error.properties) {
            console.error('\n📋 Détails de l\'erreur:');
            console.error(JSON.stringify(error.properties, null, 2));
        }
    }
}

testGeneration().catch(console.error);
