# Guide de déploiement sur Render

## Configuration nécessaire

### Option 1 : Site statique (recommandé pour un frontend simple)

1. **Dans le dashboard Render :**
   - Créez un nouveau "Static Site"
   - Connectez votre repository Git
   - **Root Directory** : `front`
   - **Build Command** : (laisser vide)
   - **Publish Directory** : `front`

### Option 2 : Service Web avec Node.js (si vous avez besoin d'un serveur)

1. **Dans le dashboard Render :**
   - Créez un nouveau "Web Service"
   - Connectez votre repository Git
   - **Root Directory** : (laisser vide, ou `.`)
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
   - **Environment** : `Node`

2. **Variables d'environnement à ajouter (optionnel) :**
   - `PORT` : Render définit automatiquement le port, mais vous pouvez le laisser vide

## ⚠️ IMPORTANT : Mettre à jour l'URL de l'API

Après le déploiement, vous devez mettre à jour `front/js/config.js` :

```javascript
export const API_BASE_URL = 'https://votre-api-backend.onrender.com';
```

**OU** utilisez des variables d'environnement si vous utilisez l'Option 2 avec Node.js.

## Vérifications

- [ ] L'URL de l'API backend est correcte dans `config.js`
- [ ] La clé API est correcte
- [ ] Le site se charge correctement
- [ ] Les requêtes vers l'API fonctionnent (vérifier la console du navigateur)

## Dépannage

Si vous avez des erreurs :
1. Vérifiez les logs de déploiement dans Render
2. Vérifiez la console du navigateur (F12) pour les erreurs CORS ou réseau
3. Assurez-vous que le backend autorise les requêtes depuis votre domaine Render

