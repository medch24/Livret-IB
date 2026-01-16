# Ordre des Matières dans les Livrets Word

## 📚 Ordre Pédagogique Défini

Les matières apparaissent dans les livrets Word générés dans l'ordre suivant :

### 1. Langue et littérature
- **Variations acceptées** : "Langue et littérature", "LL", "Langue et litterature (Français)"
- Détection : contient "langue et litt" OU "ll" OU ("langue" ET "français")

### 2. Acquisition de langues - Arabe
- **Variations acceptées** : "Acquisition de langue (اللغة العربية)", toute matière contenant "arabe" ou caractères arabes
- **Arabe en premier** dans les acquisitions de langues
- Détection : contient "arabe" OU "العربية" OU "اللغة"

### 3. Acquisition de langues - Anglais
- **Variations acceptées** : "Acquisition de langue (Anglais)", "Acquisition de langues (Anglais)", toute variante avec "anglais"
- **Anglais en second** dans les acquisitions de langues
- Détection : contient "anglais" OU "english"

### 4. Individus et sociétés
- **Variations acceptées** : Toute matière contenant "individu" ou "société"
- Sciences humaines et sociales

### 5. Sciences
- **Variations acceptées** : Toute matière contenant "science"
- Sciences naturelles

### 6. Mathématiques
- **Variations acceptées** : "Mathématiques", "Maths", toute variante avec "math"
- Détection : contient "math"

### 7. Arts
- **Variations acceptées** : "Art visuel", "Arts plastiques", "Arts", toute variante avec "art"
- Disciplines artistiques
- Détection : contient "art"

### 8. Éducation physique et sportive
- **Variations acceptées** : "Éducation physique et sportive", "Éducation physique et santé", "EPS"
- Activités sportives
- Détection : contient "éducation physique" OU "eps" OU ("physique" ET "sport")

### 9. Design
- **Variations acceptées** : "Design", toute matière contenant "design"
- Design et technologie

---

## 🔧 Implémentation Technique

### Détection Flexible par Catégorie
```javascript
function getSubjectCategory(subjectName) {
    if (!subjectName) return 999;
    const name = subjectName.toLowerCase();
    
    // 1. Langue et littérature
    if (name.includes('langue et litt') || name.includes('ll') || 
        (name.includes('langue') && name.includes('français'))) {
        return 1;
    }
    
    // 2. Arabe
    if (name.includes('arabe') || name.includes('العربية') || name.includes('اللغة')) {
        return 2;
    }
    
    // 3. Anglais
    if (name.includes('anglais') || name.includes('english')) {
        return 3;
    }
    
    // ... autres catégories 4-9
    
    return 999; // Non catégorisé
}
```

### Fonction de Tri
```javascript
function sortSubjectsByOrder(contributions) {
    return contributions.sort((a, b) => {
        const orderA = getSubjectCategory(a.subjectSelected);
        const orderB = getSubjectCategory(b.subjectSelected);
        
        // Si même catégorie, tri alphabétique
        if (orderA === orderB) {
            return (a.subjectSelected || '').localeCompare(b.subjectSelected || '');
        }
        
        return orderA - orderB;
    });
}
```

### Application
- Le tri est appliqué automatiquement dans `prepareWordData()`
- **Détection flexible** : fonctionne même si les noms de matières changent légèrement
- Les matières non catégorisées sont placées à la fin (ordre 999)
- Si plusieurs matières ont la même catégorie, tri alphabétique
- L'ordre est respecté dans tous les tableaux du Word (ATL + Critères)

## 💡 Avantages du Système Flexible

✅ **Tolérant aux variations** : "Langue et littérature" = "LL" = "Langue et litterature (Français)"  
✅ **Robuste** : Fonctionne même si les noms sont modifiés dans la base de données  
✅ **Maintenance facile** : Détection par mots-clés au lieu de correspondances exactes  
✅ **Extensible** : Facile d'ajouter de nouvelles variantes

---

## ✅ Vérification

Pour vérifier l'ordre dans les logs du serveur :
```
📚 Ordre des matières dans le Word: [
  'Langue et littérature',
  'Acquisition de langue (اللغة العربية)',
  'Acquisition de langue (Anglais)',
  'Individus et sociétés',
  'Sciences',
  'Mathématiques',
  'Art visuel',
  'Éducation physique et sportive',
  'Design'
]
```

---

## 📝 Notes

1. **Ordre automatique** : Le tri est appliqué lors de la génération du Word
2. **Matières manquantes** : Si un élève n'a pas toutes les matières, seules celles remplies apparaissent
3. **Nouvelles matières** : Si une matière n'est pas dans la liste, elle sera placée à la fin

---

## 📦 Commits

**Commit 1** : 577f15b - Tri initial avec ordre exact  
**Commit 2** : d6aed61 - Tri flexible avec détection par mots-clés  
**Date** : 16 Janvier 2026  
**Fichier modifié** : `api/index.js`

## 🧪 Exemples de Détection

| Nom dans la DB | Catégorie Détectée | Ordre |
|----------------|-------------------|-------|
| "Langue et littérature" | Langue et littérature | 1 |
| "LL" | Langue et littérature | 1 |
| "Langue et litterature (Français)" | Langue et littérature | 1 |
| "Acquisition de langue (اللغة العربية)" | Arabe | 2 |
| "Arabe" | Arabe | 2 |
| "Acquisition de langue (Anglais)" | Anglais | 3 |
| "Acquisition de langues (Anglais)" | Anglais | 3 |
| "Éducation physique et sportive" | EPS | 8 |
| "Éducation physique et santé" | EPS | 8 |
| "EPS" | EPS | 8 |
| "Matière inconnue" | Non catégorisée | 999 |

---

## 🔗 Références

- Code source : `api/index.js` (lignes 407-432)
- Fonction : `sortSubjectsByOrder()`
- Utilisation : `prepareWordData()`

---

**Version** : 2.0.4  
**Statut** : ✅ Implémenté et déployé
