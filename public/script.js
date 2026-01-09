// Variables globales
let currentData = {
    contributionId: null,
    teacherName: localStorage.getItem('teacherName') || null,
    classSelected: null,
    sectionSelected: null, // Pas d'auto-sélection
    subjectSelected: null,
    studentSelected: null,
    studentBirthdate: null,
    studentPhoto: null,
    teacherComment: null,
    communicationEvaluation: ['', '', '', '', ''],
    unitsSem1: 1,
    unitsSem2: 1,
    criteriaValues: {
        A: {sem1: null, sem2: null, finalLevel: null, sem1Units: [], sem2Units: []},
        B: {sem1: null, sem2: null, finalLevel: null, sem1Units: [], sem2Units: []},
        C: {sem1: null, sem2: null, finalLevel: null, sem1Units: [], sem2Units: []},
        D: {sem1: null, sem2: null, finalLevel: null, sem1Units: [], sem2Units: []}
    }
};

let currentContributionId = null;

// Éléments DOM
const progressBarContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const studentInfoContainer = document.getElementById('studentInfoContainer');
const contributionEntrySections = document.getElementById('contributionEntrySections');
const submitButton = document.getElementById('submitButton');
const teacherNameInput = document.getElementById('teacherName');
const classSelector = document.getElementById('classSelector');
const studentSelector = document.getElementById('studentSelector');
const subjectSelector = document.getElementById('subjectSelector');
const dataContainer = document.getElementById('dataContainer');
const studentBirthdateInput = document.getElementById('studentBirthdate');

// Données des étudiants - PRÉNOMS (pour la DB) avec mapping vers noms complets
const studentData = {
    // Garçons - Tous avec nom complet
    'Faysal': {fullName: 'Faysal Achar', birthdate: '2014-04-15', photo: 'https://lh3.googleusercontent.com/d/1IB6BKROX3TRxaIIHVVVWbB7-Ii-V8VrC'},
    'Bilal': {fullName: 'Bilal Molina', birthdate: '2015-02-15', photo: 'https://lh3.googleusercontent.com/d/1B0QUZJhpSad5Fs3qRTugUe4oyTlUDEVu'},
    'Jad': {fullName: 'Jad Mahayni', birthdate: '2014-08-15', photo: 'https://lh3.googleusercontent.com/d/1VLvrWjeJwaClf4pSaLiwjnS79N-HrsFr'},
    'Manaf': {fullName: 'Manaf Kotbi', birthdate: '2014-08-15', photo: 'https://lh3.googleusercontent.com/d/1h46Tqtqcp5tNqdY62wV6pyZFYknCEMWY'},
    'Ahmed': {fullName: 'Ahmed Bouaziz', birthdate: '2013-09-15', photo: 'https://lh3.googleusercontent.com/d/1cDF-yegSB2tqsWac0AoNttbi8qAALYT1'},
    'Yasser': {fullName: 'Yasser Younes', birthdate: '2013-08-15', photo: 'https://lh3.googleusercontent.com/d/1UUrrAJV_bgFNktGDinDkSrpwSZz-e47T'},
    'Eyad': {fullName: 'Eyad Hassan', birthdate: '2013-04-15', photo: 'https://lh3.googleusercontent.com/d/1HGyWS4cC1jWWD25Ah3WcT_eIbUHqFzJ1'},
    'Ali': {fullName: 'Ali Kutbi', birthdate: '2013-04-15', photo: 'https://lh3.googleusercontent.com/d/1bN-fDf_IWkXoW3WjSOXI5_M4KkL3FDKr'},
    'Seifeddine': {fullName: 'Seifeddine Ayadi', birthdate: '2012-01-15', photo: 'https://lh3.googleusercontent.com/d/1tWdPSbtCAsTMB86WzDgqh3Xw01ahm9s6'},
    'Mohamed Chalak': {fullName: 'Mohamed Chalak', birthdate: '2011-11-15', photo: 'https://lh3.googleusercontent.com/d/1lB8ObGOvQDVT6FITL2y7C5TYmAGyggFn'},
    'Wajih': {fullName: 'Wajih Sabadine', birthdate: '2012-06-15', photo: 'https://lh3.googleusercontent.com/d/1MH6M05mQamOHevmDffVFNpSFNnxqbxs3'},
    'Ahmad': {fullName: 'Ahmad Mahayni', birthdate: '2012-02-15', photo: 'https://lh3.googleusercontent.com/d/1zU-jBuAbYjHanzank9C1BAd00skS1Y5J'},
    'Adam': {fullName: 'Adam Kaaki', birthdate: '2012-12-15', photo: 'https://lh3.googleusercontent.com/d/15I9p6VSnn1yVmPxRRbGsUkM-fsBKYOWF'},
    'Mohamed Younes': {fullName: 'Mohamed Younes', birthdate: '2011-11-15', photo: 'https://lh3.googleusercontent.com/d/1wzraoZY_lRafcDXeaxSBeX5cIU57p4xA'},
    'Mohamed Amine Sgheir': {fullName: 'Mohamed Amine Sgheir', birthdate: '2012-12-15', photo: 'https://lh3.googleusercontent.com/d/1UrBw6guz0oBTUy8COGeewIs3XAK773bR'},
    'Samir': {fullName: 'Samir Kaaki', birthdate: '2012-12-15', photo: 'https://lh3.googleusercontent.com/d/1NdaCH8CU0DJFHXw4D0lItP-QnCswl23b'},
    'Abdulrahman': {fullName: 'Abdulrahman Bouaziz', birthdate: '2012-04-15', photo: 'https://lh3.googleusercontent.com/d/1yCTO5StU2tnPY0BEynnWzUveljMIUcLE'},
    'Youssef': {fullName: 'Youssef Baakak', birthdate: '2011-11-15', photo: 'https://lh3.googleusercontent.com/d/1Bygg5-PYrjjMOZdI5hAe16eZ8ltn772e'},
    'Habib': {fullName: 'Habib Lteif', birthdate: '2008-10-15', photo: 'https://lh3.googleusercontent.com/d/13u4y6JIyCBVQ_9PCwYhh837byyK9g8pF'},
    'Salah': {fullName: 'Salah Boumalouga', birthdate: '2008-07-15', photo: 'https://lh3.googleusercontent.com/d/1IG8S_i6jD8O6C2QD_nwLxrG932QgIVXu'},
    // Données des filles
    'Yomna Masrouhi': {fullName: 'Yomna Masrouhi', birthdate: '2009-09-07', photo: null},
    'Isra Elalmi': {fullName: 'Isra Elalmi', birthdate: '2008-03-25', photo: null},
    'Naya Sabbidine': {fullName: 'Naya Sabbidine', birthdate: '2014-02-28', photo: null},
    'Israa Alkattan': {fullName: 'Israa Alkattan', birthdate: '2013-09-19', photo: null},
    'Dina Tlili': {fullName: 'Dina Tlili', birthdate: '2012-12-22', photo: null},
    'Lina Tlili': {fullName: 'Lina Tlili', birthdate: '2012-12-22', photo: null},
    'Cynthia Fadlallah': {fullName: 'Cynthia Fadlallah', birthdate: '2013-12-06', photo: null},
    'Neyla Molina': {fullName: 'Neyla Molina', birthdate: '2014-01-13', photo: null},
    'Jawahair Eshmawi': {fullName: 'Jawahair Eshmawi', birthdate: '2012-03-19', photo: null},
    'Yousr Letaief': {fullName: 'Yousr Letaief', birthdate: '2011-06-14', photo: null},
    'Sarah Aldebasy': {fullName: 'Sarah Aldebasy', birthdate: '2011-07-24', photo: null},
    'Maria Wahib': {fullName: 'Maria Wahib', birthdate: '2011-07-16', photo: null},
    'Badia Khaldi': {fullName: 'Badia Khaldi', birthdate: '2010-12-23', photo: null},
    'Luluwah Alghabashi': {fullName: 'Luluwah Alghabashi', birthdate: '2010-04-29', photo: null}
};

// Matières par classe - TOUTES LES CLASSES
const subjectsByClass = {
    PEI1: ["Mathématiques", "Individus et sociétés", "Langue et littérature", "Design", "Sciences", "Art visuel", "Éducation physique et sportive", "Acquisition de langue (Anglais)", "Acquisition de langue (اللغة العربية)"],
    PEI2: ["Mathématiques", "Individus et sociétés", "Langue et littérature", "Design", "Sciences", "Art visuel", "Éducation physique et sportive", "Acquisition de langue (Anglais)", "Acquisition de langue (اللغة العربية)"],
    PEI3: ["Mathématiques", "Individus et sociétés", "Langue et littérature", "Design", "Sciences", "Art visuel", "Éducation physique et sportive", "Acquisition de langue (Anglais)", "Acquisition de langue (اللغة العربية)"],
    PEI4: ["Mathématiques", "Individus et sociétés", "Langue et littérature", "Design", "Sciences", "Art visuel", "Éducation physique et sportive", "Acquisition de langue (Anglais)", "Acquisition de langue (اللغة العربية)"],
    PEI5: ["Mathématiques", "Individus et sociétés", "Langue et littérature", "Design", "Sciences", "Art visuel", "Éducation physique et sportive", "Acquisition de langue (Anglais)", "Acquisition de langue (اللغة العربية)"],
    DP1: ["Mathématiques", "Individus et sociétés", "Langue et littérature", "Design", "Sciences", "Art visuel", "Éducation physique et sportive", "Acquisition de langue (Anglais)", "Acquisition de langue (اللغة العربية)"],
    DP2: ["Mathématiques", "Individus et sociétés", "Langue et littérature", "Design", "Sciences", "Art visuel", "Éducation physique et sportive", "Acquisition de langue (Anglais)", "Acquisition de langue (اللغة العربية)"]
};

// Critères par matière - TOUTES LES MATIÈRES AVEC CRITÈRES SPÉCIFIQUES
const criteriaBySubject = {
    // Matières PEI (PEI1-PEI5) - CRITÈRES SPÉCIFIQUES
    "Mathématiques": {A: "Connaissances et compréhension", B: "Recherche de modèles", C: "Communication", D: "Application des mathématiques"},
    "Individus et sociétés": {A: "Connaissances et compréhension", B: "Recherche", C: "Communication", D: "Pensée critique"},
    "Langue et littérature": {A: "Analyse", B: "Organisation", C: "Production de texte", D: "Utilisation de la langue"},
    "Design": {A: "Recherche et analyse", B: "Développement des idées", C: "Création de la solution", D: "Évaluation"},
    "Sciences": {A: "Connaissances et compréhension", B: "Recherche et élaboration", C: "Traitement et évaluation", D: "Réflexion sur les répercussions"},
    "Art visuel": {A: "Connaissances et compréhension", B: "Développement des compétences", C: "Pensée créative", D: "Réaction"},
    "Éducation physique et sportive": {A: "Connaissances et compréhension", B: "Planification", C: "Application et exécution", D: "Réflexion et amélioration"},
    "Acquisition de langue (Anglais)": {A: "Listening", B: "Reading", C: "Speaking", D: "Writing"},
    "Acquisition de langue (اللغة العربية)": {A: "الاستماع", B: "القراءة", C: "التحدث", D: "الكتابة"}
};

// Élèves par classe et section - CONFIGURATION CORRECTE
const studentsByClassAndSection = {
    garçons: {
        PEI1: ["Bilal", "Faysal", "Jad", "Manaf"],
        PEI2: ["Ahmed", "Ali", "Eyad", "Yasser"],
        PEI3: ["Adam", "Ahmad", "Mohamed Chalak", "Seifeddine", "Wajih"],
        PEI4: ["Abdulrahman", "Mohamed Amine Sgheir", "Mohamed Younes", "Samir", "Youssef"],
        DP2: ["Habib", "Salah"]
    },
    filles: {
        PEI1: ["Naya Sabbidine"],
        PEI2: ["Israa Alkattan", "Dina Tlili", "Lina Tlili", "Cynthia Fadlallah", "Neyla Molina"],
        PEI3: ["Jawahair Eshmawi"],
        PEI4: ["Yousr Letaief", "Sarah Aldebasy", "Maria Wahib"],
        PEI5: ["Badia Khaldi", "Luluwah Alghabashi"],
        DP1: ["Yomna Masrouhi"],
        DP2: ["Isra Elalmi"]
    }
};

// Fonctions utilitaires
async function apiCall(endpoint, data) {
    try {
        const response = await fetch(`/api/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`API call failed for ${endpoint}:`, error);
        throw error;
    }
}

// Fonction spéciale pour télécharger les fichiers Word
async function downloadWordDocument(data) {
    try {
        const response = await fetch('/api/generateSingleWord', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Récupérer le nom du fichier depuis les headers
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `Livret-${data.studentSelected}-${Date.now()}.docx`;
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
            if (filenameMatch) {
                filename = filenameMatch[1];
            }
        }
        
        // Récupérer le contenu binaire
        const blob = await response.blob();
        
        // Créer le lien de téléchargement
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        return { success: true, filename: filename };
        
    } catch (error) {
        console.error(`Word download failed:`, error);
        throw error;
    }
}

// Handlers de mise à jour des données
function handleTeacherNameChange(value) {
    currentData.teacherName = value.trim();
    localStorage.setItem('teacherName', currentData.teacherName);
    
    // Synchroniser avec le champ approprié
    const isArabicSubject = currentData.subjectSelected === 'Acquisition de langue (اللغة العربية)';
    const otherField = isArabicSubject ? document.getElementById('teacherName') : document.getElementById('teacherNameArabic');
    if (otherField) otherField.value = value.trim();
}

function handleStudentBirthdateChange(value) {
    currentData.studentBirthdate = value;
}

function handleCommentChange(value) {
    currentData.teacherComment = value;
    
    // Synchroniser avec le champ approprié
    const isArabicSubject = currentData.subjectSelected === 'Acquisition de langue (اللغة العربية)';
    const otherField = isArabicSubject ? document.getElementById('teacherComment') : document.getElementById('teacherCommentArabic');
    if (otherField) otherField.value = value;
}

function handleCommunicationChange() {
    const isArabicSubject = currentData.subjectSelected === 'Acquisition de langue (اللغة العربية)';
    const selector = isArabicSubject ? "#communicationTableArabic tbody select" : "#communicationTable tbody select";
    
    currentData.communicationEvaluation = Array.from(
        document.querySelectorAll(selector)
    ).map(sel => sel.value);
}

function handleUnitsChange() {
    const isArabicSubject = currentData.subjectSelected === 'Acquisition de langue (اللغة العربية)';
    
    let unitsSem1, unitsSem2;
    
    if (isArabicSubject) {
        unitsSem1 = parseInt(document.getElementById('unitsSem1SelectorArabic').value);
        unitsSem2 = parseInt(document.getElementById('unitsSem2SelectorArabic').value);
    } else {
        unitsSem1 = parseInt(document.getElementById('unitsSem1Selector').value);
        unitsSem2 = parseInt(document.getElementById('unitsSem2Selector').value);
    }
    
    currentData.unitsSem1 = unitsSem1;
    currentData.unitsSem2 = unitsSem2;
    
    if (isArabicSubject) {
        rebuildCriteriaTableArabic();
    } else {
        rebuildCriteriaTable();
    }
}

function rebuildCriteriaTable() {
    const isDPClass = currentData.classSelected === 'DP1' || currentData.classSelected === 'DP2';
    const maxValue = isDPClass ? 7 : 8;
    // CORRECTION: Utiliser A-D pour toutes les classes (PEI et DP)
    const criteriaKeys = ['A', 'B', 'C', 'D'];
    const unitsSem1 = currentData.unitsSem1;
    const unitsSem2 = currentData.unitsSem2;
    
    // Vérifier si c'est la matière arabe
    const isArabicSubject = currentData.subjectSelected === 'Acquisition de langue (اللغة العربية)';
    
    const thead = document.getElementById('criteriaTableHead');
    const tbody = document.getElementById('criteriaTableBody');
    
    // Construire les en-têtes (en arabe si matière arabe)
    let headerHTML = '<tr>';
    headerHTML += isArabicSubject ? '<th>المعايير</th>' : '<th>Critères</th>';
    
    // En-têtes pour Semestre 1
    if (unitsSem1 === 1) {
        headerHTML += isArabicSubject ? `<th>الفصل الأول (/${maxValue})</th>` : `<th>Semestre 1 (/${maxValue})</th>`;
    } else {
        for (let i = 1; i <= unitsSem1; i++) {
            headerHTML += isArabicSubject ? `<th>ف1-و${i} (/${maxValue})</th>` : `<th>S1-U${i} (/${maxValue})</th>`;
        }
        headerHTML += isArabicSubject ? `<th style="background-color: #e7f3ff;">متوسط ف1 (/${maxValue})</th>` : `<th style="background-color: #e7f3ff;">Moyenne S1 (/${maxValue})</th>`;
    }
    
    // En-têtes pour Semestre 2
    if (unitsSem2 === 1) {
        headerHTML += isArabicSubject ? `<th>الفصل الثاني (/${maxValue})</th>` : `<th>Semestre 2 (/${maxValue})</th>`;
    } else {
        for (let i = 1; i <= unitsSem2; i++) {
            headerHTML += isArabicSubject ? `<th>ف2-و${i} (/${maxValue})</th>` : `<th>S2-U${i} (/${maxValue})</th>`;
        }
        headerHTML += isArabicSubject ? `<th style="background-color: #e7f3ff;">متوسط ف2 (/${maxValue})</th>` : `<th style="background-color: #e7f3ff;">Moyenne S2 (/${maxValue})</th>`;
    }
    
    headerHTML += isArabicSubject ? `<th>المستوى النهائي (/${maxValue})</th>` : `<th>Niveau Final (/${maxValue})</th>`;
    headerHTML += isArabicSubject ? `<th>المجموع الكلي (/${isDPClass ? 28 : 32})</th>` : `<th>Seuil Total (/${isDPClass ? 28 : 32})</th>`;
    headerHTML += isArabicSubject ? `<th>الدرجة النهائية (/${maxValue})</th>` : `<th>Note Finale (/${maxValue})</th>`;
    headerHTML += '</tr>';
    
    thead.innerHTML = headerHTML;
    
    // Construire le corps du tableau
    let bodyHTML = '';
    
    // Obtenir les noms des critères pour la matière actuelle
    const criteriaNames = criteriaBySubject[currentData.subjectSelected] || {};
    
    criteriaKeys.forEach((key, index) => {
        const criteriaData = currentData.criteriaValues[key] || {sem1: null, sem2: null, finalLevel: null, sem1Units: [], sem2Units: []};
        
        // Afficher "A: Nom du critère" au lieu de juste "A"
        const criteriaLabel = criteriaNames[key] ? `${key}: ${criteriaNames[key]}` : `Critère ${key}`;
        
        bodyHTML += `<tr data-criteria="${key}"><td>${criteriaLabel}</td>`;
        
        // Colonnes pour Semestre 1
        if (unitsSem1 === 1) {
            const val = criteriaData.sem1 !== null ? criteriaData.sem1 : '';
            bodyHTML += `<td class="sem1-cell"><input type="number" min="0" max="${maxValue}" value="${val}" oninput="validateInput(this)" data-unit="0"></td>`;
        } else {
            for (let i = 0; i < unitsSem1; i++) {
                const val = criteriaData.sem1Units[i] !== null && criteriaData.sem1Units[i] !== undefined ? criteriaData.sem1Units[i] : '';
                bodyHTML += `<td class="sem1-unit-cell"><input type="number" min="0" max="${maxValue}" value="${val}" oninput="validateInput(this)" data-unit="${i}"></td>`;
            }
            const avgVal = criteriaData.sem1 !== null ? criteriaData.sem1 : '';
            bodyHTML += `<td class="sem1-avg-cell" style="background-color: #e7f3ff;"><input type="number" readonly tabindex="-1" value="${avgVal}" class="sem1-avg-input"></td>`;
        }
        
        // Colonnes pour Semestre 2
        if (unitsSem2 === 1) {
            const val = criteriaData.sem2 !== null ? criteriaData.sem2 : '';
            bodyHTML += `<td class="sem2-cell"><input type="number" min="0" max="${maxValue}" value="${val}" oninput="validateInput(this)" data-unit="0"></td>`;
        } else {
            for (let i = 0; i < unitsSem2; i++) {
                const val = criteriaData.sem2Units[i] !== null && criteriaData.sem2Units[i] !== undefined ? criteriaData.sem2Units[i] : '';
                bodyHTML += `<td class="sem2-unit-cell"><input type="number" min="0" max="${maxValue}" value="${val}" oninput="validateInput(this)" data-unit="${i}"></td>`;
            }
            const avgVal = criteriaData.sem2 !== null ? criteriaData.sem2 : '';
            bodyHTML += `<td class="sem2-avg-cell" style="background-color: #e7f3ff;"><input type="number" readonly tabindex="-1" value="${avgVal}" class="sem2-avg-input"></td>`;
        }
        
        // Niveau Final
        const finalVal = criteriaData.finalLevel !== null ? criteriaData.finalLevel : '';
        bodyHTML += `<td><input type="number" readonly tabindex="-1" value="${finalVal}" class="final-level-input"></td>`;
        
        // Seuil et Note (seulement sur la première ligne avec rowspan)
        if (index === 0) {
            bodyHTML += `<td rowspan="${criteriaKeys.length}"><input id="threshold" type="number" readonly tabindex="-1" style="background-color: #e9ecef;"></td>`;
            bodyHTML += `<td rowspan="${criteriaKeys.length}"><input id="finalNote" type="number" readonly tabindex="-1" style="background-color: #e9ecef;"></td>`;
        }
        
        bodyHTML += '</tr>';
    });
    
    tbody.innerHTML = bodyHTML;
    
    // Recalculer les totaux
    calculateTotals();
}

function handleCriteriaChange(inputElement) {
    const row = inputElement.closest('tr');
    if (!row) return;
    
    const criteriaType = row.getAttribute('data-criteria');
    if (!criteriaType) return;
    
    const isDPClass = currentData.classSelected === 'DP1' || currentData.classSelected === 'DP2';
    const maxValue = isDPClass ? 7 : 8;
    
    if (!currentData.criteriaValues[criteriaType]) {
        currentData.criteriaValues[criteriaType] = { sem1: null, sem2: null, finalLevel: null, sem1Units: [], sem2Units: [] };
    }
    
    // Collecter les valeurs des unités Semestre 1
    const sem1UnitInputs = row.querySelectorAll('.sem1-unit-cell input, .sem1-cell input');
    const sem1Units = [];
    let sem1Sum = 0;
    let sem1Count = 0;
    
    sem1UnitInputs.forEach((input) => {
        const unitIndex = parseInt(input.getAttribute('data-unit') || '0');
        const value = input.value !== '' ? parseFloat(input.value) : null;
        sem1Units[unitIndex] = value;
        if (value !== null && !isNaN(value)) {
            sem1Sum += value;
            sem1Count++;
        }
    });
    
    // Calculer la moyenne Semestre 1
    let sem1Avg = null;
    if (currentData.unitsSem1 === 1) {
        sem1Avg = sem1Units[0];
    } else if (sem1Count > 0) {
        sem1Avg = Math.round(sem1Sum / sem1Count);
    }
    
    // Mettre à jour l'affichage de la moyenne S1
    const sem1AvgInput = row.querySelector('.sem1-avg-input');
    if (sem1AvgInput) {
        sem1AvgInput.value = sem1Avg !== null ? sem1Avg : '';
    }
    
    // Collecter les valeurs des unités Semestre 2
    const sem2UnitInputs = row.querySelectorAll('.sem2-unit-cell input, .sem2-cell input');
    const sem2Units = [];
    let sem2Sum = 0;
    let sem2Count = 0;
    
    sem2UnitInputs.forEach((input) => {
        const unitIndex = parseInt(input.getAttribute('data-unit') || '0');
        const value = input.value !== '' ? parseFloat(input.value) : null;
        sem2Units[unitIndex] = value;
        if (value !== null && !isNaN(value)) {
            sem2Sum += value;
            sem2Count++;
        }
    });
    
    // Calculer la moyenne Semestre 2
    let sem2Avg = null;
    if (currentData.unitsSem2 === 1) {
        sem2Avg = sem2Units[0];
    } else if (sem2Count > 0) {
        sem2Avg = Math.round(sem2Sum / sem2Count);
    }
    
    // Mettre à jour l'affichage de la moyenne S2
    const sem2AvgInput = row.querySelector('.sem2-avg-input');
    if (sem2AvgInput) {
        sem2AvgInput.value = sem2Avg !== null ? sem2Avg : '';
    }
    
    // Calculer le niveau final (moyenne des deux semestres)
    let finalLevel = null;
    if (sem1Avg !== null && sem2Avg !== null) {
        finalLevel = Math.round((sem1Avg + sem2Avg) / 2);
    } else if (sem1Avg !== null) {
        finalLevel = sem1Avg;
    } else if (sem2Avg !== null) {
        finalLevel = sem2Avg;
    }
    
    // Mettre à jour l'affichage du niveau final
    const finalLevelInput = row.querySelector('.final-level-input');
    if (finalLevelInput) {
        finalLevelInput.value = finalLevel !== null ? finalLevel : '';
    }
    
    // Stocker dans currentData
    currentData.criteriaValues[criteriaType].sem1 = sem1Avg;
    currentData.criteriaValues[criteriaType].sem2 = sem2Avg;
    currentData.criteriaValues[criteriaType].finalLevel = finalLevel;
    currentData.criteriaValues[criteriaType].sem1Units = sem1Units;
    currentData.criteriaValues[criteriaType].sem2Units = sem2Units;
    
    calculateTotals();
}

// Logique de sélection
function handleSectionChange(value) {
    currentData.sectionSelected = value;
    
    // Masquer les boutons de section et afficher seulement le sélecteur de classe
    document.getElementById('step0').style.display = 'none';
    document.getElementById('step1').style.display = 'block';
    
    // Filtrer les classes selon la section
    populateClassesForSection(value);
    
    resetOnSectionChange();
}

// Nouvelle fonction pour peupler les classes selon la section
function populateClassesForSection(section) {
    const classSelector = document.getElementById('classSelector');
    classSelector.innerHTML = '<option value="">-- Sélectionnez une Classe --</option>';
    
    const availableClasses = {
        'garçons': ['PEI1', 'PEI2', 'PEI3', 'PEI4', 'DP2'],
        'filles': ['PEI1', 'PEI2', 'PEI3', 'PEI4', 'PEI5', 'DP1', 'DP2']
    };
    
    const classes = availableClasses[section] || [];
    classes.forEach(className => {
        const option = document.createElement('option');
        option.value = className;
        option.textContent = className;
        classSelector.appendChild(option);
    });
}

function handleClassChange(value) {
    currentData.classSelected = value;
    resetOnClassChange();
    if (value) populateStudents();
}

function handleStudentChange(value) {
    currentData.studentSelected = value;
    resetOnStudentChange();
    if (value) {
        showStudentInfo();
        populateSubjects();
    }
}

function handleSubjectChange(value) {
    currentData.subjectSelected = value;
    resetOnSubjectChange();
    if (value) {
        const isArabicSubject = value === 'Acquisition de langue (اللغة العربية)';
        
        // Afficher/masquer les sections appropriées
        const frenchSections = document.querySelectorAll('.french-section');
        const arabicSections = document.querySelectorAll('.arabic-section');
        
        frenchSections.forEach(section => {
            section.style.display = isArabicSubject ? 'none' : 'block';
        });
        
        arabicSections.forEach(section => {
            section.style.display = isArabicSubject ? 'block' : 'none';
        });
        
        contributionEntrySections.style.display = "block";
        dataContainer.style.display = "none";
        fetchData();
        
        if (!isArabicSubject) {
            updateCriteriaTableDynamically();
            updateCriteriaTableHeaders();
            rebuildCriteriaTable();
        } else {
            updateCriteriaTableDynamicallyArabic();
            rebuildCriteriaTableArabic();
        }
    }
}

function updateCriteriaTableDynamically() {
    const isDPClass = currentData.classSelected === 'DP1' || currentData.classSelected === 'DP2';
    const maxValue = isDPClass ? 7 : 8;
    const maxThreshold = isDPClass ? 28 : 32;
    
    // Mettre à jour les en-têtes du tableau
    const headers = document.querySelectorAll("#criteriaTable thead th");
    if (headers.length >= 5) {
        headers[1].textContent = `Semestre 1 (/${maxValue})`;
        headers[2].textContent = `Semestre 2 (/${maxValue})`;
        headers[3].textContent = `Niveau Final (/${maxValue})`;
        headers[4].textContent = `Seuil Total (/${maxThreshold})`;
        headers[5].textContent = `Note Finale (/${maxValue})`;
    }
    
    // Mettre à jour les attributs max des inputs
    document.querySelectorAll("#criteriaTable tbody input[type='number']").forEach(input => {
        if (!input.readOnly) {
            input.max = maxValue;
        }
    });
}

// Fonction pour mettre à jour le tableau arabe dynamiquement
function updateCriteriaTableDynamicallyArabic() {
    const isDPClass = currentData.classSelected === 'DP1' || currentData.classSelected === 'DP2';
    const maxValue = isDPClass ? 7 : 8;
    const maxThreshold = isDPClass ? 28 : 32;
    
    // Mettre à jour les en-têtes du tableau arabe
    const headers = document.querySelectorAll("#criteriaTableArabic thead th");
    if (headers.length >= 5) {
        headers[1].textContent = `الفصل الأول (/${maxValue})`;
        headers[2].textContent = `الفصل الثاني (/${maxValue})`;
        headers[3].textContent = `المستوى النهائي (/${maxValue})`;
        headers[4].textContent = `المجموع الكلي (/${maxThreshold})`;
        headers[5].textContent = `الدرجة النهائية (/${maxValue})`;
    }
    
    // Mettre à jour les attributs max des inputs arabes
    document.querySelectorAll("#criteriaTableArabic tbody input[type='number']").forEach(input => {
        if (!input.readOnly) {
            input.max = maxValue;
        }
    });
}

// Fonction pour reconstruire le tableau des critères en arabe
function rebuildCriteriaTableArabic() {
    const isDPClass = currentData.classSelected === 'DP1' || currentData.classSelected === 'DP2';
    const maxValue = isDPClass ? 7 : 8;
    const maxThreshold = isDPClass ? 28 : 32;
    const unitsSem1 = parseInt(currentData.unitsSem1) || 1;
    const unitsSem2 = parseInt(currentData.unitsSem2) || 1;
    // CORRECTION: Utiliser A-D pour toutes les classes (PEI et DP)
    const criteriaKeys = ['A', 'B', 'C', 'D'];
    
    // Noms des critères en arabe
    const criteriaNames = {
        'A': 'الاستماع',
        'B': 'القراءة',
        'C': 'التحدث',
        'D': 'الكتابة'
    };
    
    const thead = document.getElementById('criteriaTableHeadArabic');
    const tbody = document.getElementById('criteriaTableBodyArabic');
    
    // Construire l'en-tête
    let headerHTML = '<tr><th>المعايير</th>';
    
    // Semestre 1
    if (unitsSem1 > 1) {
        for (let i = 1; i <= unitsSem1; i++) {
            headerHTML += `<th>الوحدة ${i} - ف1 (/${maxValue})</th>`;
        }
        headerHTML += `<th>متوسط ف1 (/${maxValue})</th>`;
    } else {
        headerHTML += `<th>الفصل الأول (/${maxValue})</th>`;
    }
    
    // Semestre 2
    if (unitsSem2 > 1) {
        for (let i = 1; i <= unitsSem2; i++) {
            headerHTML += `<th>الوحدة ${i} - ف2 (/${maxValue})</th>`;
        }
        headerHTML += `<th>متوسط ف2 (/${maxValue})</th>`;
    } else {
        headerHTML += `<th>الفصل الثاني (/${maxValue})</th>`;
    }
    
    headerHTML += `<th>المستوى النهائي (/${maxValue})</th>`;
    headerHTML += `<th>المجموع الكلي (/${maxThreshold})</th>`;
    headerHTML += `<th>الدرجة النهائية (/${maxValue})</th>`;
    headerHTML += '</tr>';
    
    thead.innerHTML = headerHTML;
    
    // Construire le corps du tableau
    let bodyHTML = '';
    criteriaKeys.forEach((key, index) => {
        // Afficher "A: الاستماع" au lieu de juste "الاستماع"
        const criterionName = criteriaNames[key] || key;
        const criteriaLabel = criteriaNames[key] ? `${key}: ${criterionName}` : key;
        bodyHTML += `<tr data-criteria="${key}">`;
        bodyHTML += `<td>${criteriaLabel}</td>`;
        
        // Semestre 1
        if (unitsSem1 > 1) {
            for (let i = 1; i <= unitsSem1; i++) {
                bodyHTML += `<td class="sem1-unit"><input type="number" min="0" max="${maxValue}" oninput="validateInput(this); handleCriteriaChange('${key}', 'sem1', ${i})"></td>`;
            }
            bodyHTML += `<td><input type="number" readonly tabindex="-1" class="sem1-avg-input"></td>`;
        } else {
            bodyHTML += `<td class="sem1-cell"><input type="number" min="0" max="${maxValue}" oninput="validateInput(this); handleCriteriaChange('${key}', 'sem1', 1)"></td>`;
        }
        
        // Semestre 2
        if (unitsSem2 > 1) {
            for (let i = 1; i <= unitsSem2; i++) {
                bodyHTML += `<td class="sem2-unit"><input type="number" min="0" max="${maxValue}" oninput="validateInput(this); handleCriteriaChange('${key}', 'sem2', ${i})"></td>`;
            }
            bodyHTML += `<td><input type="number" readonly tabindex="-1" class="sem2-avg-input"></td>`;
        } else {
            bodyHTML += `<td class="sem2-cell"><input type="number" min="0" max="${maxValue}" oninput="validateInput(this); handleCriteriaChange('${key}', 'sem2', 1)"></td>`;
        }
        
        bodyHTML += `<td><input type="number" readonly tabindex="-1" class="final-level-input"></td>`;
        
        if (index === 0) {
            bodyHTML += `<td rowspan="4"><input id="thresholdArabic" type="number" readonly tabindex="-1" style="background-color: #e9ecef;"></td>`;
            bodyHTML += `<td rowspan="4"><input id="finalNoteArabic" type="number" readonly tabindex="-1" style="background-color: #e9ecef;"></td>`;
        }
        
        bodyHTML += '</tr>';
    });
    
    tbody.innerHTML = bodyHTML;
}


// Affichage des informations élève
async function showStudentInfo() {
    const studentSelected = currentData.studentSelected;
    const studentPhotoPreview = document.getElementById('studentPhotoPreview');

    if (studentSelected) {
        studentInfoContainer.style.display = "block";
        document.getElementById('studentNameDisplay').textContent = studentSelected;

        // Utiliser les données locales pour la photo et la date initiale
        const studentLocalData = studentData[studentSelected];
        let localPhotoUrl = studentLocalData?.photo || null;
        let localBirthdate = studentLocalData?.birthdate || '';

        currentData.studentPhoto = localPhotoUrl;
        currentData.studentBirthdate = localBirthdate;

        // Afficher la photo
        if (localPhotoUrl) {
            studentPhotoPreview.src = localPhotoUrl;
            studentPhotoPreview.style.display = 'block';
            studentPhotoPreview.onerror = () => {
                console.error(`Erreur chargement image: ${localPhotoUrl}`);
                studentPhotoPreview.style.display = 'none';
            };
        } else {
            studentPhotoPreview.style.display = 'none';
            studentPhotoPreview.src = '#';
        }

        studentBirthdateInput.value = localBirthdate;

        // Récupérer la date de naissance du serveur
        try {
            const infoFromServer = await apiCall('fetchStudentInfo', { studentSelected });
            if (infoFromServer && infoFromServer.studentBirthdate) {
                studentBirthdateInput.value = infoFromServer.studentBirthdate;
                currentData.studentBirthdate = infoFromServer.studentBirthdate;
            }
        } catch (error) {
            console.error('Erreur récupération infos élève:', error);
        }
    } else {
        studentInfoContainer.style.display = "none";
    }
}

// Population des listes déroulantes
function populateStudents() {
    const classSelected = currentData.classSelected;
    const sectionSelected = currentData.sectionSelected;
    studentSelector.innerHTML = "<option value=''>-- Sélectionnez un élève --</option>";
    
    if (classSelected && sectionSelected && studentsByClassAndSection[sectionSelected] && studentsByClassAndSection[sectionSelected][classSelected]) {
        const studentList = studentsByClassAndSection[sectionSelected][classSelected];
        studentList.sort((a, b) => a.localeCompare(b));
        
        studentList.forEach(student => {
            const option = document.createElement("option");
            option.value = student; // Valeur = prénom (pour DB)
            // Affichage = nom complet si disponible
            const fullName = studentData[student]?.fullName || student;
            option.textContent = fullName;
            studentSelector.appendChild(option);
        });
        
        document.getElementById("step3").style.display = "block";
    } else {
        document.getElementById("step3").style.display = "none";
    }
    
    studentSelector.value = currentData.studentSelected || "";
}

function populateSubjects() {
    const classSelected = currentData.classSelected;
    const studentSelected = currentData.studentSelected;
    subjectSelector.innerHTML = "<option value=''>-- Sélectionnez une matière --</option>";
    
    if (classSelected && studentSelected && subjectsByClass[classSelected]) {
        subjectsByClass[classSelected].forEach(subject => {
            const option = document.createElement("option");
            option.value = subject;
            option.textContent = subject;
            subjectSelector.appendChild(option);
        });
        
        document.getElementById("step2").style.display = "block";
    } else {
        document.getElementById("step2").style.display = "none";
    }
    
    subjectSelector.value = currentData.subjectSelected || "";
}

function updateCriteriaTableHeaders() {
    const subject = currentData.subjectSelected;
    const criteriaLabels = criteriaBySubject[subject] || {};
    const rows = document.querySelectorAll("#criteriaTable tbody tr");
    // CORRECTION: Utiliser A-D pour toutes les classes
    const criteriaKeys = ['A', 'B', 'C', 'D'];
    
    rows.forEach((row, index) => {
        const key = criteriaKeys[index]; // A, B, C ou D
        const labelCell = row.cells[0];
        if (labelCell) {
            // Afficher le critère avec son nom: "A: Connaissances et compréhension"
            const criterionName = criteriaLabels[key] || 'Critère ' + key;
            labelCell.textContent = key + ': ' + criterionName;
        }
    });
}

// Nouvelle fonction pour mettre à jour les labels en arabe
function updateArabicLabels() {
    // Titre de la section Critères Initiaux
    const commHeader = document.querySelector('#communicationTable h2');
    if (commHeader) {
        commHeader.textContent = 'المعايير الأولية (مهارات منهج التعلم)';
    }
    
    // Description E, A, PA, I
    const commDesc = document.querySelector('#communicationTable p');
    if (commDesc) {
        commDesc.innerHTML = `
            <span style="font-weight: bold;">م</span>: ممتاز | 
            <span style="font-weight: bold;">م.ج</span>: مكتسب جيداً | 
            <span style="font-weight: bold;">م.ج</span>: مكتسب جزئياً | 
            <span style="font-weight: bold;">غ.ك</span>: غير كافٍ
        `;
    }
    
    // En-têtes du tableau Communication
    const commTableHeaders = document.querySelectorAll('#communicationTable thead th');
    if (commTableHeaders.length >= 6) {
        commTableHeaders[1].textContent = 'التواصل';
        commTableHeaders[2].textContent = 'التعاون';
        commTableHeaders[3].textContent = 'الإدارة الذاتية';
        commTableHeaders[4].textContent = 'البحث';
        commTableHeaders[5].textContent = 'التأمل';
    }
    
    // Ligne Évaluation
    const commTableBody = document.querySelector('#communicationTable tbody th');
    if (commTableBody) {
        commTableBody.textContent = 'التقييم';
    }
    
    // Titre Critères d'Évaluation
    const criteriaHeader = document.querySelector('#criteriaTable h2');
    if (criteriaHeader) {
        criteriaHeader.textContent = 'معايير التقييم (المادة)';
    }
    
    // Labels des sélecteurs d'unités
    const unitsSem1Label = document.querySelector('#criteriaTable label:first-child strong');
    if (unitsSem1Label) {
        unitsSem1Label.textContent = 'عدد الوحدات - الفصل الأول:';
    }
    
    const unitsSem2Label = document.querySelector('#criteriaTable label:last-child strong');
    if (unitsSem2Label) {
        unitsSem2Label.textContent = 'عدد الوحدات - الفصل الثاني:';
    }
    
    // Options des sélecteurs
    updateSelectOptionsArabic('unitsSem1Selector');
    updateSelectOptionsArabic('unitsSem2Selector');
    
    // Titre Commentaires
    const commentsHeader = document.querySelector('#criteriaTable h3:nth-of-type(1)');
    if (commentsHeader) {
        commentsHeader.textContent = 'التعليقات';
    }
    
    // Placeholder commentaires
    const commentsTextarea = document.getElementById('teacherComment');
    if (commentsTextarea) {
        commentsTextarea.placeholder = 'اكتب تعليقاتك هنا...';
    }
    
    // Titre Nom de l'enseignant
    const teacherHeader = document.querySelector('#criteriaTable h3:nth-of-type(2)');
    if (teacherHeader) {
        teacherHeader.textContent = 'اسم المعلم';
    }
    
    // Placeholder nom enseignant
    const teacherInput = document.getElementById('teacherName');
    if (teacherInput) {
        teacherInput.placeholder = 'أدخل اسمك';
    }
    
    // Bouton Soumettre
    const submitBtn = document.getElementById('submitButton');
    if (submitBtn) {
        submitBtn.textContent = 'إرسال / تحديث';
    }
}

// Fonction pour réinitialiser les labels en français
function resetFrenchLabels() {
    // Titre de la section Critères Initiaux
    const commHeader = document.querySelector('#communicationTable h2');
    if (commHeader) {
        commHeader.textContent = 'Critères Initiaux (Compétences Approche de l\'Apprentissage)';
    }
    
    // Description E, A, PA, I
    const commDesc = document.querySelector('#communicationTable p');
    if (commDesc) {
        commDesc.innerHTML = `
            <span style="font-weight: bold;">E</span>: Excellent | 
            <span style="font-weight: bold;">A</span>: Acquis | 
            <span style="font-weight: bold;">PA</span>: Partiellement Acquis | 
            <span style="font-weight: bold;">I</span>: Insuffisant
        `;
    }
    
    // En-têtes du tableau Communication
    const commTableHeaders = document.querySelectorAll('#communicationTable thead th');
    if (commTableHeaders.length >= 6) {
        commTableHeaders[1].textContent = 'Communication';
        commTableHeaders[2].textContent = 'Collaboration';
        commTableHeaders[3].textContent = 'Autogestion';
        commTableHeaders[4].textContent = 'Recherche';
        commTableHeaders[5].textContent = 'Réflexion';
    }
    
    // Ligne Évaluation
    const commTableBody = document.querySelector('#communicationTable tbody th');
    if (commTableBody) {
        commTableBody.textContent = 'Évaluation';
    }
    
    // Titre Critères d'Évaluation
    const criteriaHeader = document.querySelector('#criteriaTable h2');
    if (criteriaHeader) {
        criteriaHeader.textContent = 'Critères d\'Évaluation (Matière)';
    }
    
    // Labels des sélecteurs d'unités
    const unitsSem1Label = document.querySelector('#criteriaTable label:first-child strong');
    if (unitsSem1Label) {
        unitsSem1Label.textContent = 'Nombre d\'unités - Semestre 1:';
    }
    
    const unitsSem2Label = document.querySelector('#criteriaTable label:last-child strong');
    if (unitsSem2Label) {
        unitsSem2Label.textContent = 'Nombre d\'unités - Semestre 2:';
    }
    
    // Options des sélecteurs
    updateSelectOptionsFrench('unitsSem1Selector');
    updateSelectOptionsFrench('unitsSem2Selector');
    
    // Titre Commentaires
    const commentsHeader = document.querySelector('#criteriaTable h3:nth-of-type(1)');
    if (commentsHeader) {
        commentsHeader.textContent = 'Commentaires';
    }
    
    // Placeholder commentaires
    const commentsTextarea = document.getElementById('teacherComment');
    if (commentsTextarea) {
        commentsTextarea.placeholder = 'Écrivez vos commentaires ici...';
    }
    
    // Titre Nom de l'enseignant
    const teacherHeader = document.querySelector('#criteriaTable h3:nth-of-type(2)');
    if (teacherHeader) {
        teacherHeader.textContent = 'Nom de l\'enseignant';
    }
    
    // Placeholder nom enseignant
    const teacherInput = document.getElementById('teacherName');
    if (teacherInput) {
        teacherInput.placeholder = 'Entrez votre nom';
    }
    
    // Bouton Soumettre
    const submitBtn = document.getElementById('submitButton');
    if (submitBtn) {
        submitBtn.textContent = 'Soumettre / Mettre à jour';
    }
}

// Fonction pour mettre à jour les options en arabe
function updateSelectOptionsArabic(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    const currentValue = select.value;
    select.innerHTML = `
        <option value="1">وحدة واحدة (درجة مباشرة)</option>
        <option value="2">وحدتان</option>
        <option value="3">3 وحدات</option>
        <option value="4">4 وحدات</option>
        <option value="5">5 وحدات</option>
    `;
    select.value = currentValue;
}

// Fonction pour mettre à jour les options en français
function updateSelectOptionsFrench(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    const currentValue = select.value;
    select.innerHTML = `
        <option value="1">1 unité (note directe)</option>
        <option value="2">2 unités</option>
        <option value="3">3 unités</option>
        <option value="4">4 unités</option>
        <option value="5">5 unités</option>
    `;
    select.value = currentValue;
}

// Validation et calculs
function validateInput(input) {
    const isDPClass = currentData.classSelected === 'DP1' || currentData.classSelected === 'DP2';
    const maxValue = isDPClass ? 7 : 8;
    
    input.value = input.value.replace(/[^0-9]/g, '');
    if (input.value !== '' && parseFloat(input.value) > maxValue) {
        alert(`Le maximum est ${maxValue}.`);
        input.value = maxValue;
    }
    handleCriteriaChange(input);
}

function calculateRow(rowElement) {
    // Utiliser handleCriteriaChange qui gère maintenant les unités
    const firstInput = rowElement.querySelector('input[type="number"]:not([readonly])');
    if (firstInput) {
        handleCriteriaChange(firstInput);
    }
}

function calculateTotals() {
    const isArabicSubject = currentData.subjectSelected === 'Acquisition de langue (اللغة العربية)';
    const tbody = isArabicSubject ? document.getElementById("criteriaTableBodyArabic") : document.getElementById("criteriaTableBody");
    const rows = tbody ? tbody.querySelectorAll("tr") : [];
    
    const isDPClass = currentData.classSelected === 'DP1' || currentData.classSelected === 'DP2';
    const maxNote = isDPClass ? 7 : 8;
    const maxThreshold = isDPClass ? 28 : 32; // 4 critères * 7 ou 8
    
    let totalLevel = 0;
    
    rows.forEach(row => {
        const finalLevelInput = row.querySelector('.final-level-input');
        if (finalLevelInput?.value !== '') {
            totalLevel += parseFloat(finalLevelInput.value);
        }
    });
    
    const thresholdId = isArabicSubject ? "thresholdArabic" : "threshold";
    const thresholdInput = document.getElementById(thresholdId);
    if (thresholdInput) {
        thresholdInput.value = totalLevel;
    }
    
    let finalNote = 0;
    if (totalLevel > 0) {
        finalNote = Math.round(totalLevel / 4);
        if (finalNote < 1) finalNote = 1;
        if (finalNote > maxNote) finalNote = maxNote;
    }
    
    const finalNoteId = isArabicSubject ? "finalNoteArabic" : "finalNote";
    const finalNoteInput = document.getElementById(finalNoteId);
    if (finalNoteInput) {
        finalNoteInput.value = finalNote;
    }
}

// Récupération des données
async function fetchData() {
    if (currentData.studentSelected && currentData.subjectSelected) {
        try {
            const data = await apiCall('fetchData', {
                studentSelected: currentData.studentSelected,
                subjectSelected: currentData.subjectSelected,
                classSelected: currentData.classSelected,
                sectionSelected: currentData.sectionSelected
            });
            
            resetInputTables();
            
            if (data && !data.noDataForSubject) {
                fillFormWithData(data);
                currentContributionId = data._id || null;
            } else {
                currentContributionId = null;
                teacherNameInput.value = currentData.teacherName || '';
                document.getElementById('teacherComment').value = '';
                calculateTotals();
            }
            
            contributionEntrySections.style.display = "block";
        } catch (error) {
            console.error('Erreur récupération données:', error);
            alert('Erreur lors de la récupération des données.');
        }
    }
}

function fillFormWithData(data) {
    const isArabicSubject = currentData.subjectSelected === 'Acquisition de langue (اللغة العربية)';
    
    // Remplir le nom de l'enseignant
    teacherNameInput.value = data.teacherName || currentData.teacherName || '';
    currentData.teacherName = teacherNameInput.value;
    localStorage.setItem('teacherName', currentData.teacherName);
    
    // Synchroniser avec le champ arabe si nécessaire
    const teacherNameArabic = document.getElementById('teacherNameArabic');
    if (teacherNameArabic) teacherNameArabic.value = currentData.teacherName;
    
    // Remplir le commentaire
    const commentField = isArabicSubject ? document.getElementById('teacherCommentArabic') : document.getElementById('teacherComment');
    if (commentField) commentField.value = data.teacherComment || '';
    currentData.teacherComment = data.teacherComment;
    
    // Remplir les évaluations de communication
    currentData.communicationEvaluation = data.communicationEvaluation || ['', '', '', '', ''];
    const commSelector = isArabicSubject ? "#communicationTableArabic tbody select" : "#communicationTable tbody select";
    document.querySelectorAll(commSelector).forEach((s, i) => {
        s.value = currentData.communicationEvaluation[i] || '';
    });
    
    // Restaurer les unités sélectionnées
    if (data.unitsSem1) {
        currentData.unitsSem1 = data.unitsSem1;
        const unitsSem1Field = isArabicSubject ? document.getElementById('unitsSem1SelectorArabic') : document.getElementById('unitsSem1Selector');
        if (unitsSem1Field) unitsSem1Field.value = data.unitsSem1;
    }
    if (data.unitsSem2) {
        currentData.unitsSem2 = data.unitsSem2;
        const unitsSem2Field = isArabicSubject ? document.getElementById('unitsSem2SelectorArabic') : document.getElementById('unitsSem2Selector');
        if (unitsSem2Field) unitsSem2Field.value = data.unitsSem2;
    }
    
    // Supporte PEI et DP avec critères A-D
    currentData.criteriaValues = data.criteriaValues ? JSON.parse(JSON.stringify(data.criteriaValues)) : {A:{},B:{},C:{},D:{}};
    
    // S'assurer que chaque critère a les tableaux d'unités
    const isDPClass = currentData.classSelected === 'DP1' || currentData.classSelected === 'DP2';
    // CORRECTION: Utiliser A-D pour toutes les classes (PEI et DP)
    const criteriaKeys = ['A', 'B', 'C', 'D'];
    criteriaKeys.forEach(key => {
        if (!currentData.criteriaValues[key]) {
            currentData.criteriaValues[key] = {sem1: null, sem2: null, finalLevel: null, sem1Units: [], sem2Units: []};
        }
        if (!currentData.criteriaValues[key].sem1Units) {
            currentData.criteriaValues[key].sem1Units = [];
        }
        if (!currentData.criteriaValues[key].sem2Units) {
            currentData.criteriaValues[key].sem2Units = [];
        }
    });
    
    // Reconstruire le tableau avec les bonnes colonnes
    if (isArabicSubject) {
        rebuildCriteriaTableArabic();
    } else {
        rebuildCriteriaTable();
    }
    
    currentData.studentBirthdate = data.studentBirthdate || currentData.studentBirthdate || '';
    studentBirthdateInput.value = currentData.studentBirthdate;
    
    calculateTotals();
}

// Soumission du formulaire
async function submitForm() {
    if (!currentData.teacherName || !currentData.classSelected || !currentData.studentSelected || !currentData.subjectSelected) {
        alert("Veuillez remplir tous les champs requis.");
        return;
    }
    
    submitButton.disabled = true;
    submitButton.textContent = "Envoi en cours...";
    
    try {
        // Assurer que la date de naissance est à jour
        currentData.studentBirthdate = studentBirthdateInput.value || null;
        
        const contributionData = { ...currentData, contributionId: currentContributionId };
        
        const result = await apiCall('saveContribution', contributionData);
        
        if (result.success) {
            // Confirmation d'enregistrement en base de données
            alert(`✅ Contribution enregistrée avec succès dans la base de données !\n\n(ID: ${result.data})`);
            currentContributionId = result.data;
            
            if (currentData.studentSelected) {
                fetchStudentContributions(currentData.studentSelected);
            }
        } else {
            throw new Error(result.error || 'Erreur inconnue');
        }
    } catch (error) {
        console.error('Erreur soumission:', error);
        alert(`Erreur: ${error.message || 'Erreur lors de la sauvegarde'}`);
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Soumettre / Mettre à jour";
    }
}

// Affichage des contributions
async function showStudentData() {
    const studentSelected = currentData.studentSelected;
    if (studentSelected) {
        contributionEntrySections.style.display = "none";
        dataContainer.style.display = "block";
        await fetchStudentContributions(studentSelected);
    } else {
        alert("Veuillez sélectionner un élève !");
    }
}

async function fetchStudentContributions(student) {
    if (!student) return;
    
    try {
        const contributions = await apiCall('fetchStudentContributions', { student });
        
        dataContainer.innerHTML = '<h3>Contributions Enregistrées</h3>';
        
        if (contributions && contributions.length > 0) {
            contributions.sort((a, b) => (a.subjectSelected || "").localeCompare(b.subjectSelected || ""));
            contributions.forEach(c => {
                dataContainer.appendChild(createContributionElement(c));
            });
        } else {
            dataContainer.innerHTML += '<p>Aucune contribution trouvée pour cet élève.</p>';
        }
        
        dataContainer.style.display = "block";
    } catch (error) {
        console.error('Erreur récupération contributions:', error);
        alert('Erreur lors de la récupération des contributions.');
    }
}

function createContributionElement(c) {
    const div = document.createElement('div');
    div.className = 'contribution';
    const color = getSubjectColor(c.subjectSelected);
    
    div.innerHTML = `
        <div class="contribution-header" style="background-color:${color};">
            <h3>${c.subjectSelected || 'N/A'}</h3>
            <div class="contribution-buttons">
                <button onclick="toggleContributionDetails(this)" data-contribution-id="${c._id}" title="Afficher/Masquer Détails">Afficher</button>
                <button onclick="editContribution('${c._id}')" title="Modifier">Modifier</button>
                <button onclick="deleteContribution('${c._id}')" title="Supprimer">Supprimer</button>
            </div>
        </div>
        <div class="contribution-content" id="content-${c._id}" style="display: none;">
            Chargement...
        </div>
    `;
    
    return div;
}

async function toggleContributionDetails(button) {
    const id = button.getAttribute('data-contribution-id');
    const content = document.getElementById(`content-${id}`);
    if (!content) return;
    
    const isHidden = content.style.display === 'none';
    content.style.display = isHidden ? 'block' : 'none';
    button.textContent = isHidden ? 'Masquer' : 'Afficher';
    
    if (isHidden && content.innerHTML === 'Chargement...') {
        try {
            const data = await apiCall('fetchContribution', { contributionId: id });
            if (data) {
                renderContributionDetails(content, data);
            } else {
                content.innerHTML = '<p>Erreur chargement des détails.</p>';
            }
        } catch (error) {
            console.error('Erreur chargement détails:', error);
            content.innerHTML = '<p>Erreur chargement des détails.</p>';
        }
    }
}

function renderContributionDetails(element, data) {
    const commHTML = createCommunicationTableHTML(data.communicationEvaluation);
    const critHTML = createCriteriaTableHTML(data.criteriaValues, data.subjectSelected);
    
    element.innerHTML = `
        <p><strong>Enseignant:</strong> ${data.teacherName || '-'}</p>
        <h4>Compétences</h4>
        ${commHTML}
        <h4>Critères (${data.subjectSelected || 'N/A'})</h4>
        ${critHTML}
        <h4>Commentaires</h4>
        <p>${data.teacherComment || '-'}</p>
        <p><small>Dernière modification: ${new Date(data.timestamp || Date.now()).toLocaleString('fr-FR')}</small></p>
    `;
}

function createCommunicationTableHTML(evals = []) {
    return `
        <table class="details-table">
            <thead>
                <tr><th>Comm</th><th>Collab</th><th>Auto</th><th>Rech</th><th>Refl</th></tr>
            </thead>
            <tbody>
                <tr>
                    <td>${evals[0]||'-'}</td>
                    <td>${evals[1]||'-'}</td>
                    <td>${evals[2]||'-'}</td>
                    <td>${evals[3]||'-'}</td>
                    <td>${evals[4]||'-'}</td>
                </tr>
            </tbody>
        </table>
    `;
}

function createCriteriaTableHTML(criteria = {}, subject) {
    const labels = criteriaBySubject[subject] || {};
    let total = 0;
    
    const keys = ['A','B','C','D']; // Utiliser A-D pour toutes les classes
    
    const rows = keys.map(k => {
        const c = criteria[k] || {};
        const final = c.finalLevel ?? '-';
        if (final !== '-' && !isNaN(final)) total += parseFloat(final);
        return `<tr><td>${labels[k]||`Crit. ${k}`}</td><td>${c.sem1 ?? '-'}</td><td>${c.sem2 ?? '-'}</td><td>${final}</td></tr>`;
    }).join('');
    
    let note = 0;
    const maxNote = isDPClass ? 7 : 8;
    if (total > 0) {
        note = Math.round(total/4);
        if (note < 1) note = 1;
        if (note > maxNote) note = maxNote;
    }
    
    const maxThreshold = isDPClass ? 28 : 32;
    
    return `
        <table class="details-table">
            <thead>
                <tr><th>Critère</th><th>S1</th><th>S2</th><th>Final</th></tr>
            </thead>
            <tbody>${rows}</tbody>
            <tfoot>
                <tr><td colspan="3">Seuil /${maxThreshold}:</td><td><strong>${total}</strong></td></tr>
                <tr><td colspan="3">Note /${maxNote}:</td><td><strong>${note}</strong></td></tr>
            </tfoot>
        </table>
    `;
}

// Édition et suppression
async function editContribution(contributionId) {
    try {
        const dataFromServer = await apiCall('fetchContribution', { contributionId });
        
        if (dataFromServer) {
            contributionEntrySections.style.display = "block";
            dataContainer.style.display = "none";
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            currentContributionId = contributionId;
            
            fillFormWithData(dataFromServer);
            
            // Forcer l'utilisation de la photo locale
            const studentName = dataFromServer.studentSelected;
            const localPhotoUrl = studentData[studentName]?.photo || null;
            currentData.studentPhoto = localPhotoUrl;
            
            const photoPreview = document.getElementById('studentPhotoPreview');
            if (localPhotoUrl) {
                photoPreview.src = localPhotoUrl;
                photoPreview.style.display = 'block';
                photoPreview.onerror = () => {
                    console.error(`Erreur chargement image edit: ${localPhotoUrl}`);
                    photoPreview.style.display = 'none';
                };
            } else {
                photoPreview.style.display = 'none';
                photoPreview.src = '#';
            }
            
            // Mettre à jour les sélecteurs
            classSelector.value = dataFromServer.classSelected || '';
            currentData.classSelected = dataFromServer.classSelected;
            populateStudents();
            
            setTimeout(() => {
                studentSelector.value = studentName || '';
                currentData.studentSelected = studentName;
                populateSubjects();
                
                setTimeout(() => {
                    subjectSelector.value = dataFromServer.subjectSelected || '';
                    currentData.subjectSelected = dataFromServer.subjectSelected;
                    updateCriteriaTableHeaders();
                }, 50);
            }, 50);
        } else {
            alert("Erreur lors de la récupération des données de la contribution à modifier.");
            resetOnSubjectChange();
        }
    } catch (error) {
        console.error('Erreur édition contribution:', error);
        alert("Erreur lors de la récupération des données de la contribution à modifier.");
    }
}

async function deleteContribution(contributionId) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la contribution ID: ${contributionId} ? Cette action est irréversible.`)) {
        try {
            const result = await apiCall('deleteContribution', { contributionId });
            
            if (result.success) {
                alert("Contribution supprimée !");
                if (currentData.studentSelected) {
                    fetchStudentContributions(currentData.studentSelected);
                }
                if (currentContributionId === contributionId) {
                    resetOnSubjectChange();
                }
            } else {
                throw new Error(result.error || 'Erreur suppression');
            }
        } catch (error) {
            console.error('Erreur suppression:', error);
            alert(`Erreur Suppression: ${error.message || 'Inconnue'}`);
        }
    }
}

// Génération de documents
async function generateAllWordsInSection() {
    const section = currentData.sectionSelected;
    const classe = currentData.classSelected;

    if (!section || !classe) {
        alert("Veuillez d'abord sélectionner une section et une classe.");
        return;
    }

    const studentList = studentsByClassAndSection[section]?.[classe] || [];
    if (studentList.length === 0) {
        alert(`Aucun élève trouvé pour la classe ${classe} dans la section ${section}.`);
        return;
    }

    const confirmGeneration = confirm(`Vous allez générer ${studentList.length} livret(s) Word individuellement pour la classe ${classe}.\nChaque livret déclenchera un téléchargement séparé.\nVoulez-vous continuer ?`);
    if (!confirmGeneration) {
        return;
    }

    progressBarContainer.style.display = 'block';
    progressText.textContent = `Préparation... (0/${studentList.length})`;
    progressBar.style.width = '0%';
    document.getElementById('generateWordButton').disabled = true;

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < studentList.length; i++) {
        const studentName = studentList[i];
        const photoUrl = studentData[studentName]?.photo || null;

        const currentProgress = Math.round((i / studentList.length) * 100);
        progressText.textContent = `Génération: ${studentName} (${i + 1}/${studentList.length}) - ${currentProgress}%`;
        progressBar.style.width = currentProgress + '%';

        try {
            const result = await downloadWordDocument({
                studentSelected: studentName,
                classSelected: classe,
                sectionSelected: section,
                studentPhotoUrl: photoUrl
            });

            if (result.success) {
                successCount++;
            } else {
                throw new Error(result.error || 'Erreur génération');
            }
        } catch (error) {
            console.error(`Erreur génération pour ${studentName}:`, error);
            alert(`Erreur génération Word pour ${studentName}: ${error.message}`);
            errorCount++;
        }

        const progressAfter = Math.round(((i + 1) / studentList.length) * 100);
        progressBar.style.width = progressAfter + '%';
        progressText.textContent = `Terminé: ${studentName} (${i + 1}/${studentList.length}) - ${progressAfter}%`;

        if (i < studentList.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    progressBar.style.width = '100%';
    progressText.textContent = `Terminé ! (${successCount} succès, ${errorCount} erreurs)`;
    setTimeout(() => {
        progressBarContainer.style.display = 'none';
        progressBar.style.width = '0%';
        progressText.textContent = '0%';
    }, 3000);
    document.getElementById('generateWordButton').disabled = false;

    console.log(`Génération terminée. Succès: ${successCount}, Erreurs: ${errorCount}`);
}

function handleDownloadLink(data) {
    if (!data || !data.filePath || !data.fileName) {
        console.error("Données de téléchargement invalides", data);
        return;
    }

    const link = document.createElement('a');
    link.href = data.filePath.startsWith('/') ? data.filePath : '/' + data.filePath;
    link.download = data.fileName;
    document.body.appendChild(link);

    try {
        link.click();
        console.log(`Téléchargement déclenché: ${data.fileName}`);
    } catch (e) {
        console.error("Erreur téléchargement:", e);
        alert(`Impossible de lancer le téléchargement pour ${data.fileName}.`);
    }

    setTimeout(() => {
        if (document.body.contains(link)) {
            document.body.removeChild(link);
        }
    }, 100);
}

// Génération Excel (placeholder)
function generateExcel() {
    alert("Fonctionnalité Excel en cours d'implémentation.");
}

// Fonctions de réinitialisation
function resetOnSectionChange() {
    classSelector.value = '';
    studentSelector.innerHTML = "<option value=''>-- Sélectionnez un élève --</option>";
    document.getElementById('step3').style.display = "none";
    studentInfoContainer.style.display = "none";
    contributionEntrySections.style.display = "none";
    dataContainer.style.display = "none";
    currentData.classSelected = null;
    currentData.studentSelected = null;
    currentData.subjectSelected = null;
    resetFormData();
}

function resetOnClassChange() {
    studentSelector.innerHTML = "<option value=''>-- Sélectionnez un élève --</option>";
    document.getElementById('step3').style.display = "none";
    currentData.classSelected = classSelector.value;
    resetOnStudentChange();
}

function resetOnStudentChange() {
    subjectSelector.innerHTML = "<option value=''>-- Sélectionnez une matière --</option>";
    document.getElementById('step2').style.display = "none";
    studentInfoContainer.style.display = "none";
    currentData.studentSelected = studentSelector.value;
    resetOnSubjectChange();
    dataContainer.style.display = "none";
}

function resetOnSubjectChange() {
    contributionEntrySections.style.display = "none";
    currentData.subjectSelected = subjectSelector.value;
    resetFormData();
}

function resetFormData() {
    resetInputTables();
    currentData.teacherComment = null;
    currentData.communicationEvaluation = ['', '', '', '', ''];
    currentData.unitsSem1 = 1;
    currentData.unitsSem2 = 1;
    
    // Réinitialiser les sélecteurs d'unités
    document.getElementById('unitsSem1Selector').value = '1';
    document.getElementById('unitsSem2Selector').value = '1';
    
    // Utiliser A-D pour toutes les classes (PEI et DP)
    currentData.criteriaValues = {
        A: {sem1: null, sem2: null, finalLevel: null, sem1Units: [], sem2Units: []},
        B: {sem1: null, sem2: null, finalLevel: null, sem1Units: [], sem2Units: []},
        C: {sem1: null, sem2: null, finalLevel: null, sem1Units: [], sem2Units: []},
        D: {sem1: null, sem2: null, finalLevel: null, sem1Units: [], sem2Units: []}
    };
    currentContributionId = null;
}

function resetInputTables() {
    // Réinitialiser les tableaux français
    document.querySelectorAll("#communicationTable tbody select").forEach(s => s.value = '');
    document.querySelectorAll("#criteriaTableBody input").forEach(i => {
        if (!i.readOnly) i.value = '';
    });
    const thresholdInput = document.getElementById("threshold");
    const finalNoteInput = document.getElementById("finalNote");
    if (thresholdInput) thresholdInput.value = '';
    if (finalNoteInput) finalNoteInput.value = '';
    const teacherComment = document.getElementById('teacherComment');
    if (teacherComment) teacherComment.value = '';
    
    // Réinitialiser les tableaux arabes
    document.querySelectorAll("#communicationTableArabic tbody select").forEach(s => s.value = '');
    document.querySelectorAll("#criteriaTableBodyArabic input").forEach(i => {
        if (!i.readOnly) i.value = '';
    });
    const thresholdInputArabic = document.getElementById("thresholdArabic");
    const finalNoteInputArabic = document.getElementById("finalNoteArabic");
    if (thresholdInputArabic) thresholdInputArabic.value = '';
    if (finalNoteInputArabic) finalNoteInputArabic.value = '';
    const teacherCommentArabic = document.getElementById('teacherCommentArabic');
    if (teacherCommentArabic) teacherCommentArabic.value = '';
}

// Fonction utilitaire pour les couleurs
function getSubjectColor(subject) {
    const colors = {
        "L.L": "#0d6efd",
        "Mathématiques": "#198754",
        "I.S": "#6f42c1",
        "Sciences": "#ffc107",
        "Biologie": "#0dcaf0",
        "Physique-Chimie": "#d63384",
        "Langue Anglaise": "#adb5bd",
        "Design": "#6610f2",
        "Musique": "#dc3545",
        "ART": "#dc3545",
        "Éducation Physique": "#000",
        "E.S": "#6c757d"
    };
    return colors[subject] || "#6c757d";
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    if (currentData.teacherName) {
        teacherNameInput.value = currentData.teacherName;
    }
    console.log("Application prête.");
});
