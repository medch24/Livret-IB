#!/usr/bin/env python3
"""
Script de vérification du template Word pour DocxTemplater
Utilisation: python3 verify_template.py <fichier.docx>
"""

import sys
import zipfile
import re
from pathlib import Path

def verify_template(docx_path):
    """Vérifier la structure d'un template Word DocxTemplater"""
    
    if not Path(docx_path).exists():
        print(f"❌ Erreur: Le fichier '{docx_path}' n'existe pas")
        return False
    
    try:
        with zipfile.ZipFile(docx_path, 'r') as zip_ref:
            xml_content = zip_ref.read('word/document.xml').decode('utf-8')
            
            # Trouver toutes les balises
            all_tags = re.findall(r'\{[^}]+\}', xml_content)
            unique_tags = sorted(set(all_tags))
            
            # Séparer les différents types de balises
            loop_starts = [t for t in unique_tags if t.startswith('{#')]
            loop_ends = [t for t in unique_tags if t.startswith('{/')]
            simple_tags = [t for t in unique_tags if not t.startswith(('{#', '{/'))]
            
            print("=" * 80)
            print(f"📄 Vérification du template: {Path(docx_path).name}")
            print("=" * 80)
            
            # Afficher les balises simples
            print(f"\n✅ Balises simples ({len(simple_tags)}):")
            for tag in simple_tags:
                count = all_tags.count(tag)
                print(f"  • {tag:40} (utilisé {count} fois)")
            
            # Afficher les boucles
            print(f"\n🔄 Boucles ({len(loop_starts)}):")
            all_balanced = True
            for start in loop_starts:
                loop_name = start[2:-1]  # Enlever {# et }
                expected_end = f'{{/{loop_name}}}'
                is_balanced = expected_end in loop_ends
                status = "✅" if is_balanced else "❌"
                print(f"  {status} {start:30} → {expected_end}")
                if not is_balanced:
                    all_balanced = False
            
            # Vérifier les fins de boucles orphelines
            orphan_ends = [end for end in loop_ends 
                          if f'{{#{end[2:-1]}}}' not in loop_starts]
            if orphan_ends:
                print(f"\n⚠️  Fins de boucles orphelines:")
                for end in orphan_ends:
                    print(f"  • {end} (manque le début correspondant)")
                all_balanced = False
            
            # Vérifier les balises fragmentées (potentiellement)
            print(f"\n🔍 Vérification des balises fragmentées...")
            fragments = re.findall(r'<w:t[^>]*>[^<]*\{[^}]*</w:t>', xml_content)
            if fragments:
                print(f"  ⚠️  {len(fragments)} balises potentiellement fragmentées détectées")
                print(f"  Note: Cela peut causer des erreurs si les balises sont coupées")
            else:
                print(f"  ✅ Aucune balise fragmentée détectée")
            
            # Résumé
            print("\n" + "=" * 80)
            print("📊 RÉSUMÉ")
            print("=" * 80)
            print(f"  Balises simples:          {len(simple_tags)}")
            print(f"  Boucles:                  {len(loop_starts)}")
            print(f"  Boucles équilibrées:      {'✅ OUI' if all_balanced else '❌ NON'}")
            print(f"  Balises fragmentées:      {'⚠️  OUI' if fragments else '✅ NON'}")
            
            if all_balanced and not fragments:
                print(f"\n✅ Le template est VALIDE et prêt à être utilisé")
                return True
            else:
                print(f"\n❌ Le template contient des ERREURS à corriger")
                return False
                
    except Exception as e:
        print(f"❌ Erreur lors de la lecture du fichier: {e}")
        import traceback
        traceback.print_exc()
        return False

def compare_with_expected():
    """Afficher les balises attendues par l'application"""
    print("\n" + "=" * 80)
    print("📋 BALISES ATTENDUES PAR L'APPLICATION")
    print("=" * 80)
    
    expected = {
        "Informations élève": [
            "{studentSelected}",
            "{className}",
            "{studentBirthdate}",
            "{image}"
        ],
        "Boucle atlSummaryTable (Compétences ATL)": [
            "{#atlSummaryTable}",
            "  {subject}",
            "  {communication}",
            "  {collaboration}",
            "  {autogestion}",
            "  {recherche}",
            "  {reflexion}",
            "{/atlSummaryTable}"
        ],
        "Boucle contributionsBySubject (Critères par matière)": [
            "{#contributionsBySubject}",
            "  {subjectSelected}",
            "  {teacherName}",
            "  {teacherComment}",
            "  {criteriaKey.A}, {criteriaName A}, {criteriaA.sem1}, {criteriaA.sem2}, {finalLevel.A}",
            "  {criteriaKey.B}, {criteriaName B}, {criteriaB.sem1}, {criteriaB.sem2}, {finalLevel.B}",
            "  {criteriaKey.C}, {criteriaName C}, {criteriaC.sem1}, {criteriaC.sem2}, {finalLevel.C}",
            "  {criteriaKey.D}, {criteriaName D}, {criteriaD.sem1}, {criteriaD.sem2}, {finalLevel.D}",
            "  {seuil}",
            "  {note}",
            "{/contributionsBySubject}"
        ]
    }
    
    for category, tags in expected.items():
        print(f"\n{category}:")
        for tag in tags:
            print(f"  {tag}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 verify_template.py <fichier.docx>")
        print("\nExemples:")
        print("  python3 verify_template.py template.docx")
        print("  python3 verify_template.py 'Livret modele (7).docx'")
        compare_with_expected()
        sys.exit(1)
    
    docx_file = sys.argv[1]
    success = verify_template(docx_file)
    compare_with_expected()
    
    sys.exit(0 if success else 1)
