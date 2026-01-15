#!/usr/bin/env node
/**
 * Script pour extraire les balises d'un modèle Word
 */

const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');

const templatePath = process.argv[2] || path.join(__dirname, 'public/templates/modele-pei.docx');

console.log(`📄 Analyse du template: ${templatePath}`);

if (!fs.existsSync(templatePath)) {
    console.error(`❌ Fichier non trouvé: ${templatePath}`);
    process.exit(1);
}

const content = fs.readFileSync(templatePath);
const zip = new PizZip(content);

// Extraire document.xml
const documentXml = zip.file('word/document.xml').asText();

// Rechercher toutes les balises {...}
const tagRegex = /\{([^}]+)\}/g;
const tags = [];
let match;

while ((match = tagRegex.exec(documentXml)) !== null) {
    const tag = match[1];
    if (!tags.includes(tag)) {
        tags.push(tag);
    }
}

console.log(`\n✅ ${tags.length} balises uniques trouvées:\n`);
tags.sort().forEach((tag, i) => {
    console.log(`${i + 1}. {${tag}}`);
});

// Analyser les types de balises
console.log('\n📊 ANALYSE DES BALISES:\n');

const loops = tags.filter(t => t.startsWith('#') || t.startsWith('/'));
const simple = tags.filter(t => !t.startsWith('#') && !t.startsWith('/') && !t.includes('.'));
const nested = tags.filter(t => !t.startsWith('#') && !t.startsWith('/') && t.includes('.'));

console.log(`Boucles (#...): ${loops.length}`);
loops.forEach(t => console.log(`  - {${t}}`));

console.log(`\nBalises simples: ${simple.length}`);
simple.forEach(t => console.log(`  - {${t}}`));

console.log(`\nBalises imbriquées (a.b): ${nested.length}`);
nested.forEach(t => console.log(`  - {${t}}`));
