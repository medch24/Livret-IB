/**
 * SYSTÈME DE GESTION DES LIVRETS SCOLAIRES - SCRIPT COMPLET
 * Version : 2.1 (Optimisée pour Vercel & MongoDB)
 */

const studentDatabase = {
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
    "Salah": { fullName: "Salah Boumalouga", birth: "2008-07-15" }
};

let currentData = {
    contributionId: null,
    teacherName: localStorage.getItem('teacherName') || '',
    classSelected: null,
    sectionSelected: null,
    subjectSelected: null,
    studentSelected: null,
    studentBirthdate: '',
    criteriaValues: {
        A: { sem1Units: [], sem2Units: [] },
        B: { sem1Units: [], sem2Units: [] },
        C: { sem1Units: [], sem2Units: [] },
        D: { sem1Units: [], sem2Units: [] }
    }
};

async function handleStudentChange(shortName) {
    if (!shortName) return;
    
    // 1. Convertir en Nom Complet immédiatement
    const info = studentDatabase[shortName] || { fullName: shortName, birth: "" };
    currentData.studentSelected = info.fullName;
    currentData.studentBirthdate = info.birth;

    // 2. Mettre à jour l'affichage
    document.getElementById('studentInfoContainer').style.display = 'block';
    document.getElementById('studentNameDisplay').textContent = info.fullName;
    document.getElementById('studentBirthdate').value = info.birth;
    
    // 3. Charger les matières
    document.getElementById('step2').style.display = 'block';
    populateSubjects();
}

function calculate() {
    let totalSeuil = 0;
    ['A','B','C','D'].forEach(l => {
        const row = document.querySelector(`tr[data-criteria="${l}"]`);
        if(!row) return;

        const s1 = currentData.criteriaValues[l].sem1Units.filter(v => v != null);
        const s2 = currentData.criteriaValues[l].sem2Units.filter(v => v != null);
        
        const m1 = s1.length ? Math.round(s1.reduce((a,b)=>a+b)/s1.length) : null;
        const m2 = s2.length ? Math.round(s2.reduce((a,b)=>a+b)/s2.length) : null;
        
        // Stockage pour le backend
        currentData.criteriaValues[l].sem1 = m1;
        currentData.criteriaValues[l].sem2 = m2;

        let fin = (m1 !== null && m2 !== null) ? Math.round((m1+m2)/2) : (m1 ?? m2);
        currentData.criteriaValues[l].finalLevel = fin;
        
        row.querySelector('.f-l').value = fin ?? '';
        if(fin != null) totalSeuil += fin;
    });

    const isAr = currentData.subjectSelected?.includes('العربية');
    document.getElementById(isAr?'thresholdArabic':'threshold').value = totalSeuil;
    const note = Math.round(totalSeuil/4);
    document.getElementById(isAr?'finalNoteArabic':'finalNote').value = totalSeuil > 0 ? (note || 1) : '';
    
    currentData.threshold = totalSeuil;
    currentData.finalNote = note;
}

async function generateAllWordsInSection() {
    const { sectionSelected, classSelected } = currentData;
    if(!sectionSelected || !classSelected) return alert("Sélectionnez section/classe");

    const res = await fetch('/api/getStudentsList', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ sectionSelected, classSelected })
    });
    const { students } = await res.json();

    for(const name of students) {
        // 'name' est ici le Nom Complet stocké en DB
        const r = await fetch('/api/generateSingleWord', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ studentSelected: name, classSelected, sectionSelected })
        });
        if(r.ok) {
            const blob = await r.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `Livret_${name}.docx`;
            a.click();
        }
        await new Promise(res => setTimeout(res, 1000));
    }
}
    alert("🎉 Terminé !");
    document.getElementById('progressContainer').style.display = 'none';
}

// 7. INITIALISATION
document.addEventListener('DOMContentLoaded', () => {
    const n = localStorage.getItem('teacherName');
    if(n) {
        if(document.getElementById('teacherName')) document.getElementById('teacherName').value = n;
        if(document.getElementById('teacherNameArabic')) document.getElementById('teacherNameArabic').value = n;
    }
});
