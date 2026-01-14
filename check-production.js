#!/usr/bin/env node
/**
 * Script de vérification post-déploiement
 * Vérifie que toutes les corrections sont bien déployées sur Vercel
 */

const fetch = require('node-fetch');

const BASE_URL = 'https://livret-ib.vercel.app';

async function checkProduction() {
    console.log('🔍 VÉRIFICATION POST-DÉPLOIEMENT VERCEL');
    console.log('='.repeat(70));
    console.log(`🌐 URL: ${BASE_URL}`);
    console.log('');
    
    try {
        // 1. Test API Health
        console.log('1️⃣  Test API Health...');
        const healthRes = await fetch(`${BASE_URL}/api/test`);
        const healthData = await healthRes.json();
        
        if (healthData.status === 'OK') {
            console.log('   ✅ API fonctionne');
            console.log(`   ✅ Base de données: ${healthData.dbConnected ? 'connectée' : 'déconnectée'}`);
        } else {
            console.log('   ❌ API ne répond pas correctement');
        }
        
        // 2. Test fetch contributions DP2 garçons
        console.log('\n2️⃣  Test récupération contributions DP2 garçons Habib...');
        const contribRes = await fetch(`${BASE_URL}/api/fetchStudentContributions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                studentSelected: 'Habib',
                classSelected: 'DP2',
                sectionSelected: 'garçons'
            })
        });
        
        if (contribRes.ok) {
            const contributions = await contribRes.json();
            console.log(`   ✅ ${contributions.length} contributions récupérées`);
            
            // Vérifier les matières
            const subjects = contributions.map(c => c.subjectSelected);
            console.log('\n   📚 Matières trouvées:');
            subjects.forEach((s, i) => {
                const isArabic = s.includes('العربية');
                console.log(`      ${i + 1}. ${s} ${isArabic ? '🇸🇦' : ''}`);
            });
            
            // Vérifier présence arabe
            const hasArabic = subjects.some(s => s.includes('العربية'));
            if (hasArabic) {
                console.log('\n   ✅ Contribution arabe trouvée!');
            } else {
                console.log('\n   ⚠️  Aucune contribution arabe trouvée');
            }
        } else {
            console.log(`   ❌ Erreur: ${contribRes.status} ${contribRes.statusText}`);
        }
        
        // 3. Vérifier endpoint admin
        console.log('\n3️⃣  Test endpoint admin view-dp2-garcons...');
        const adminRes = await fetch(`${BASE_URL}/api/admin/view-dp2-garcons?secret=merge-dp2-2026`);
        
        if (adminRes.ok) {
            const adminData = await adminRes.json();
            console.log('   ✅ Endpoint admin accessible');
            console.log(`   📊 Statistiques:`);
            console.log(`      - Habib: ${adminData.students?.find(s => s.name === 'Habib')?.contributions?.length || 0} contributions`);
            console.log(`      - Salah: ${adminData.students?.find(s => s.name === 'Salah')?.contributions?.length || 0} contributions`);
        } else {
            console.log(`   ⚠️  Endpoint admin: ${adminRes.status}`);
        }
        
        console.log('\n' + '='.repeat(70));
        console.log('✅ VÉRIFICATION TERMINÉE');
        console.log('');
        console.log('📋 PROCHAINES ÉTAPES:');
        console.log('   1. Ouvrir https://livret-ib.vercel.app');
        console.log('   2. Sélectionner: DP2 → garçons → Habib');
        console.log('   3. Générer le livret Word');
        console.log('   4. Vérifier que le fichier Word s\'ouvre correctement');
        console.log('   5. Vérifier que toutes les 8 matières sont présentes');
        console.log('');
        
    } catch (error) {
        console.error('\n❌ ERREUR:', error.message);
        console.error('\n⚠️  Vérifiez que Vercel a bien terminé le déploiement');
        console.error('   URL: https://vercel.com/dashboard');
        process.exit(1);
    }
}

checkProduction();
