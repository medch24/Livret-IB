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
    criteriaValues: {
        A: {sem1: null, sem2: null, finalLevel: null},
        B: {sem1: null, sem2: null, finalLevel: null},
        C: {sem1: null, sem2: null, finalLevel: null},
        D: {sem1: null, sem2: null, finalLevel: null}
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

// Données des étudiants - Garçons
const studentData = {
    'Faysal': {birthdate: '2014-04-15', photo: 'https://lh3.googleusercontent.com/d/1IB6BKROX3TRxaIIHVVVWbB7-Ii-V8VrC'},
    'Bilal': {birthdate: '2015-02-15', photo: 'https://lh3.googleusercontent.com/d/1B0QUZJhpSad5Fs3qRTugUe4oyTlUDEVu'},
    'Jad': {birthdate: '2014-08-15', photo: 'https://lh3.googleusercontent.com/d/1VLvrWjeJwaClf4pSaLiwjnS79N-HrsFr'},
    'Manaf': {birthdate: '2014-08-15', photo: 'https://lh3.googleusercontent.com/d/1h46Tqtqcp5tNqdY62wV6pyZFYknCEMWY'},
    'Ahmed': {birthdate: '2013-09-15', photo: 'https://lh3.googleusercontent.com/d/1cDF-yegSB2tqsWac0AoNttbi8qAALYT1'},
    'Yasser': {birthdate: '2013-08-15', photo: 'https://lh3.googleusercontent.com/d/1UUrrAJV_bgFNktGDinDkSrpwSZz-e47T'},
    'Eyad': {birthdate: '2013-04-15', photo: 'https://lh3.googleusercontent.com/d/1HGyWS4cC1jWWD25Ah3WcT_eIbUHqFzJ1'},
    'Ali': {birthdate: '2013-04-15', photo: 'https://lh3.googleusercontent.com/d/1bN-fDf_IWkXoW3WjSOXI5_M4KkL3FDKr'},
    'Seifeddine': {birthdate: '2012-01-15', photo: 'https://lh3.googleusercontent.com/d/1tWdPSbtCAsTMB86WzDgqh3Xw01ahm9s6'},
    'Mohamed': {birthdate: '2011-11-15', photo: 'https://lh3.googleusercontent.com/d/1lB8ObGOvQDVT6FITL2y7C5TYmAGyggFn'},
    'Wajih': {birthdate: '2012-06-15', photo: 'https://lh3.googleusercontent.com/d/1MH6M05mQamOHevmDffVFNpSFNnxqbxs3'},
    'Ahmad': {birthdate: '2012-02-15', photo: 'https://lh3.googleusercontent.com/d/1zU-jBuAbYjHanzank9C1BAd00skS1Y5J'},
    'Adam': {birthdate: '2012-12-15', photo: 'https://lh3.googleusercontent.com/d/15I9p6VSnn1yVmPxRRbGsUkM-fsBKYOWF'},
    'Mohamed Younes': {birthdate: '2011-11-15', photo: 'https://lh3.googleusercontent.com/d/1wzraoZY_lRafcDXeaxSBeX5cIU57p4xA'},
    'Mohamed Amine': {birthdate: '2012-12-15', photo: 'https://lh3.googleusercontent.com/d/1UrBw6guz0oBTUy8COGeewIs3XAK773bR'},
    'Samir': {birthdate: '2012-12-15', photo: 'https://lh3.googleusercontent.com/d/1NdaCH8CU0DJFHXw4D0lItP-QnCswl23b'},
    'Abdulrahman': {birthdate: '2012-04-15', photo: 'https://lh3.googleusercontent.com/d/1yCTO5StU2tnPY0BEynnWzUveljMIUcLE'},
    'Youssef': {birthdate: '2011-11-15', photo: 'https://lh3.googleusercontent.com/d/1Bygg5-PYrjjMOZdI5hAe16eZ8ltn772e'},
    'Habib': {birthdate: '2008-10-15', photo: 'https://lh3.googleusercontent.com/d/13u4y6JIyCBVQ_9PCwYhh837byyK9g8pF'},
    'Salah': {birthdate: '2008-07-15', photo: 'https://lh3.googleusercontent.com/d/1IG8S_i6jD8O6C2QD_nwLxrG932QgIVXu'},
    // Données des filles
    'Yomna Masrouhi': {birthdate: '2009-09-07', photo: null},
    'Isra Elalmi': {birthdate: '2008-03-25', photo: null},
    'Naya Sabbidine': {birthdate: '2014-02-28', photo: null},
    'Israa Alkattan': {birthdate: '2013-09-19', photo: null},
    'Dina Tlili': {birthdate: '2012-12-22', photo: null},
    'Lina Tlili': {birthdate: '2012-12-22', photo: null},
    'Cynthia Fadlallah': {birthdate: '2013-12-06', photo: null},
    'Neyla Molina': {birthdate: '2014-01-13', photo: null},
    'Jawahair Eshmawi': {birthdate: '2012-03-19', photo: null},
    'Yousr Letaief': {birthdate: '2011-06-14', photo: null},
    'Sarah Aldebasy': {birthdate: '2011-07-24', photo: null},
    'Maria Wahib': {birthdate: '2011-07-16', photo: null},
    'Badia Khaldi': {birthdate: '2010-12-23', photo: null},
    'Luluwah Alghabashi': {birthdate: '2010-04-29', photo: null}
};

// Matières par classe
const subjectsByClass = {
    PEI1: ["Acquisition de langues (Anglais)", "Langue et littérature (Français)", "Individus et sociétés", "Sciences", "Mathématiques", "Arts", "Éducation physique et à la santé", "Design"],
    PEI2: ["Acquisition de langues (Anglais)", "Langue et littérature (Français)", "Individus et sociétés", "Sciences", "Mathématiques", "Arts", "Éducation physique et à la santé", "Design"],
    PEI3: ["Acquisition de langues (Anglais)", "Langue et littérature (Français)", "Individus et sociétés", "Sciences", "Mathématiques", "Arts", "Éducation physique et à la santé", "Design"],
    PEI4: ["Acquisition de langues (Anglais)", "Langue et littérature (Français)", "Individus et sociétés", "Sciences", "Mathématiques", "Arts", "Éducation physique et à la santé", "Design"],
    PEI5: ["Acquisition de langues (Anglais)", "Langue et littérature (Français)", "Individus et sociétés", "Sciences", "Mathématiques", "Arts", "Éducation physique et à la santé", "Design"],
    DP1: ["Langue et Littérature (Français NM)", "Langue Anglaise (NM)", "Géographie (NM)", "Mathématiques AA (NS)", "Biologie (NS)", "Physique (NS)", "Théorie de la Connaissance (TdC)", "Mémoire (EE)", "CAS"],
    DP2: ["Langue et Littérature (Français NM)", "Langue Anglaise (NM)", "Géographie (NM)", "Mathématiques AA (NS)", "Biologie (NS)", "Physique (NS)", "Théorie de la Connaissance (TdC)", "Mémoire (EE)", "CAS"]
};

// Critères par matière
const criteriaBySubject = {
    // Matières PEI (PEI1-PEI5)
    "Acquisition de langues (Anglais)": {A: "Listening", B: "Reading", C: "Speaking", D: "Writing"},
    "Langue et littérature (Français)": {A: "Analyse", B: "Organisation", C: "Production de texte", D: "Utilisation de la langue"},
    "Individus et sociétés": {A: "Connaissances et compréhension", B: "Recherche", C: "Communication", D: "Pensée critique"},
    "Sciences": {A: "Connaissances et compréhension", B: "Recherche et élaboration", C: "Traitement et évaluation", D: "Réflexion sur les répercussions"},
    "Mathématiques": {A: "Connaissances et compréhension", B: "Recherche de modèles", C: "Communication", D: "Application des mathématiques"},
    "Arts": {A: "Connaissances et compréhension", B: "Développement des compétences", C: "Pensée créative", D: "Réaction"},
    "Éducation physique et à la santé": {A: "Connaissances et compréhension", B: "Planification", C: "Application et exécution", D: "Réflexion et amélioration"},
    "Design": {A: "Recherche et analyse", B: "Développement des idées", C: "Création de la solution", D: "Évaluation"},
    // Matières DP (DP1 et DP2)
    "Langue et Littérature (Français NM)": {AO1: "Connaissances et compréhension des œuvres littéraires et des textes non-littéraires", AO2: "Application des compétences d'analyse et d'interprétation", AO3: "Communication claire, précise et efficace", AO4: "Maîtrise de l'usage de la langue"},
    "Langue Anglaise (NM)": {AO1: "Communication d'idées (interaction orale et écrite)", AO2: "Compréhension des messages (lecture, écoute)", AO3: "Maîtrise de la langue (précision, vocabulaire, prononciation/orthographe)", AO4: "Développement de la sensibilité interculturelle"},
    "Géographie (NM)": {AO1: "Connaissances des concepts, des théories et des processus géographiques", AO2: "Application et analyse des données et des techniques géographiques", AO3: "Synthèse, évaluation et argumentation", AO4: "Sélection, organisation et présentation de l'information"},
    "Mathématiques AA (NS)": {AO1: "Connaissances et compréhension des concepts, principes et méthodes mathématiques", AO2: "Modélisation et résolution de problèmes dans des contextes variés", AO3: "Communication des raisonnements mathématiques", AO4: "Utilisation efficace de la technologie"},
    "Biologie (NS)": {AO1: "Connaissances et compréhension des faits, concepts et méthodologies", AO2: "Application des connaissances et des techniques scientifiques", AO3: "Formulation, analyse et évaluation des hypothèses, méthodes et conclusions", AO4: "Maîtrise des techniques expérimentales"},
    "Physique (NS)": {AO1: "Connaissances et compréhension des faits, concepts et méthodologies", AO2: "Application des connaissances et des techniques scientifiques", AO3: "Formulation, analyse et évaluation des hypothèses, méthodes et conclusions", AO4: "Maîtrise des techniques expérimentales"},
    "Théorie de la Connaissance (TdC)": {AO1: "Réflexion sur les Questions de Connaissance", AO2: "Exploration des Cadres de Connaissance", AO3: "Lien entre les concepts de TdC et des situations réelles"},
    "Mémoire (EE)": {AO1: "Développement d'une Question de Recherche", AO2: "Capacité à mener une recherche indépendante et pertinente", AO3: "Développement d'une argumentation structurée et critique", AO4: "Réflexion sur le processus d'apprentissage"},
    "CAS": {AO1: "Atteinte des 7 Résultats d'Apprentissage du CAS", AO2: "Réflexion régulière, honnête et approfondie sur les activités", AO3: "Planification et mise en œuvre du Projet CAS"}
};

// Élèves par classe et section
const studentsByClassAndSection = {
    garçons: {
        PEI1: ["Bilal", "Faysal", "Jad", "Manaf"],
        PEI2: ["Ahmed", "Ali", "Eyad", "Yasser"],
        PEI3: ["Adam", "Ahmad", "Mohamed", "Seifeddine", "Wajih"],
        PEI4: ["Abdulrahman", "Mohamed Amine", "Mohamed Younes", "Samir", "Youssef"],
        PEI5: ["Badia Khaldi", "Luluwah Alghabashi"],
        DP1: ["Yomna Masrouhi"],
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
}

function handleStudentBirthdateChange(value) {
    currentData.studentBirthdate = value;
}

function handleCommentChange(value) {
    currentData.teacherComment = value;
}

function handleCommunicationChange() {
    currentData.communicationEvaluation = Array.from(
        document.querySelectorAll("#communicationTable tbody select")
    ).map(sel => sel.value);
}

function handleCriteriaChange(inputElement) {
    const row = inputElement.closest('tr');
    if (!row) return;
    
    const criteriaTypeLabel = row.cells[0].textContent;
    const isDPClass = currentData.classSelected === 'DP1' || currentData.classSelected === 'DP2';
    let criteriaType;
    if (isDPClass) {
        const match = criteriaTypeLabel?.match(/^(AO\d+)/);
        criteriaType = match ? match[1] : null;
    } else {
        criteriaType = criteriaTypeLabel?.charAt(0);
    }

    const sem1Input = row.cells[1]?.querySelector('input');
    const sem2Input = row.cells[2]?.querySelector('input');
    
    const sem1Value = sem1Input?.value !== '' ? parseFloat(sem1Input.value) : null;
    const sem2Value = sem2Input?.value !== '' ? parseFloat(sem2Input.value) : null;
    
    if (!currentData.criteriaValues[criteriaType]) {
        currentData.criteriaValues[criteriaType] = { sem1: null, sem2: null, finalLevel: null };
    }
    
    currentData.criteriaValues[criteriaType].sem1 = sem1Value;
    currentData.criteriaValues[criteriaType].sem2 = sem2Value;
    
    calculateRow(row);
}

// Logique de sélection
function handleSectionChange(value) {
    currentData.sectionSelected = value;
    document.getElementById('step1').style.display = 'block';
    resetOnSectionChange();
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
        contributionEntrySections.style.display = "block";
        dataContainer.style.display = "none";
        fetchData();
        updateCriteriaTableDynamically();
        updateCriteriaTableHeaders();
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
            option.value = student;
            option.textContent = student;
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
    const isDPClass = currentData.classSelected === 'DP1' || currentData.classSelected === 'DP2';
    
    rows.forEach((row, index) => {
        let key;
        if (isDPClass) {
            // Pour DP: AO1, AO2, AO3, AO4
            key = 'AO' + (index + 1);
        } else {
            // Pour PEI: A, B, C, D
            key = String.fromCharCode(65 + index);
        }
        const labelCell = row.cells[0];
        if (labelCell) {
            labelCell.textContent = `${key}: ${criteriaLabels[key] || 'Critère ' + key}`;
        }
    });
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
    const criteriaLabel = rowElement.cells[0]?.textContent;
    const isDPClass = currentData.classSelected === 'DP1' || currentData.classSelected === 'DP2';
    let criteriaType;
    
    if (isDPClass) {
        // Pour DP: extraire AO1, AO2, etc.
        const match = criteriaLabel?.match(/^(AO\d+)/);
        criteriaType = match ? match[1] : null;
    } else {
        // Pour PEI: extraire A, B, C, D
        criteriaType = criteriaLabel?.charAt(0);
    }
    
    const sem1Input = rowElement.cells[1]?.querySelector('input');
    const sem2Input = rowElement.cells[2]?.querySelector('input');
    const finalLevelInput = rowElement.cells[3]?.querySelector('input');
    
    if (!criteriaType || !sem1Input || !sem2Input || !finalLevelInput) return;
    
    const sem1Value = sem1Input.value !== '' ? parseFloat(sem1Input.value) : null;
    const sem2Value = sem2Input.value !== '' ? parseFloat(sem2Input.value) : null;
    
    let finalLevel = null;
    if (sem1Value !== null && sem2Value !== null) {
        finalLevel = Math.round((sem1Value + sem2Value) / 2);
    } else if (sem1Value !== null) {
        finalLevel = sem1Value;
    } else if (sem2Value !== null) {
        finalLevel = sem2Value;
    }
    
    finalLevelInput.value = (finalLevel !== null) ? finalLevel : '';
    
    if (!currentData.criteriaValues[criteriaType]) {
        currentData.criteriaValues[criteriaType] = { sem1: null, sem2: null, finalLevel: null };
    }
    currentData.criteriaValues[criteriaType].sem1 = sem1Value;
    currentData.criteriaValues[criteriaType].sem2 = sem2Value;
    currentData.criteriaValues[criteriaType].finalLevel = finalLevel;
    
    calculateTotals();
}

function calculateTotals() {
    const rows = document.querySelectorAll("#criteriaTable tbody tr");
    const isDPClass = currentData.classSelected === 'DP1' || currentData.classSelected === 'DP2';
    const maxNote = isDPClass ? 7 : 8;
    const maxThreshold = isDPClass ? 28 : 32; // 4 critères * 7 ou 8
    
    let totalLevel = 0;
    
    rows.forEach(row => {
        const finalLevelInput = row.cells[3]?.querySelector('input');
        if (finalLevelInput?.value !== '') {
            totalLevel += parseFloat(finalLevelInput.value);
        }
    });
    
    document.getElementById("threshold").value = totalLevel;
    
    let finalNote = 0;
    if (totalLevel > 0) {
        finalNote = Math.round(totalLevel / 4);
        if (finalNote < 1) finalNote = 1;
        if (finalNote > maxNote) finalNote = maxNote;
    }
    
    document.getElementById("finalNote").value = finalNote;
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
    teacherNameInput.value = data.teacherName || currentData.teacherName || '';
    currentData.teacherName = teacherNameInput.value;
    localStorage.setItem('teacherName', currentData.teacherName);
    
    document.getElementById('teacherComment').value = data.teacherComment || '';
    currentData.teacherComment = data.teacherComment;
    
    currentData.communicationEvaluation = data.communicationEvaluation || ['', '', '', '', ''];
    document.querySelectorAll("#communicationTable tbody select").forEach((s, i) => {
        s.value = currentData.communicationEvaluation[i] || '';
    });
    
    // Supporte PEI (A-D) et DP (AO1-AO4)
    currentData.criteriaValues = data.criteriaValues ? JSON.parse(JSON.stringify(data.criteriaValues)) : {A:{},B:{},C:{},D:{}};
    const isDPClass = currentData.classSelected === 'DP1' || currentData.classSelected === 'DP2';
    const rows = document.querySelectorAll("#criteriaTable tbody tr");
    rows.forEach((row, i) => {
        const key = isDPClass ? ('AO' + (i+1)) : String.fromCharCode(65 + i);
        const critData = currentData.criteriaValues[key];
        const sem1Input = row.cells[1]?.querySelector('input');
        const sem2Input = row.cells[2]?.querySelector('input');
        
        if (sem1Input) sem1Input.value = critData?.sem1 ?? '';
        if (sem2Input) sem2Input.value = critData?.sem2 ?? '';
        calculateRow(row);
    });
    
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
    
    const isDPClass = currentData.classSelected === 'DP1' || currentData.classSelected === 'DP2';
    const keys = isDPClass ? ['AO1','AO2','AO3','AO4'] : ['A','B','C','D'];
    
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
    
    const isDPClass = currentData.classSelected === 'DP1' || currentData.classSelected === 'DP2';
    if (isDPClass) {
        currentData.criteriaValues = {
            AO1: {sem1: null, sem2: null, finalLevel: null},
            AO2: {sem1: null, sem2: null, finalLevel: null},
            AO3: {sem1: null, sem2: null, finalLevel: null},
            AO4: {sem1: null, sem2: null, finalLevel: null}
        };
    } else {
        currentData.criteriaValues = {
            A: {sem1: null, sem2: null, finalLevel: null},
            B: {sem1: null, sem2: null, finalLevel: null},
            C: {sem1: null, sem2: null, finalLevel: null},
            D: {sem1: null, sem2: null, finalLevel: null}
        };
    }
    currentContributionId = null;
}

function resetInputTables() {
    document.querySelectorAll("#communicationTable tbody select").forEach(s => s.value = '');
    document.querySelectorAll("#criteriaTable tbody input").forEach(i => {
        if (!i.readOnly) i.value = '';
    });
    document.getElementById("threshold").value = '';
    document.getElementById("finalNote").value = '';
    document.getElementById('teacherComment').value = '';
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
