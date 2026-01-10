#!/bin/bash

# Fonction pour renommer en sécurité
safe_rename() {
    old="$1"
    new="$2"
    if [ -f "$old" ]; then
        echo "✅ Renommer: $old -> $new"
        mv "$old" "$new"
    else
        echo "⚠️  Fichier non trouvé: $old"
    fi
}

# Renommer les photos selon les fullName dans script.js
safe_rename "Faysal.jpg" "Faysal Achar.jpg"
safe_rename "Bilal Molina.jpg" "Bilal Molina.jpg"  # Déjà correct
safe_rename "Jad.jpg" "Jad Mahayni.jpg"
safe_rename "Manaf.jpg" "Manaf Kotbi.jpg"
safe_rename "Ahmed.png" "Ahmed Bouaziz.png"
safe_rename "AHMED bOUAZIZ.png" "Ahmed Bouaziz.png"  # Doublon possible
safe_rename "Yasser.png" "Yasser Younes.png"
safe_rename "Iyad-removebg-preview.png" "Eyad Hassan.png"
safe_rename "Ali kotbi.png" "Ali Kutbi.png"
safe_rename "seif-removebg-preview.png" "Seifeddine Ayadi.png"
safe_rename "chalak.png" "Mohamed Chalak.png"
safe_rename "wajeeh-removebg-preview.png" "Wajih Sabadine.png"
safe_rename "Adam.png" "Adam Kaaki.png"
safe_rename "Med Younes.png" "Mohamed Younes.png"
safe_rename "Mohamed Amine.png" "Mohamed Amine Sgheir.png"
safe_rename "Samir.png" "Samir Kaaki.png"
safe_rename "abdulrahman_bouaziz.png" "Abdulrahman Bouaziz.png"
safe_rename "Youssef.png" "Youssef Baakak.png"
safe_rename "habib.png" "Habib Lteif.png"
safe_rename "SALEH.png" "Salah Boumalouga.png"

echo ""
echo "🎯 Renommage terminé!"
echo ""
echo "📋 Liste des photos finales:"
ls -lh *.{jpg,png,jpeg,JPG,PNG,JPEG} 2>/dev/null | awk '{print $9}' | sort
