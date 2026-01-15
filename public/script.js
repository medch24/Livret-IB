// Variables globales
let currentSection = '';
let currentClass = '';
let currentStudent = null;
let allStudents = [];

// Fonctions utilitaires
function showStatus(msg, type = 'info') {
    const status = document.getElementById('statusMessage');
    if (!status) return;
    status.textContent = msg;
    status.className = `status-message ${type}`;
    status.style.display = msg ? 'block' : 'none';
}

function updateProgress(percent, text) {
    const container = document.getElementById('progressContainer');
    const bar = document.getElementById('progressBar');
    const textEl = document.getElementById('progressText');
    
    if (!container || !bar || !textEl) return;

    container.style.display = 'block';
    bar.style.width = percent + '%';
    textEl.textContent = text || (percent + '%');
    
    if (percent >= 100) {
        setTimeout(() => {
            container.style.display = 'none';
            bar.style.width = '0%';
        }, 2000);
    }
}

// Gestionnaires d'événements
async function handleSectionChange(section) {
    currentSection = section;
    const step1 = document.getElementById('step1');
    const step3 = document.getElementById('step3');
    const studentInfo = document.getElementById('studentInfo');
    
    if (step1) step1.style.display = 'block';
    if (step3) step3.style.display = 'none';
    if (studentInfo) studentInfo.style.display = 'none';
    
    // Reset class selector
    const classSelector = document.getElementById('classSelector');
    if (classSelector) {
        classSelector.value = '';
    }
    
    // Scroll to next step
    if (step1) step1.scrollIntoView({ behavior: 'smooth' });
}

async function handleClassChange(className) {
    if (!className) return;
    currentClass = className;
    
    const step3 = document.getElementById('step3');
    const studentInfo = document.getElementById('studentInfo');
    const studentSelector = document.getElementById('studentSelector');

    try {
        showStatus('Chargement des élèves...', 'info');
        const response = await fetch(`/api/fetchStudentsByClass?className=${className}&section=${currentSection}`);
        if (!response.ok) throw new Error('Erreur lors de la récupération des élèves');
        
        allStudents = await response.json();
        
        if (studentSelector) {
            studentSelector.innerHTML = '<option value="">-- Sélectionnez un élève --</option>';
            allStudents.forEach(student => {
                const option = document.createElement('option');
                option.value = student._id;
                option.textContent = student.name;
                studentSelector.appendChild(option);
            });
        }
        
        if (step3) step3.style.display = 'block';
        if (studentInfo) studentInfo.style.display = 'none';
        showStatus('', '');
        
        if (step3) step3.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error:', error);
        showStatus('Erreur lors du chargement des élèves', 'error');
    }
}

function handleStudentChange(studentId) {
    if (!studentId) return;
    currentStudent = allStudents.find(s => s._id === studentId);
    
    const studentInfo = document.getElementById('studentInfo');
    const displayStudentName = document.getElementById('displayStudentName');
    const displayStudentClass = document.getElementById('displayStudentClass');

    if (currentStudent) {
        if (displayStudentName) displayStudentName.textContent = currentStudent.name;
        if (displayStudentClass) displayStudentClass.textContent = `${currentStudent.class} - ${currentStudent.section}`;
        if (studentInfo) {
            studentInfo.style.display = 'block';
            studentInfo.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// Fonction pour la génération individuelle
async function generateBooklet() {
    if (!currentStudent) {
        alert('Veuillez sélectionner un élève.');
        return;
    }
    
    const btn = document.getElementById('generateBtn');
    const originalText = btn ? btn.textContent : '📄 Générer le Livret (Word)';
    
    try {
        if (btn) {
            btn.disabled = true;
            btn.textContent = '⌛ Génération en cours...';
        }
        showStatus('Récupération des contributions...', 'info');

        // 1. Récupérer les contributions
        const contribRes = await fetch(`/api/fetchContributions?studentId=${currentStudent._id}`);
        if (!contribRes.ok) throw new Error('Impossible de récupérer les contributions');
        const contributions = await contribRes.json();

        showStatus('Génération du fichier Word...', 'info');

        // 2. Appeler l'API de génération
        const response = await fetch('/api/generate-booklet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                studentData: currentStudent,
                contributions: contributions
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erreur lors de la génération');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Livret-${currentStudent.name.replace(/\s+/g, '_')}.docx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        
        showStatus('Livret généré avec succès !', 'success');
    } catch (error) {
        console.error('Generation Error:', error);
        showStatus('Erreur: ' + error.message, 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    }
}

// Fonction pour la génération groupée (ZIP)
async function generateAllWordsInSection() {
    if (!currentClass || !currentSection || allStudents.length === 0) {
        alert('Veuillez d\'abord sélectionner une section et une classe avec des élèves.');
        return;
    }

    if (!confirm(`Voulez-vous générer les livrets Word pour tous les élèves de la classe ${currentClass} (${currentSection}) ?\nCela peut prendre un moment.`)) {
        return;
    }

    const btn = document.getElementById('generateWordButton');
    if (btn) btn.disabled = true;
    
    try {
        const zip = new JSZip();
        updateProgress(5, 'Initialisation...');
        
        for (let i = 0; i < allStudents.length; i++) {
            const student = allStudents[i];
            const percent = Math.round((i / allStudents.length) * 85) + 5;
            updateProgress(percent, `Génération: ${student.name} (${i+1}/${allStudents.length})`);

            try {
                const contribRes = await fetch(`/api/fetchContributions?studentId=${student._id}`);
                const contributions = await contribRes.json();

                const response = await fetch('/api/generate-booklet', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        studentData: student,
                        contributions: contributions
                    })
                });

                if (response.ok) {
                    const blob = await response.blob();
                    zip.file(`Livret-${student.name.replace(/\s+/g, '_')}.docx`, blob);
                }
            } catch (e) {
                console.error(`Erreur pour ${student.name}:`, e);
            }
        }

        updateProgress(95, 'Compression du ZIP...');
        const content = await zip.generateAsync({ type: "blob" });
        const url = window.URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Livrets-${currentClass}-${currentSection}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        
        updateProgress(100, 'Terminé !');
        showStatus('Tous les livrets ont été générés.', 'success');
    } catch (error) {
        console.error('ZIP Error:', error);
        showStatus('Erreur lors de la génération du ZIP', 'error');
    } finally {
        if (btn) btn.disabled = false;
    }
}

// Fonction pour l'export Excel
async function generateExcel() {
    if (!currentClass || !currentSection) {
        alert('Veuillez d\'abord sélectionner une section et une classe.');
        return;
    }
    
    showStatus('Préparation de l\'export Excel...', 'info');
    try {
        // Logique simplifiée pour l'exemple, peut être étendue
        alert('Export Excel en cours de préparation pour ' + currentClass);
        showStatus('Export Excel terminé (simulation).', 'success');
    } catch (e) {
        showStatus('Erreur Excel', 'error');
    }
}

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', () => {
    console.log('Application Livret-IB prête.');
});
