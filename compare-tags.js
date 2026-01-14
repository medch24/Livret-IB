// Balises extraites du template Word
const templateTags = [
    "{#atlSummaryTable}",
    "{#contributionsBySubject}",
    "{/atlSummaryTable}",
    "{/contributionsBySubject}",
    "{autogestion}",
    "{className}",
    "{collaboration}",
    "{communication}",
    "{criteriaA.sem1}",
    "{criteriaA.sem2}",
    "{criteriaB.sem1}",
    "{criteriaB.sem2}",
    "{criteriaC.sem1}",
    "{criteriaC.sem2}",
    "{criteriaD.sem1}",
    "{criteriaD.sem2}",
    "{criteriaKey.A}",
    "{criteriaKey.B}",
    "{criteriaKey.C}",
    "{criteriaKey.D}",
    "{criteriaName A}",
    "{criteriaName B}",
    "{criteriaName C}",
    "{criteriaName D}",
    "{finalLevel.A}",
    "{finalLevel.B}",
    "{finalLevel.C}",
    "{finalLevel.D}",
    "{image}",
    "{note}",
    "{recherche}",
    "{reflexion}",
    "{seuil}",
    "{studentBirthdate}",
    "{studentSelected}",
    "{subject}",
    "{subjectSelected}",
    "{teacherComment}",
    "{teacherName}"
];

// Données envoyées par le code (structure)
const codeData = {
    // Niveau racine
    root: ["studentSelected", "studentBirthdate", "className", "image"],
    
    // Dans contributionsBySubject (boucle)
    contributionsBySubject: [
        "teacherName",
        "subjectSelected",
        "subject",
        "teacherComment",
        "criteriaName A",
        "criteriaName B",
        "criteriaName C",
        "criteriaName D",
        "criteriaA.sem1",
        "criteriaA.sem2",
        "criteriaA.finalLevel",
        "criteriaB.sem1",
        "criteriaB.sem2",
        "criteriaB.finalLevel",
        "criteriaC.sem1",
        "criteriaC.sem2",
        "criteriaC.finalLevel",
        "criteriaD.sem1",
        "criteriaD.sem2",
        "criteriaD.finalLevel",
        "criteriaKey.A",
        "criteriaKey.B",
        "criteriaKey.C",
        "criteriaKey.D",
        "finalLevel.A",
        "finalLevel.B",
        "finalLevel.C",
        "finalLevel.D",
        "communication",
        "collaboration",
        "autogestion",
        "recherche",
        "reflexion",
        "note",
        "seuil"
    ]
};

console.log('🔍 ANALYSE DES BALISES TEMPLATE vs CODE\n');
console.log('============================================================');

console.log('\n📋 PROBLÈMES IDENTIFIÉS:\n');

// Problème 1: criteriaA.finalLevel vs finalLevel.A
console.log('❌ ERREUR 1: Structure des critères incompatible');
console.log('   Template demande: {finalLevel.A}, {finalLevel.B}, etc.');
console.log('   Code envoie dans contributionsBySubject:');
console.log('     - criteriaA: { sem1, sem2, finalLevel }');
console.log('     - criteriaB: { sem1, sem2, finalLevel }');
console.log('   ➜ Le template cherche finalLevel.A mais trouve criteriaA.finalLevel\n');

// Problème 2: Les balises sont dans la boucle mais doivent être accessibles
console.log('❌ ERREUR 2: Portée des balises');
console.log('   Les balises {criteriaA.sem1}, {criteriaB.sem2}, etc.');
console.log('   sont DANS la boucle #contributionsBySubject');
console.log('   mais le code les envoie aussi dans la boucle');
console.log('   ➜ Correct mais format incompatible\n');

console.log('============================================================');
console.log('\n✅ SOLUTION:\n');
console.log('Le code doit envoyer les données dans CE format:');
console.log(`
contributionsBySubject: [
  {
    teacherName: "Prof",
    subjectSelected: "Mathématiques",
    subject: "Mathématiques",
    
    // Critères avec accès direct (pas d'objet imbriqué)
    'criteriaA.sem1': '6',
    'criteriaA.sem2': '7',
    'criteriaB.sem1': '5',
    'criteriaB.sem2': '6',
    'criteriaC.sem1': '7',
    'criteriaC.sem2': '7',
    'criteriaD.sem1': '6',
    'criteriaD.sem2': '8',
    
    // Niveaux finaux accessibles par finalLevel.X
    'finalLevel.A': '7',
    'finalLevel.B': '6',
    'finalLevel.C': '7',
    'finalLevel.D': '7',
    
    // Clés des critères
    'criteriaKey.A': 'A',
    'criteriaKey.B': 'B',
    'criteriaKey.C': 'C',
    'criteriaKey.D': 'D',
    
    // Noms des critères
    'criteriaName A': 'Connaissances et compréhension',
    'criteriaName B': 'Investigation de concepts',
    
    // ATL
    communication: '3',
    collaboration: '2',
    autogestion: '3',
    recherche: '2',
    reflexion: '3',
    
    note: '27',
    seuil: '28',
    teacherComment: 'Excellent travail'
  }
]
`);

console.log('\n============================================================\n');
