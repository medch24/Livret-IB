// Script pour vérifier le contenu du document généré

const fs = require('fs');
const path = require('path');
const PizZip = require("pizzip");

function extractTextFromDocx(filePath) {
    console.log(`📄 Analyse du document: ${filePath}\n`);
    
    const content = fs.readFileSync(filePath);
    const zip = new PizZip(content);
    
    // Extraire le contenu textuel de document.xml
    const documentXml = zip.files["word/document.xml"];
    if (!documentXml) {
        console.error('❌ Impossible de trouver word/document.xml');
        return;
    }
    
    const xmlContent = documentXml.asText();
    
    // Extraire tous les textes entre <w:t> et </w:t>
    const textMatches = xmlContent.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
    if (!textMatches) {
        console.error('❌ Aucun texte trouvé dans le document');
        return;
    }
    
    const texts = textMatches.map(match => {
        const textMatch = match.match(/>([^<]+)</);
        return textMatch ? textMatch[1] : '';
    });
    
    const fullText = texts.join(' ');
    
    console.log('🔍 VÉRIFICATION DES DONNÉES:\n');
    
    // Vérifier la présence des données clés
    const checks = [
        { name: 'Nom de l\'élève', text: 'Ahmed Hassan Al-Mansouri', required: true },
        { name: 'Date de naissance', text: '15/03/2010', required: true },
        { name: 'Classe', text: 'PEI3', required: true },
        { name: 'Matière 1', text: 'Mathématiques', required: true },
        { name: 'Enseignant 1', text: 'M. Pierre Dubois', required: true },
        { name: 'Matière 2', text: 'Langue et littérature', required: true },
        { name: 'Enseignant 2', text: 'Mme Sophie Martin', required: true },
        { name: 'Matière 3', text: 'Sciences', required: true },
        { name: 'Enseignant 3', text: 'M. Jean Leclerc', required: true },
        { name: 'Commentaire enseignant', text: 'excellente compréhension', required: false },
        { name: 'Note critère A Sem1', text: '6', required: false },
        { name: 'Note critère A Sem2', text: '7', required: false }
    ];
    
    let allPassed = true;
    
    checks.forEach(check => {
        const found = fullText.includes(check.text);
        const status = found ? '✅' : (check.required ? '❌' : '⚠️');
        console.log(`${status} ${check.name}: ${found ? 'TROUVÉ' : 'NON TROUVÉ'}`);
        
        if (!found && check.required) {
            allPassed = false;
        }
    });
    
    console.log('\n📊 STATISTIQUES:\n');
    console.log(`   Longueur totale du texte: ${fullText.length} caractères`);
    console.log(`   Nombre d'éléments de texte: ${texts.length}`);
    
    // Recherche de patterns de balises non remplacées
    const unreplacedTags = fullText.match(/\{[^\}]+\}/g);
    if (unreplacedTags && unreplacedTags.length > 0) {
        console.log('\n⚠️ BALISES NON REMPLACÉES DÉTECTÉES:');
        const uniqueTags = [...new Set(unreplacedTags)];
        uniqueTags.forEach(tag => {
            console.log(`   - ${tag}`);
        });
    } else {
        console.log('\n✅ Aucune balise non remplacée détectée');
    }
    
    console.log('\n' + (allPassed ? '🎉 SUCCÈS - Toutes les données requises sont présentes!' : '❌ ÉCHEC - Des données requises sont manquantes'));
    
    // Extraire un aperçu du début du document
    console.log('\n📄 APERÇU DU DÉBUT DU DOCUMENT (500 premiers caractères):');
    console.log(fullText.substring(0, 500) + '...\n');
}

const testFilePath = path.join(__dirname, 'TEST_Livret_Complet.docx');

if (!fs.existsSync(testFilePath)) {
    console.error(`❌ Fichier non trouvé: ${testFilePath}`);
} else {
    extractTextFromDocx(testFilePath);
}
