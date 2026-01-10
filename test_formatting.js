// Script de test pour identifier les propriétés manquantes dans les contributions
// Ce script simule le formatage sans accès à la DB

const testContribution = {
    teacherName: "Mr. Smith",
    subjectName: "Mathématiques",
    approachToLearning: "Pensée créative",
    comments: "Bon travail",
    teacherComment: "Continue comme ça",
    globalContexts: ["Contexte 1", "Contexte 2"],
    communicationEvaluation: ['4', '3', '4', '4', '3'],
    unitsSem1: 2,
    unitsSem2: 2,
    criteriaValues: {
        A: {
            sem1: '5',
            sem2: '6',
            finalLevel: '6',
            sem1Units: ['4', '5'],
            sem2Units: ['5', '6']
        },
        B: {
            sem1: '4',
            sem2: '5',
            finalLevel: '5',
            sem1Units: ['3', '4'],
            sem2Units: ['4', '5']
        },
        C: {
            sem1: null,
            sem2: null,
            finalLevel: null,
            sem1Units: [],
            sem2Units: []
        },
        D: {
            sem1: null,
            sem2: null,
            finalLevel: null,
            sem1Units: [],
            sem2Units: []
        }
    }
};

console.log('🧪 Test du formatage des contributions\n');

// Fonction de formatage (copie depuis api/index.js)
const formatContributions = (contributions) => {
    return contributions.map(c => {
        // Gérer les critères (A, B, C, D)
        const criteriaData = c.criteriaValues || {};
        const formatCriteria = (criterion) => {
            const data = criteriaData[criterion] || {};
            return {
                sem1: data.sem1 || '',
                sem2: data.sem2 || '',
                finalLevel: data.finalLevel || '',
                sem1Units: Array.isArray(data.sem1Units) ? data.sem1Units : [],
                sem2Units: Array.isArray(data.sem2Units) ? data.sem2Units : []
            };
        };

        return {
            teacherName: c.teacherName || 'N/A',
            subjectName: c.subjectName || 'N/A',
            approachToLearning: c.approachToLearning || 'N/A',
            comments: c.comments || '',
            teacherComment: c.teacherComment || '',
            globalContexts: Array.isArray(c.globalContexts) ? c.globalContexts : [],
            
            // Communication evaluation (tableau de 5 valeurs)
            communicationEvaluation: Array.isArray(c.communicationEvaluation) 
                ? c.communicationEvaluation 
                : ['', '', '', '', ''],
            
            // Nombre d'unités
            unitsSem1: c.unitsSem1 || 1,
            unitsSem2: c.unitsSem2 || 1,
            
            // Critères formatés
            criteriaA: formatCriteria('A'),
            criteriaB: formatCriteria('B'),
            criteriaC: formatCriteria('C'),
            criteriaD: formatCriteria('D'),
            
            // Valeurs des critères (pour compatibilité)
            criteriaValues: {
                A: formatCriteria('A'),
                B: formatCriteria('B'),
                C: formatCriteria('C'),
                D: formatCriteria('D')
            }
        };
    });
};

const formatted = formatContributions([testContribution]);

console.log('✅ Contribution formatée:');
console.log(JSON.stringify(formatted[0], null, 2));

console.log('\n📊 Vérification des propriétés:\n');

const checkProperty = (obj, path) => {
    const value = path.split('.').reduce((o, key) => o?.[key], obj);
    const status = value !== undefined ? '✅' : '❌';
    console.log(`${status} ${path}: ${JSON.stringify(value)}`);
    return value !== undefined;
};

const properties = [
    'teacherName',
    'subjectName',
    'approachToLearning',
    'comments',
    'teacherComment',
    'globalContexts',
    'communicationEvaluation',
    'unitsSem1',
    'unitsSem2',
    'criteriaA',
    'criteriaA.sem1',
    'criteriaA.sem2',
    'criteriaA.finalLevel',
    'criteriaA.sem1Units',
    'criteriaA.sem2Units',
    'criteriaValues',
    'criteriaValues.A',
    'criteriaValues.A.sem1',
    'criteriaValues.B',
    'criteriaValues.C',
    'criteriaValues.D'
];

let allPresent = true;
properties.forEach(prop => {
    if (!checkProperty(formatted[0], prop)) {
        allPresent = false;
    }
});

console.log(`\n${allPresent ? '✅' : '❌'} Toutes les propriétés sont présentes: ${allPresent}`);
