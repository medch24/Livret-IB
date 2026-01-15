/**
 * SYSTÈME DE GESTION DES LIVRETS SCOLAIRES - SCRIPT COMPLET (VERSION CORRIGÉE)
 * Remplacez tout le contenu de votre fichier script.js par ce code.
 */

// 1. ÉTAT GLOBAL DE L'APPLICATION
let currentData = {
    contributionId: null,
    teacherName: localStorage.getItem('teacherName') || '',
    classSelected: null,
    sectionSelected: null,
    subjectSelected: null,
    studentSelected: null, // Deviendra le Nom Complet (ex: "Manaf Kotbi")
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

// 2. MAPPING PRÉNOM -> NOM COMPLET (Base de données locale)
const studentDatabase = {
    // Section Garçons
    "Bilal": { fullName: "Bilal Molina", birth: "2015-02-15" },
    "Faysal": { fullName: "Faysal Achar", birth: "2014-04-15" },
    "Jad": { fullName: "Jad Mahayni", birth: "2014-08-15" },
    "Manaf": { fullName: "Manaf Kotbi", birth: "2014-08-15" },
    "Ahmed": { fullName: "Ahmed Bouaziz", birth: "2013-09-15" },
    "Yasser": { fullName: "Yasser Younes", birth: "2013-08-15" },
    "Eyad": { fullName: "Eyad Hassan", birth: "2013-04-15" },
    "Ali": { fullName: "Ali Kutbi", birth: "2013-04-15" },
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
    // Section Filles
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

const subjectsByClass = ["Mathématiques", "Individus et sociétés", "Langue et littérature (Français)", "Design", "Sciences", "Arts", "Éducation physique et à la santé", "Acquisition de langues (Anglais)", "Acquisition de langue (اللغة العربية)"];

// 3. FONCTIONS API
async function apiCall(endpoint, data) {
    const response = await fetch(`/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error("Erreur Serveur API");
    return await response.json();
}

// 4. LOGIQUE D'INTERFACE (UI)
function handleSectionChange(section) {
    currentData.sectionSelected = section;
    document.getElementById('step0').style.display = 'none';
    document.getElementById('step1').style.display = 'block';
    
    const clsSelector = document.getElementById('classSelector');
    clsSelector.innerHTML = '<option value="">-- Choisissez la classe --</option>';
    Object.keys(studentsByClassAndSection[section]).forEach(c => {
        const opt = document.createElement('option');
        opt.value = opt.textContent = c;
        clsSelector.appendChild(opt);
    });
}

function handleClassChange(cls) {
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
}

async function handleStudentChange(shortName) {
    if(!shortName) return;
    const info = studentDatabase[shortName] || { fullName: shortName, birth: "" };
    
    // TRANSFORMATION NOM COMPLET POUR DB ET WORD
    currentData.studentSelected = info.fullName; 
    
    document.getElementById('studentInfoContainer').style.display = 'block';
    document.getElementById('studentNameDisplay').textContent = info.fullName;
    document.getElementById('studentBirthdate').value = info.birth;
    currentData.studentBirthdate = info.birth;
    
    const subSelector = document.getElementById('subjectSelector');
    subSelector.innerHTML = '<option value="">-- Sélectionnez la matière --</option>';
    subjectsByClass.forEach(s => {
        const opt = document.createElement('option');
        opt.value = opt.textContent = s;
        subSelector.appendChild(opt);
    });
    document.getElementById('step2').style.display = 'block';
}

function handleSubjectChange(sub) {
    currentData.subjectSelected = sub;
    const isAr = sub.includes('العربية');
    document.getElementById('contributionEntrySections').style.display = 'block';
    
    document.querySelectorAll('.french-section').forEach(s => s.style.display = isAr ? 'none' : 'block');
    document.querySelectorAll('.arabic-section').forEach(s => s.style.display = isAr ? 'block' : 'none');
    
    rebuildCriteriaTable();
}

// 5. MOTEUR DE CALCULS ET TABLEAU
function handleUnitsChange() {
    const isAr = currentData.subjectSelected?.includes('العربية');
    currentData.unitsSem1 = parseInt(document.getElementById(isAr ? 'unitsSem1SelectorArabic' : 'unitsSem1Selector').value);
    currentData.unitsSem2 = parseInt(document.getElementById(isAr ? 'unitsSem2SelectorArabic' : 'unitsSem2Selector').value);
    rebuildCriteriaTable();
}

function rebuildCriteriaTable() {
    const isAr = currentData.subjectSelected?.includes('العربية');
    const isDP = currentData.classSelected?.startsWith('DP');
    const maxVal = isDP ? 7 : 8;
    const tbody = document.getElementById(isAr ? 'criteriaTableBodyArabic' : 'criteriaTableBody');
    const thead = document.getElementById(isAr ? 'criteriaTableHeadArabic' : 'criteriaTableHead');
    
    // Header Dynamique
    let h = `<tr><th>Critères</th>`;
    for(let i=1; i<=currentData.unitsSem1; i++) h += `<th>S1-U${i}</th>`;
    if(currentData.unitsSem1 > 1) h += `<th style="background:#e7f3ff">Moy S1</th>`;
    for(let i=1; i<=currentData.unitsSem2; i++) h += `<th>S2-U${i}</th>`;
    if(currentData.unitsSem2 > 1) h += `<th style="background:#e7f3ff">Moy S2</th>`;
    h += `<th>Final</th><th>Seuil</th><th>Note</th></tr>`;
    thead.innerHTML = h;

    // Body
    tbody.innerHTML = '';
    ['A','B','C','D'].forEach((letter, idx) => {
        const tr = document.createElement('tr');
        tr.dataset.criteria = letter;
        let b = `<td>${letter}</td>`;
        
        // Semestre 1 Units
        for(let i=0; i<currentData.unitsSem1; i++) {
            b += `<td><input type="number" min="0" max="${maxVal}" oninput="updateVal(this,'s1',${i})"></td>`;
        }
        if(currentData.unitsSem1 > 1) b += `<td><input type="number" readonly class="m-s1"></td>`;
        
        // Semestre 2 Units
        for(let i=0; i<currentData.unitsSem2; i++) {
            b += `<td><input type="number" min="0" max="${maxVal}" oninput="updateVal(this,'s2',${i})"></td>`;
        }
        if(currentData.unitsSem2 > 1) b += `<td><input type="number" readonly class="m-s2"></td>`;
        
        // Final + Totaux
        b += `<td><input type="number" readonly class="f-l"></td>`;
        if(idx === 0) {
            b += `<td rowspan="4"><input type="number" readonly id="${isAr?'thresholdArabic':'threshold'}" style="background:#f1f1f1"></td>`;
            b += `<td rowspan="4"><input type="number" readonly id="${isAr?'finalNoteArabic':'finalNote'}" style="background:#f1f1f1"></td>`;
        }
        tr.innerHTML = b;
        tbody.appendChild(tr);
    });
}

function updateVal(input, sem, idx) {
    const letter = input.closest('tr').dataset.criteria;
    const val = input.value === '' ? null : parseFloat(input.value);
    
    if (sem === 's1') currentData.criteriaValues[letter].sem1Units[idx] = val;
    else currentData.criteriaValues[letter].sem2Units[idx] = val;
    
    calculate();
}

function calculate() {
    let totalSeuil = 0;
    ['A','B','C','D'].forEach(letter => {
        const row = document.querySelector(`tr[data-criteria="${letter}"]`);
        if(!row) return;

        const s1 = currentData.criteriaValues[letter].sem1Units.filter(v => v !== null);
        const s2 = currentData.criteriaValues[letter].sem2Units.filter(v => v !== null);
        
        const m1 = s1.length ? Math.round(s1.reduce((a,b)=>a+b)/s1.length) : null;
        const m2 = s2.length ? Math.round(s2.reduce((a,b)=>a+b)/s2.length) : null;
        
        currentData.criteriaValues[letter].sem1 = m1;
        currentData.criteriaValues[letter].sem2 = m2;

        const moy1In = row.querySelector('.m-s1'); if(moy1In) moy1In.value = m1 ?? '';
        const moy2In = row.querySelector('.m-s2'); if(moy2In) moy2In.value = m2 ?? '';

        let fin = (m1 !== null && m2 !== null) ? Math.round((m1+m2)/2) : (m1 ?? m2);
        currentData.criteriaValues[letter].finalLevel = fin;
        
        row.querySelector('.f-l').value = fin ?? '';
        if(fin != null) totalSeuil += fin;
    });

    const isAr = currentData.subjectSelected?.includes('العربية');
    const thresholdInput = document.getElementById(isAr?'thresholdArabic':'threshold');
    const noteInput = document.getElementById(isAr?'finalNoteArabic':'finalNote');
    
    if(thresholdInput) thresholdInput.value = totalSeuil;
    const finalNote = Math.round(totalSeuil/4);
    if(noteInput) noteInput.value = totalSeuil > 0 ? (finalNote || 1) : '';
    
    currentData.threshold = totalSeuil;
    currentData.finalNote = finalNote;
}

// 6. SOUMISSION ET GÉNÉRATION
async function submitForm() {
    const isAr = currentData.subjectSelected?.includes('العربية');
    currentData.teacherName = document.getElementById(isAr?'teacherNameArabic':'teacherName').value;
    currentData.teacherComment = document.getElementById(isAr?'teacherCommentArabic':'teacherComment').value;
    currentData.communicationEvaluation = Array.from(document.querySelectorAll(isAr?'#communicationTableArabic select':'#communicationTable select')).map(s => s.value);
    
    localStorage.setItem('teacherName', currentData.teacherName);

    try {
        const res = await apiCall('saveContribution', currentData);
        if(res.success) alert("✅ Contribution de " + currentData.studentSelected + " enregistrée !");
    } catch(e) { alert("❌ Erreur de sauvegarde : " + e.message); }
}

async function generateAllWordsInSection() {
    const { sectionSelected, classSelected } = currentData;
    if(!sectionSelected || !classSelected) return alert("Veuillez sélectionner une section et une classe.");
    
    const res = await apiCall('getStudentsList', { sectionSelected, classSelected });
    const students = res.students || [];

    document.getElementById('progressContainer').style.display = 'block';
    const bar = document.getElementById('progressBar');

    for(let i=0; i<students.length; i++) {
        const fullName = students[i];
        bar.style.width = `${((i+1)/students.length)*100}%`;
        
        const response = await fetch('/api/generateSingleWord', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                studentSelected: fullName, 
                classSelected, 
                sectionSelected,
                studentBirthdate: currentData.studentBirthdate 
            })
        });

        if(response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Livret_${fullName.replace(/ /g,'_')}.docx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }
        await new Promise(r => setTimeout(r, 1000)); // Délai entre fichiers
    }
    alert("🎉 Génération des livrets terminée !");
    document.getElementById('progressContainer').style.display = 'none';
}

// 7. INITIALISATION
document.addEventListener('DOMContentLoaded', () => {
    const savedName = localStorage.getItem('teacherName');
    if(savedName) {
        if(document.getElementById('teacherName')) document.getElementById('teacherName').value = savedName;
        if(document.getElementById('teacherNameArabic')) document.getElementById('teacherNameArabic').value = savedName;
    }
    console.log("Application prête.");
});
