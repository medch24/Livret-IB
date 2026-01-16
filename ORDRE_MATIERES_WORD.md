# Ordre des Matières dans les Livrets Word

## 📚 Ordre Pédagogique Défini

Les matières apparaissent dans les livrets Word générés dans l'ordre suivant :

### 1. Langue et littérature
- Matière principale de langue

### 2. Acquisition de langues - Arabe
- **Acquisition de langue (اللغة العربية)**
- Arabe en premier

### 3. Acquisition de langues - Anglais
- **Acquisition de langue (Anglais)**
- Anglais en second

### 4. Individus et sociétés
- Sciences humaines et sociales

### 5. Sciences
- Sciences naturelles

### 6. Mathématiques
- Mathématiques

### 7. Arts
- **Art visuel**
- Disciplines artistiques

### 8. Éducation physique et sportive
- **Éducation physique et sportive**
- Activités sportives

### 9. Design
- Design et technologie

---

## 🔧 Implémentation Technique

### Fonction de Tri
```javascript
function sortSubjectsByOrder(contributions) {
    const subjectOrder = [
        'Langue et littérature',
        'Acquisition de langue (اللغة العربية)',
        'Acquisition de langue (Anglais)',
        'Individus et sociétés',
        'Sciences',
        'Mathématiques',
        'Art visuel',
        'Éducation physique et sportive',
        'Design'
    ];
    
    return contributions.sort((a, b) => {
        const indexA = subjectOrder.indexOf(a.subjectSelected);
        const indexB = subjectOrder.indexOf(b.subjectSelected);
        
        const orderA = indexA === -1 ? 999 : indexA;
        const orderB = indexB === -1 ? 999 : indexB;
        
        return orderA - orderB;
    });
}
```

### Application
- Le tri est appliqué automatiquement dans `prepareWordData()`
- Les matières non listées sont placées à la fin
- L'ordre est respecté dans tous les tableaux du Word (ATL + Critères)

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

## 📦 Commit

**Commit** : 577f15b  
**Message** : feat: Tri des matières dans l'ordre pédagogique pour les livrets Word  
**Date** : 16 Janvier 2026  
**Fichier modifié** : `api/index.js`

---

## 🔗 Références

- Code source : `api/index.js` (lignes 407-432)
- Fonction : `sortSubjectsByOrder()`
- Utilisation : `prepareWordData()`

---

**Version** : 2.0.4  
**Statut** : ✅ Implémenté et déployé
