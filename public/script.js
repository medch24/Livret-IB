// Variables globales
let currentData = {
    contributionId: null,
    teacherName: localStorage.getItem('teacherName') || null,
    classSelected: null,
    sectionSelected: null,
    subjectSelected: null,
    studentSelected: null,
    studentFullName: null,
    studentBirthdate: null,
    studentPhoto: null,
    teacherComment: null,
    communicationEvaluation: ['', '', '', '', ''],
    unitsSem1: 1,
    unitsSem2: 1,
    criteriaValues: {
        A: { sem1: null, sem2: null, finalLevel: null, sem1Units: [], sem2Units: [] },
        B: { sem1: null, sem2: null, finalLevel: null, sem1Units: [], sem2Units: [] },
        C: { sem1: null, sem2: null, finalLevel: null, sem1Units: [], sem2Units: [] },
        D: { sem1: null, sem2: null, finalLevel: null, sem1Units: [], sem2Units: [] },
    }
};

// Données des étudiants - PRÉNOMS (pour la DB) avec mapping vers noms complets
const studentData = {
    // Garçons
    'Faysal': {fullName: 'Faysal Achar', birthdate: '2014-04-15', photo: 'https://lh3.googleusercontent.com/d/1IB6BKROX3TRxaIIHVVVWbB7-iI-V8VrC'},
    'Bilal': {fullName: 'Bilal Molina', birthdate: '2015-02-15', photo: 'https://lh3.googleusercontent.com/d/1B0QUZJhpSad5Fs3qRTugUe4oyT1UDEVu'},
    'Jad': {fullName: 'Jad Mahayni', birthdate: '2014-08-15', photo: 'https://lh3.googleusercontent.com/d/1VLvrWjeJwaC1f4pSaLiwjnS79N-HrsFr'},
    'Manaf': {fullName: 'Manaf Kotbi', birthdate: '2014-08-15', photo: 'https://lh3.googleusercontent.com/d/1h46Tqtqcp5tNqdY62wV6pyZFYknCEMWY'},
    'Ahmed': {fullName: 'Ahmed Bouaziz', birthdate: '2013-09-15', photo: 'https://lh3.googleusercontent.com/d/1cDF-yegSB2tqsWac0AoNttbi8qaALYT1'},
    'Yasser': {fullName: 'Yasser Younes', birthdate: '2013-08-15', photo: 'https://lh3.googleusercontent.com/d/1UUr rAJV_bqFNktGDInDkSrpwSZz-e47T'},
    'Eyad': {fullName: 'Eyad Hassan', birthdate: '2013-04-15', photo: 'https://lh3.googleusercontent.com/d/1HGyWS4cC1jWWD25Ah3NcT_eIBUhqFzJ1'},
    'Ali': {fullName: 'Ali Kutbi', birthdate: '2013-04-15', photo: 'https://lh3.googleusercontent.com/d/1bN-fDf_IWkXoW3WjSOXI5_M4KkL3FDKr'},
    'Seifeddine': {fullName: 'Seifeddine Ayadi', birthdate: '2012-01-15', photo: 'https://lh3.googleusercontent.com/d/1tWdP5btCAsTMB86WzDgqh3Xw01ahm9s6'},
    'Mohamed Chalak': {fullName: 'Mohamed Chalak', birthdate: '2011-11-15', photo: 'https://lh3.googleusercontent.com/d/11B80bG0vQDVT6FITL2y7C5TYmAGyggFn'},
    'Wajih': {fullName: 'Wajih Sabadine', birthdate: '2012-06-15', photo: 'https://lh3.googleusercontent.com/d/1MH6M05mQamOHevnDffVFNpSFNnxqbxs3'},
    'Ahmad': {fullName: 'Ahmad Mahayni', birthdate: '2012-02-15', photo: 'https://lh3.googleusercontent.com/d/1zU-jBuAbYjHanzank9C1BAd00skS1Y5J'},
    'Adam': {fullName: 'Adam Kaaki', birthdate: '2012-12-15', photo: 'https://lh3.googleusercontent.com/d/15I9p6VSnn1yVmPxRRbGsUkM-fsBKY0WF'},
    'Mohamed Younes': {fullName: 'Mohamed Younes', birthdate: '2012-08-15', photo: 'https://lh3.googleusercontent.com/d/1wzraoZY_1RafcDXeaxSBeX5cIU57p4xA'},
    'Mohamed Amine Sgheir': {fullName: 'Mohamed Amine Sgheir', birthdate: '2012-12-15', photo: 'https://lh3.googleusercontent.com/d/1UrBw6quz0oBTUy8C0GeeWis3XAK773BR'},
    'Samir': {fullName: 'Samir Kaaki', birthdate: '2012-12-15', photo: 'https://lh3.googleusercontent.com/d/1NdaCH8CU0DJFHXW4D0lItP-QnCsw123b'},
    'Abdulrahman': {fullName: 'Abdulrahman Bouaziz', birthdate: '2012-04-15', photo: 'https://lh3.googleusercontent.com/d/1ycTO5StU2tnPy0BEYnnWzUve1jMIUcLE'},
    'Youssef': {fullName: 'Youssef Baakak', birthdate: '2011-11-15', photo: 'https://lh3.googleusercontent.com/d/1Bygg5-PYrjjMOZDi5hAe16eZ81tn772e'},
    'Habib': {fullName: 'Habib Lteif', birthdate: '2008-10-15', photo: 'https://lh3.googleusercontent.com/d/13u4y6JIyCBVQ_9PCwyhh837byyK9g8pF'},
    'Salah': {fullName: 'Salah Boumalouga', birthdate: '2008-07-15', photo: 'https://lh3.googleusercontent.com/d/1IG8S_i6jD806C2QD_nwlxrG932QgIVXu'},
    // Filles
    'Yomna Masrouhi': {fullName: 'Yomna Masrouhi', birthdate: '2009-09-07', photo: null},
    'Isra Elalmi': {fullName: 'Isra Elalmi', birthdate: '2008-03-25', photo: null},
    'Naya Sabbidine': {fullName: 'Naya Sabbidine', birthdate: '2014-02-28', photo: null},
    'Israa Alkattan': {fullName: 'Israa Alkattan', birthdate: '2013-09-19', photo: null},
    'Dina Tlili': {fullName: 'Dina Tlili', birthdate: '2012-12-22', photo: null},
};

// Mapping des classes par section
const classesBySection = {
    'garçons': ['PEI1', 'PEI2', 'PEI3', 'PEI4', 'DP2'],
    'filles': ['PEI1', 'PEI2', 'PEI3', 'PEI4', 'PEI5', 'DP1', 'DP2']
};

// Mapping des élèves par classe et section
const studentsByClass = {
    'PEI1-garçons': ['Faysal', 'Bilal', 'Jad', 'Manaf'],
    'PEI2-garçons': ['Ahmed', 'Yasser', 'Eyad', 'Ali'],
    'PEI3-garçons': ['Seifeddine', 'Mohamed Chalak', 'Wajih', 'Ahmad'],
    'PEI4-garçons': ['Adam', 'Mohamed Younes', 'Mohamed Amine Sgheir', 'Samir'],
    'DP2-garçons': ['Abdulrahman', 'Youssef', 'Habib', 'Salah'],
    'PEI1-filles': ['Naya Sabbidine'],
    'PEI2-filles': ['Israa Alkattan'],
    'PEI3-filles': ['Dina Tlili'],
    'PEI4-filles': [],
    'PEI5-filles': ['Yomna Masrouhi'],
    'DP1-filles': ['Isra Elalmi'],
    'DP2-filles': []
};

// Fonctions de gestion de l'interface
function handleSectionChange(section) {
    currentData.sectionSelected = section;
    const step1 = document.getElementById('step1');
    const classSelector = document.getElementById('classSelector');
    
    classSelector.innerHTML = '<option value="">-- Sélectionnez une Classe --</option>';
    classesBySection[section].forEach(cls => {
        const option = document.createElement('option');
        option.value = cls;
        option.textContent = cls;
        classSelector.appendChild(option);
    });
    
    step1.style.display = 'block';
    document.getElementById('step3').style.display = 'none';
    document.getElementById('studentInfo').style.display = 'none';
    step1.scrollIntoView({ behavior: 'smooth' });
}

function handleClassChange(className) {
    if (!className) return;
    currentData.classSelected = className;
    const step3 = document.getElementById('step3');
    const studentSelector = document.getElementById('studentSelector');
    
    const key = `${className}-${currentData.sectionSelected}`;
    const students = studentsByClass[key] || [];
    
    studentSelector.innerHTML = '<option value="">-- Sélectionnez un élève --</option>';
    students.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = studentData[name].fullName;
        studentSelector.appendChild(option);
    });
    
    step3.style.display = 'block';
    document.getElementById('studentInfo').style.display = 'none';
    step3.scrollIntoView({ behavior: 'smooth' });
}

function handleStudentChange(studentName) {
    if (!studentName) return;
    const student = studentData[studentName];
    currentData.studentSelected = studentName;
    currentData.studentFullName = student.fullName;
    currentData.studentBirthdate = student.birthdate;
    currentData.studentPhoto = student.photo;
    
    document.getElementById('displayStudentName').textContent = student.fullName;
    document.getElementById('displayStudentClass').textContent = `${currentData.classSelected} - Section ${currentData.sectionSelected}`;
    
    const infoCard = document.getElementById('studentInfo');
    infoCard.style.display = 'block';
    infoCard.scrollIntoView({ behavior: 'smooth' });
}

async function generateBooklet() {
    const btn = document.getElementById('generateBtn');
    const status = document.getElementById('statusMessage');
    
    try {
        btn.disabled = true;
        btn.textContent = '⌛ Génération...';
        status.textContent = 'Récupération des données...';
        status.className = 'status-message info';
        status.style.display = 'block';

        // Appel API pour récupérer les contributions réelles depuis MongoDB
        // On utilise studentSelected comme ID ou nom pour la recherche
        const contribRes = await fetch(`/api/fetchContributions?studentId=${currentData.studentSelected}`);
        const contributions = await contribRes.json();

        const response = await fetch('/api/generate-booklet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                studentData: {
                    name: currentData.studentFullName,
                    class: currentData.classSelected,
                    section: currentData.sectionSelected,
                    studentId: currentData.studentSelected
                },
                contributions: contributions
            })
        });

        if (!response.ok) throw new Error('Erreur serveur lors de la génération');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Livret-${currentData.studentFullName.replace(/\s+/g, '_')}.docx`;
        document.body.appendChild(a);
        a.click();
        
        status.textContent = 'Livret généré avec succès !';
        status.className = 'status-message success';
    } catch (error) {
        status.textContent = 'Erreur: ' + error.message;
        status.className = 'status-message error';
    } finally {
        btn.disabled = false;
        btn.textContent = '📄 Générer le Livret (Word)';
    }
}

// Fonctions pour les boutons du header
async function generateAllWordsInSection() {
    if (!currentData.classSelected || !currentData.sectionSelected) {
        alert('Veuillez d\'abord sélectionner une section et une classe.');
        return;
    }
    // Implémentation similaire à celle de l'index.html original mais adaptée
    alert('Cette fonctionnalité utilise les données de la classe sélectionnée.');
}

async function generateExcel() {
    if (!currentData.classSelected || !currentData.sectionSelected) {
        alert('Veuillez d\'abord sélectionner une section et une classe.');
        return;
    }
    alert('Export Excel en cours de préparation...');
}
