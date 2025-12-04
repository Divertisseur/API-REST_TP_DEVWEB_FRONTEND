# Guide de débogage

## Problème : Le chargement reste bloqué sur le spinner

### Étapes de diagnostic

1. **Ouvrez la console du navigateur** (F12 ou Clic droit > Inspecter > Console)

2. **Vérifiez les messages dans la console** :
   - Vous devriez voir des messages comme "Fetch vers: ..."
   - Cherchez les erreurs en rouge

3. **Erreurs courantes et solutions** :

#### Erreur CORS
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```
**Solution** : L'API doit autoriser les requêtes depuis `http://localhost:8000`. Vérifiez la configuration CORS de votre API backend.

#### Erreur réseau / Failed to fetch
```
Failed to fetch
NetworkError
```
**Solutions** :
- Vérifiez que l'API est bien déployée et accessible
- Testez l'URL directement dans le navigateur : `https://api-rest-tp-devweb.onrender.com/api/cars`
- Vérifiez votre connexion internet
- L'API Render peut être en "cold start" (première requête après inactivité) - attendez 30-60 secondes

#### Timeout
```
Timeout: Le serveur met trop de temps à répondre
```
**Solution** : L'API Render peut être lente au démarrage. Réessayez après quelques secondes.

#### Erreur 404
```
Ressource non trouvée (404)
```
**Solution** : Vérifiez que l'URL de l'API est correcte dans `front/js/config.js`

#### Erreur 500
```
Erreur serveur (500)
```
**Solution** : Il y a un problème côté serveur. Vérifiez les logs de votre API sur Render.

### Test manuel de l'API

Ouvrez cette URL dans votre navigateur pour tester directement l'API :
```
https://api-rest-tp-devweb.onrender.com/api/cars
```

Vous devriez voir une réponse JSON. Si vous voyez une erreur, le problème vient de l'API.

### Vérification de la configuration

1. Ouvrez `front/js/config.js`
2. Vérifiez que l'URL est correcte : `https://api-rest-tp-devweb.onrender.com`
3. Assurez-vous qu'il n'y a pas de slash à la fin

### Configuration CORS nécessaire dans l'API

Votre API backend doit autoriser les requêtes depuis localhost. Exemple de configuration (Express.js) :

```javascript
app.use(cors({
  origin: ['http://localhost:8000', 'http://127.0.0.1:8000'],
  credentials: true
}));
```

Ou pour autoriser toutes les origines en développement :
```javascript
app.use(cors());
```

