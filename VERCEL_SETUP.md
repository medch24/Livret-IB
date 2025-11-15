# Configuration Vercel pour Livret IB

## ⚠️ IMPORTANT : Variables d'environnement requises

Pour que l'application fonctionne sur Vercel, vous DEVEZ configurer les variables d'environnement suivantes :

### 📋 Étapes de configuration

1. **Accédez à votre dashboard Vercel**
   - URL : https://vercel.com/dashboard
   - Sélectionnez votre projet `livret-ib2026`

2. **Allez dans Settings > Environment Variables**

3. **Ajoutez les variables suivantes :**

   | Variable | Valeur |
   |----------|--------|
   | `MONGODB_URI` | `mongodb+srv://mohamedsherif:Mmedch86@livret2026.9owu7hs.mongodb.net/?appName=Livret2026` |
   | `DB_NAME` | `teacherContributionsDB` |
   | `PORT` | `3000` |

4. **Choisissez l'environnement**
   - ✅ Production
   - ✅ Preview
   - ✅ Development

5. **Sauvegardez et redéployez**
   - Cliquez sur "Save"
   - Vercel va automatiquement redéployer l'application

## 🔍 Vérification

Après le déploiement :
- Allez sur https://livret-ib2026.vercel.app
- Ouvrez la console développeur (F12)
- Vérifiez les logs réseau
- Testez l'enregistrement d'une contribution

## ❌ Dépannage

Si vous voyez toujours "Database not connected" :
1. Vérifiez que les variables sont bien configurées dans Vercel
2. Vérifiez que l'IP de Vercel est autorisée dans MongoDB Atlas (0.0.0.0/0 recommandé)
3. Redéployez manuellement : `vercel --prod`

## 📝 Notes

- ⚠️ Les fichiers `.env.local` sont ignorés par Vercel
- ✅ Seules les variables d'environnement Vercel sont utilisées
- 🔒 Ne committez JAMAIS les mots de passe dans Git
