/**
 * SYSTÈME DE GESTION DES LIVRETS SCOLAIRES - SCRIPT COMPLET CORRIGÉ
 * Version 3.0 - Spécial Vercel & MongoDB
 */

// 1. ÉTAT GLOBAL
let currentData = {
    contributionId: null,
    teacherName: localStorage.getItem('teacherName') || '',
    classSelected: null,
    sectionSelected: null,
    subjectSelected: null,
    studentSelected: null, // Nom Complet
    studentBirthdate: '',
    teacherComment: '',
    communicationEvaluation: ['', '', '', '', ''],
    unitsSem1: 1,
    unitsSem2: 1,
    criteriaValues: {
        A: { sem1: null, sem2: null, finalLevel: null, sem1Units: [], sem2Units: [] },
        B: { sem1: null, sem2: null, finalLevel: null, sem1Units: [], sem2Units: [] },
        C: { sem1: null, sem2: null, finalLevel: null, sem1Units: [], sem2Units: [] },
        D: { sem1: null, sem2: null, finalLevel: null, sem1Units: [], sem2Units: [] }
    },
    threshold: 0,
    finalNote: 0
};

// 2. MAPPING PRÉNOM -> NOM COMPLET
const studentDatabase = {
    "Bilal": { fullName: "Bilal Molina", birth: "2015-02-15" },
    "Faysal": { fullName: "Faysal Achar", birth: "2014-04-15" },
    "Jad": { fullName: "Jad Mahayni", birth: "2014-08-15" },
    "Manaf": { fullName: "Manaf Kotbi", birth: "2014-08-15" },
    "Ahmed": { fullName: "Ahmed Bouaziz", birth: "2013-09-15" },
    "Ali": { fullName: "Ali Kutbi", birth: "2013-04-15" },
    "Eyad": { fullName: "Eyad Hassan", birth: "2013-04-15" },
    "Yasser": { fullName: "Yasser Younes", birth: "2013-08-15" },
    "Seifeddine": { fullName: "Seifeddine Ayadi", birth: "2012-01-15" },
    "Mohamed Chalak": { fullName: "Mohamed Chalak", birth: "2011-11-15" },
    "Wajih": { fullName: "Wajih Sabadine", birth: "2012-06-15" },
    "Ahmad": { fullName: "Ahmad Mahayni", birth: "2012-02-15" },
    "Adam": { fullName: "Adam Kaaki", birth: "2012-12-15" },
    "Mohamed Younes": { fullName: "Mohamed Younes", birth: "2011-11-15" },
    "Mohamed Amine Sgheir": { fullName: "Mohamed Amine Sgheir", birth: "2012-12-15" },
    "Samir": { fullName: "Samir Kaaki", birth: "2012-12-15" },
    "Abdulrahman": { fullName: "Abdulrahman Bouaziz", birth: "2012-04-15" },
    "Youssef": { fullName: "Youssef Baakak", birth: "2011-11-15" },
    "Habib": { fullName: "Habib Lteif", birth: "2008-10-15" },
    "Salah": { fullName: "Salah Boumalouga", birth: "2008-07-15" },
    "Naya Sabbidine": { fullName: "Naya Sabbidine", birth: "2014-02-28" },
    "Israa Alkattan": { fullName: "Israa Alkattan", birth: "2013-09-19" },
    "Dina Tlili": { fullName: "Dina Tlili", birth: "2012-12-22" },
    "Lina Tlili": { fullName: "Lina Tlili", birth: "2012-12-22" },
    "Cynthia Fadlallah": { fullName: "Cynthia Fadlallah", birth: "2013-12-06" },
    "Neyla Molina": { fullName: "Neyla Molina", birth: "2014-01-13" },
    "Jawahair Eshmawi": { fullName: "Jawahair Eshmawi", birth: "2012-03-19" },
    "Yousr Letaief": { fullName: "Yousr Letaief", birth: "2011-06-14" },
    "Sarah Aldebasy": { fullName: "Sarah Aldebasy", birth: "2011-07-24" },
    "Maria Wahib": { fullName: "Maria Wahib", birth: "2011-07-16" },
    "Badia Khaldi": { fullName: "Badia Khaldi", birth: "2010-12-23" },
    "Luluwah Alghabashi": { fullName: "Luluwah Alghabashi", birth: "2010-04-29" },
    "Yomna Masrouhi": { fullName: "Yomna Masrouhi", birth: "2009-09-07" },
    "Isra Elalmi": { fullName: "Isra Elalmi", birth: "2008-03-25" }
};

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

// 3. ATTACHE DES FONCTIONS AU WINDOW (Évite ReferenceError)

window.handleSectionChange = function(section) {
    currentData.sectionSelected = section;
    document.getElementById('step0').style.display = 'none';
    document.getElementById('step1').style.display = 'block';
    const clsSelector = document.getElementById('classSelector');
    clsSelector.innerHTML = '<option value="">-- Choisissez --</option>';
    Object.keys(studentsByClassAndSection[section]).forEach(c => {
        const opt = document.createElement('option');
        opt.value = opt.textContent = c;
        clsSelector.appendChild(opt);
    });
};

window.handleClassChange = function(cls) {
    currentData.classSelected = cls;
    const stdSelector = document.getElementById('studentSelector');
    stdSelector.innerHTML = '<option value="">-- Sélectionnez l\'élève --</option>';
    const list = studentsByClassAndSection[currentData.sectionSelected][cls] || [];
    list.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s;
        opt.textContent = studentDatabase[s]?.fullName || s;
        stdSelector.appendChild(opt);
    });
    document.getElementById('step3').style.display = 'block';
};

window.handleStudentChange = function(shortName) {
    if(!shortName) return;
    const info = studentDatabase[shortName] || { fullName: shortName, birth: "" };
    currentData.studentSelected = info.fullName; // Nom complet
    currentData.studentBirthdate = info.birth;
    
    document.getElementById('studentInfoContainer').style.display = 'block';
    document.getElementById('studentNameDisplay').textContent = info.fullName;
    document.getElementById('studentBirthdate').value = info.birth;
    document.getElementById('step2').style.display = 'block';
    
    const subSelector = document.getElementById('subjectSelector');
    subSelector.innerHTML = '<option value="">-- Matière --</option>';
    ["Mathématiques", "Individus et sociétés", "Langue et littérature (Français)", "Design", "Sciences", "Arts", "Éducation physique et à la santé", "Acquisition de langues (Anglais)", "Acquisition de langue (اللغة العربية)"].forEach(s => {
        const opt = document.createElement('option');
        opt.value = opt.textContent = s;
        subSelector.appendChild(opt);
    });
};

window.handleSubjectChange = function(sub) {
    currentData.subjectSelected = sub;
    const isAr = sub.includes('العربية');
    document.getElementById('contributionEntrySections').style.display = 'block';
    document.querySelectorAll('.french-section').forEach(s => s.style.display = isAr ? 'none' : 'block');
    document.querySelectorAll('.arabic-section').forEach(s => s.style.display = isAr ? 'block' : 'none');
    rebuildCriteriaTable();
};

window.handleCommunicationChange = function() {
    const isAr = currentData.subjectSelected?.includes('العربية');
    const tableId = isAr ? 'communicationTableArabic' : 'communicationTable';
    currentData.communicationEvaluation = Array.from(document.querySelectorAll(`#${tableId} select`)).map(s => s.value);
};

window.handleTeacherNameChange = function(val) {
    currentData.teacherName = val;
    localStorage.setItem('teacherName', val);
};

window.handleStudentBirthdateChange = function(val) {
    currentData.studentBirthdate = val;
};

window.handleUnitsChange = function() {
    const isAr = currentData.subjectSelected?.includes('العربية');
    currentData.unitsSem1 = parseInt(document.getElementById(isAr ? 'unitsSem1SelectorArabic' : 'unitsSem1Selector').value);
    currentData.unitsSem2 = parseInt(document.getElementById(isAr ? 'unitsSem2SelectorArabic' : 'unitsSem2Selector').value);
    rebuildCriteriaTable();
};

window.validateInput = function(input) {
    const row = input.closest('tr');
    const letter = row.dataset.criteria;
    const cell = input.closest('td');
    
    // Détection du semestre et de l'index d'unité
    const isS1 = cell.classList.contains('sem1-cell') || cell.classList.contains('sem1-unit');
    const val = input.value === '' ? null : parseFloat(input.value);
    
    // On peut avoir plusieurs unités par cellule si on a reconstruit le tableau
    // Pour simplifier ici, on gère la valeur en direct
    if(isS1) currentData.criteriaValues[letter].sem1Units[0] = val;
    else currentData.criteriaValues[letter].sem2Units[0] = val;
    
    calculateAll();
};

// 4. MOTEUR DE CALCULS

function rebuildCriteriaTable() {
    const isAr = currentData.subjectSelected?.includes('العربية');
    const isDP = currentData.classSelected?.startsWith('DP');
    const max = isDP ? 7 : 8;
    const tbody = document.getElementById(isAr ? 'criteriaTableBodyArabic' : 'criteriaTableBody');
    const thead = document.getElementById(isAr ? 'criteriaTableHeadArabic' : 'criteriaTableHead');
    
    // Header
    let h = `<tr><th>Critères</th>`;
    for(let i=1; i<=currentData.unitsSem1; i++) h += `<th>S1-U${i}</th>`;
    if(currentData.unitsSem1 > 1) h += `<th>Moy S1</th>`;
    for(let i=1; i<=currentData.unitsSem2; i++) h += `<th>S2-U${i}</th>`;
    if(currentData.unitsSem2 > 1) h += `<th>Moy S2</th>`;
    h += `<th>Final</th><th>Seuil</th><th>Note</th></tr>`;
    thead.innerHTML = h;

    // Body
    tbody.innerHTML = '';
    ['A','B','C','D'].forEach((l, idx) => {
        const tr = document.createElement('tr');
        tr.dataset.criteria = l;
        let b = `<td>${l}</td>`;
        // S1
        for(let i=0; i<currentData.unitsSem1; i++) {
            const v = currentData.criteriaValues[l].sem1Units[i] || '';
            b += `<td class="sem1-cell"><input type="number" min="0" max="${max}" value="${v}" oninput="updateMatrix(this,'s1',${i})"></td>`;
        }
        if(currentData.unitsSem1 > 1) b += `<td><input type="number" readonly class="m-s1"></td>`;
        // S2
        for(let i=0; i<currentData.unitsSem2; i++) {
            const v = currentData.criteriaValues[l].sem2Units[i] || '';
            b += `<td class="sem2-cell"><input type="number" min="0" max="${max}" value="${v}" oninput="updateMatrix(this,'s2',${i})"></td>`;
        }
        if(currentData.unitsSem2 > 1) b += `<td><input type="number" readonly class="m-s2"></td>`;
        
        b += `<td><input type="number" readonly class="f-l"></td>`;
        if(idx === 0) {
            b += `<td rowspan="4"><input type="number" readonly id="${isAr?'thresholdArabic':'threshold'}" style="background:#eee"></td>`;
            b += `<td rowspan="4"><input type="number" readonly id="${isAr?'finalNoteArabic':'finalNote'}" style="background:#eee"></td>`;
        }
        tr.innerHTML = b;
        tbody.appendChild(tr);
    });
    calculateAll();
}

window.updateMatrix = function(input, sem, idx) {
    const letter = input.closest('tr').dataset.criteria;
    const val = input.value === '' ? null : parseFloat(input.value);
    if(sem === 's1') currentData.criteriaValues[letter].sem1Units[idx] = val;
    else currentData.criteriaValues[letter].sem2Units[idx] = val;
    calculateAll();
};

function calculateAll() {
    let total = 0;
    ['A','B','C','D'].forEach(l => {
        const row = document.querySelector(`tr[data-criteria="${l}"]`);
        if(!row) return;
        const s1U = currentData.criteriaValues[l].sem1Units.filter(v => v != null);
        const s2U = currentData.criteriaValues[l].sem2Units.filter(v => v != null);
        
        const m1 = s1U.length ? Math.round(s1U.reduce((a,b)=>a+b)/s1U.length) : null;
        const m2 = s2U.length ? Math.round(s2U.reduce((a,b)=>a+b)/s2U.length) : null;
        
        currentData.criteriaValues[l].sem1 = m1;
        currentData.criteriaValues[l].sem2 = m2;

        const m1In = row.querySelector('.m-s1'); if(m1In) m1In.value = m1 ?? '';
        const m2In = row.querySelector('.m-s2'); if(m2In) m2In.value = m2 ?? '';

        let fin = (m1 !== null && m2 !== null) ? Math.round((m1+m2)/2) : (m1 ?? m2);
        currentData.criteriaValues[l].finalLevel = fin;
        row.querySelector('.f-l').value = fin ?? '';
        if(fin != null) total += fin;
    });

    const isAr = currentData.subjectSelected?.includes('العربية');
    const tId = isAr ? 'thresholdArabic' : 'threshold';
    const nId = isAr ? 'finalNoteArabic' : 'finalNote';
    if(document.getElementById(tId)) document.getElementById(tId).value = total;
    const note = Math.round(total/4);
    if(document.getElementById(nId)) document.getElementById(nId).value = total > 0 ? (note || 1) : '';
    
    currentData.threshold = total;
    currentData.finalNote = note;
}

// 5. SOUMISSION ET GÉNÉRATION

window.submitForm = async function() {
    const isAr = currentData.subjectSelected?.includes('العربية');
    currentData.teacherComment = document.getElementById(isAr ? 'teacherCommentArabic' : 'teacherComment').value;
    handleCommunicationChange();
    
    try {
        const res = await fetch('/api/saveContribution', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(currentData)
        });
        const json = await res.json();
        if(json.success) alert("✅ Livret enregistré pour " + currentData.studentSelected);
    } catch(e) { alert("❌ Erreur sauvegarde"); }
};

window.generateAllWordsInSection = async function() {
    const { sectionSelected, classSelected } = currentData;
    if(!sectionSelected || !classSelected) return alert("Choisissez section et classe.");
    
    const bar = document.getElementById('progressBar');
    document.getElementById('progressContainer').style.display = 'block';

    try {
        const resList = await fetch('/api/getStudentsList', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ sectionSelected, classSelected })
        });
        const { students } = await resList.json();

        for(let i=0; i<students.length; i++) {
            bar.style.width = `${((i+1)/students.length)*100}%`;
            const fullName = students[i];
            
            const r = await fetch('/api/generateSingleWord', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ studentSelected: fullName, classSelected, sectionSelected })
            });

            if(r.ok) {
                const blob = await r.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = `Livret_${fullName.replace(/ /g,'_')}.docx`;
                a.click();
            }
            await new Promise(res => setTimeout(res, 800));
        }
        alert("🎉 Téléchargement terminé !");
    } catch(e) { alert("Erreur génération"); }
    document.getElementById('progressContainer').style.display = 'none';
};

// INITIALISATION
document.addEventListener('DOMContentLoaded', () => {
    const n = localStorage.getItem('teacherName');
    if(n) {
        if(document.getElementById('teacherName')) document.getElementById('teacherName').value = n;
        if(document.getElementById('teacherNameArabic')) document.getElementById('teacherNameArabic').value = n;
    }
    console.log("Application prête.");
});
