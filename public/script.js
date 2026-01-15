/**
 * Script de gestion du Livret Scolaire
 * Version corrigée pour intégration Vercel + MongoDB
 */

// Variables d'état globales
let currentData = {
    contributionId: null,
    teacherName: localStorage.getItem('teacherName') || '',
    classSelected: null,
    sectionSelected: null,
    subjectSelected: null,
    studentSelected: null,
    studentBirthdate: null,
    teacherComment: '',
    communicationEvaluation: ['', '', '', '', ''],
    unitsSem1: 1,
    unitsSem2: 1,
    criteriaValues: {
        A: { sem1: null, sem2: null, finalLevel: null, sem1Units: [], sem2Units: [] },
        B: { sem1: null, sem2: null, finalLevel: null, sem1Units: [], sem2Units: [] },
        C: { sem1: null, sem2: null, finalLevel: null, sem1Units: [], sem2Units: [] },
        D: { sem1: null, sem2: null, finalLevel: null, sem1Units: [], sem2Units: [] }
    }
};

let currentContributionId = null;

// --- CONFIGURATION DONNÉES ÉLÈVES ---
const studentsByClassAndSection = {
    garçons: {
        PEI1: ["Bilal Molina", "Faysal Achar", "Jad Mahayni", "Manaf Kotbi"],
        PEI2: ["Ahmed Bouaziz", "Ali Kutbi", "Eyad Hassan", "Yasser Younes"],
        PEI3: ["Adam Kaaki", "Ahmad Mahayni", "Mohamed Chalak", "Seifeddine Ayadi", "Wajih Sabadine"],
        PEI4: ["Abdulrahman Bouaziz", "Mohamed Amine Sgheir", "Mohamed Younes", "Samir Kaaki", "Youssef Baakak"],
        DP2: ["Habib Lteif", "Salah Boumalouga"]
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

const subjectsByClass = {
    PEI1: ["Mathématiques", "Individus et sociétés", "Langue et littérature (Français)", "Design", "Sciences", "Arts", "Éducation physique et à la santé", "Acquisition de langues (Anglais)", "Acquisition de langue (اللغة العربية)"],
    PEI2: ["Mathématiques", "Individus et sociétés", "Langue et littérature (Français)", "Design", "Sciences", "Arts", "Éducation physique et à la santé", "Acquisition de langues (Anglais)", "Acquisition de langue (اللغة العربية)"],
    PEI3: ["Mathématiques", "Individus et sociétés", "Langue et littérature (Français)", "Design", "Sciences", "Arts", "Éducation physique et à la santé", "Acquisition de langues (Anglais)", "Acquisition de langue (اللغة العربية)"],
    PEI4: ["Mathématiques", "Individus et sociétés", "Langue et littérature (Français)", "Design", "Sciences", "Arts", "Éducation physique et à la santé", "Acquisition de langues (Anglais)", "Acquisition de langue (اللغة العربية)"],
    PEI5: ["Mathématiques", "Individus et sociétés", "Langue et littérature (Français)", "Design", "Sciences", "Arts", "Éducation physique et à la santé", "Acquisition de langues (Anglais)", "Acquisition de langue (اللغة العربية)"],
    DP1: ["Mathématiques", "Individus et sociétés", "Langue et littérature (Français)", "Design", "Sciences", "Arts", "Éducation physique et à la santé", "Acquisition de langues (Anglais)", "Acquisition de langue (اللغة العربية)"],
    DP2: ["Mathématiques", "Individus et sociétés", "Langue et littérature (Français)", "Design", "Sciences", "Arts", "Éducation physique et à la santé", "Acquisition de langues (Anglais)", "Acquisition de langue (اللغة العربية)"]
};

// --- UTILITAIRES API ---

async function apiCall(endpoint, data) {
    const response = await fetch(`/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
    return await response.json();
}

// --- GESTION DES ÉVÉNEMENTS UI ---

function handleSectionChange(section) {
    currentData.sectionSelected = section;
    document.getElementById('step0').style.display = 'none';
    document.getElementById('step1').style.display = 'block';
    
    // Populate classes
    const classSelector = document.getElementById('classSelector');
    classSelector.innerHTML = '<option value="">-- Sélectionnez une Classe --</option>';
    Object.keys(studentsByClassAndSection[section]).forEach(cls => {
        const opt = document.createElement('option');
        opt.value = cls; opt.textContent = cls;
        classSelector.appendChild(opt);
    });
}

function handleClassChange(cls) {
    currentData.classSelected = cls;
    if (!cls) return;
    document.getElementById('step3').style.display = 'block';
    const studentSelector = document.getElementById('studentSelector');
    studentSelector.innerHTML = '<option value="">-- Sélectionnez un élève --</option>';
    
    const students = studentsByClassAndSection[currentData.sectionSelected][cls] || [];
    students.forEach(st => {
        const opt = document.createElement('option');
        opt.value = st; opt.textContent = st;
        studentSelector.appendChild(opt);
    });
}

async function handleStudentChange(student) {
    currentData.studentSelected = student;
    if (!student) return;
    
    document.getElementById('studentInfoContainer').style.display = 'block';
    document.getElementById('studentNameDisplay').textContent = student;
    document.getElementById('step2').style.display = 'block';
    
    // Charger infos élève (date de naissance)
    const info = await apiCall('fetchStudentInfo', { studentSelected: student });
    document.getElementById('studentBirthdate').value = info.birthDate || '';
    currentData.studentBirthdate = info.birthDate || '';

    // Populate Subjects
    const subjectSelector = document.getElementById('subjectSelector');
    subjectSelector.innerHTML = '<option value="">-- Sélectionnez une matière --</option>';
    subjectsByClass[currentData.classSelected].forEach(sub => {
        const opt = document.createElement('option');
        opt.value = sub; opt.textContent = sub;
        subjectSelector.appendChild(opt);
    });
}

function handleSubjectChange(subject) {
    currentData.subjectSelected = subject;
    if (!subject) return;

    const isArabic = subject.includes('العربية');
    document.getElementById('contributionEntrySections').style.display = 'block';
    
    // Toggle sections Langue
    document.querySelectorAll('.french-section').forEach(s => s.style.display = isArabic ? 'none' : 'block');
    document.querySelectorAll('.arabic-section').forEach(s => s.style.display = isArabic ? 'block' : 'none');

    rebuildCriteriaTable();
}

// --- LOGIQUE DE CALCUL ET TABLEAU ---

function handleUnitsChange() {
    const isArabic = currentData.subjectSelected?.includes('العربية');
    currentData.unitsSem1 = parseInt(document.getElementById(isArabic ? 'unitsSem1SelectorArabic' : 'unitsSem1Selector').value);
    currentData.unitsSem2 = parseInt(document.getElementById(isArabic ? 'unitsSem2SelectorArabic' : 'unitsSem2Selector').value);
    rebuildCriteriaTable();
}

function rebuildCriteriaTable() {
    const isArabic = currentData.subjectSelected?.includes('العربية');
    const isDP = currentData.classSelected?.startsWith('DP');
    const maxVal = isDP ? 7 : 8;
    const tbody = document.getElementById(isArabic ? 'criteriaTableBodyArabic' : 'criteriaTableBody');
    const thead = document.getElementById(isArabic ? 'criteriaTableHeadArabic' : 'criteriaTableHead');
    
    // Reconstruction dynamique du header (selon nombre d'unités)
    let headerRow = `<tr><th>${isArabic ? 'المعايير' : 'Critères'}</th>`;
    for(let i=1; i<=currentData.unitsSem1; i++) headerRow += `<th>S1-U${i}</th>`;
    if(currentData.unitsSem1 > 1) headerRow += `<th style="background:#e7f3ff">Moy S1</th>`;
    for(let i=1; i<=currentData.unitsSem2; i++) headerRow += `<th>S2-U${i}</th>`;
    if(currentData.unitsSem2 > 1) headerRow += `<th style="background:#e7f3ff">Moy S2</th>`;
    headerRow += `<th>Final /${maxVal}</th><th>Seuil /${maxVal*4}</th><th>Note /${maxVal}</th></tr>`;
    thead.innerHTML = headerRow;

    // Reconstruction du body
    const criteria = ['A', 'B', 'C', 'D'];
    tbody.innerHTML = '';
    criteria.forEach((letter, index) => {
        const tr = document.createElement('tr');
        tr.dataset.criteria = letter;
        let html = `<td>${letter}</td>`;
        
        // Inputs Semestre 1
        for(let i=0; i<currentData.unitsSem1; i++) {
            const val = currentData.criteriaValues[letter].sem1Units[i] || '';
            html += `<td><input type="number" min="0" max="${maxVal}" value="${val}" oninput="updateValues(this, 'sem1', ${i})"></td>`;
        }
        if(currentData.unitsSem1 > 1) html += `<td class="bg-light"><input type="number" readonly class="moy-s1"></td>`;

        // Inputs Semestre 2
        for(let i=0; i<currentData.unitsSem2; i++) {
            const val = currentData.criteriaValues[letter].sem2Units[i] || '';
            html += `<td><input type="number" min="0" max="${maxVal}" value="${val}" oninput="updateValues(this, 'sem2', ${i})"></td>`;
        }
        if(currentData.unitsSem2 > 1) html += `<td class="bg-light"><input type="number" readonly class="moy-s2"></td>`;

        // Final + Seuil/Note globale
        html += `<td><input type="number" readonly class="final-level"></td>`;
        if(index === 0) {
            html += `<td rowspan="4"><input type="number" readonly id="${isArabic ? 'thresholdArabic' : 'threshold'}" style="background:#eee"></td>`;
            html += `<td rowspan="4"><input type="number" readonly id="${isArabic ? 'finalNoteArabic' : 'finalNote'}" style="background:#eee"></td>`;
        }
        tr.innerHTML = html;
        tbody.appendChild(tr);
    });
    calculateAll();
}

function updateValues(input, sem, index) {
    const letter = input.closest('tr').dataset.criteria;
    const val = input.value === '' ? null : parseFloat(input.value);
    
    if (sem === 'sem1') currentData.criteriaValues[letter].sem1Units[index] = val;
    else currentData.criteriaValues[letter].sem2Units[index] = val;
    
    calculateAll();
}

function calculateAll() {
    let totalSeuil = 0;
    const criteria = ['A', 'B', 'C', 'D'];
    
    criteria.forEach(letter => {
        const row = document.querySelector(`tr[data-criteria="${letter}"]`);
        if(!row) return;

        // Moyenne S1
        const s1Units = currentData.criteriaValues[letter].sem1Units.filter(v => v !== null && v !== undefined);
        const moyS1 = s1Units.length ? Math.round(s1Units.reduce((a,b)=>a+b, 0) / s1Units.length) : null;
        currentData.criteriaValues[letter].sem1 = moyS1;
        const moyS1Input = row.querySelector('.moy-s1');
        if(moyS1Input) moyS1Input.value = moyS1 ?? '';

        // Moyenne S2
        const s2Units = currentData.criteriaValues[letter].sem2Units.filter(v => v !== null && v !== undefined);
        const moyS2 = s2Units.length ? Math.round(s2Units.reduce((a,b)=>a+b, 0) / s2Units.length) : null;
        currentData.criteriaValues[letter].sem2 = moyS2;
        const moyS2Input = row.querySelector('.moy-s2');
        if(moyS2Input) moyS2Input.value = moyS2 ?? '';

        // Niveau Final (Moyenne des deux semestres)
        let final = null;
        if(moyS1 !== null && moyS2 !== null) final = Math.round((moyS1 + moyS2) / 2);
        else if(moyS1 !== null) final = moyS1;
        else if(moyS2 !== null) final = moyS2;
        
        currentData.criteriaValues[letter].finalLevel = final;
        row.querySelector('.final-level').value = final ?? '';
        if(final !== null) totalSeuil += final;
    });

    const isArabic = currentData.subjectSelected?.includes('العربية');
    const seuilInput = document.getElementById(isArabic ? 'thresholdArabic' : 'threshold');
    const noteInput = document.getElementById(isArabic ? 'finalNoteArabic' : 'finalNote');
    
    if(seuilInput) seuilInput.value = totalSeuil;
    const finalNote = Math.round(totalSeuil / 4);
    if(noteInput) noteInput.value = totalSeuil > 0 ? (finalNote || 1) : '';
    
    currentData.finalNote = finalNote;
    currentData.threshold = totalSeuil;
}

// --- PERSISTENCE ET GÉNÉRATION ---

function handleCommunicationChange() {
    const isArabic = currentData.subjectSelected?.includes('العربية');
    const selector = isArabic ? "#communicationTableArabic select" : "#communicationTable select";
    currentData.communicationEvaluation = Array.from(document.querySelectorAll(selector)).map(s => s.value);
}

async function submitForm() {
    handleCommunicationChange();
    currentData.teacherName = document.getElementById(currentData.subjectSelected?.includes('العربية') ? 'teacherNameArabic' : 'teacherName').value;
    currentData.teacherComment = document.getElementById(currentData.subjectSelected?.includes('العربية') ? 'teacherCommentArabic' : 'teacherComment').value;
    currentData.studentBirthdate = document.getElementById('studentBirthdate').value;
    
    localStorage.setItem('teacherName', currentData.teacherName);

    try {
        const res = await apiCall('saveContribution', currentData);
        if(res.success) alert("✅ Contribution enregistrée avec succès !");
    } catch(e) { alert("❌ Erreur: " + e.message); }
}

async function generateAllWordsInSection() {
    const { sectionSelected, classSelected } = currentData;
    if(!sectionSelected || !classSelected) return alert("Sélectionnez une section et une classe !");

    const bar = document.getElementById('progressBar');
    const cont = document.getElementById('progressContainer');
    cont.style.display = 'block';

    try {
        const { students } = await apiCall('getStudentsList', { sectionSelected, classSelected });
        if(!students.length) return alert("Aucun élève trouvé.");

        for(let i=0; i < students.length; i++){
            const name = students[i];
            bar.style.width = `${((i+1)/students.length)*100}%`;
            
            const response = await fetch('/api/generateSingleWord', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentSelected: name, classSelected, sectionSelected })
            });

            if(response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = `Livret_${name}.docx`;
                document.body.appendChild(a); a.click();
                window.URL.revokeObjectURL(url);
            }
            await new Promise(r => setTimeout(r, 800)); // Délai pour éviter blocage navigateur
        }
        alert("🎉 Tous les livrets ont été téléchargés !");
    } catch(e) { alert("Erreur: " + e.message); }
    cont.style.display = 'none';
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    if(currentData.teacherName) {
        const tn = document.getElementById('teacherName');
        const tna = document.getElementById('teacherNameArabic');
        if(tn) tn.value = currentData.teacherName;
        if(tna) tna.value = currentData.teacherName;
    }
});
