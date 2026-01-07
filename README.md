# Classic Cars - Application Frontend

Application web frontend moderne pour la gestion et la consultation d'un catalogue de voitures classiques. Cette interface permet de visualiser, rechercher et gérer une collection de véhicules d'exception via une API REST.

## 📋 Présentation

**Classic Cars** est une application web single-page (SPA) développée en JavaScript vanilla qui offre une expérience utilisateur fluide pour explorer un catalogue de voitures de collection. L'application communique avec une API REST externe pour récupérer et manipuler les données en temps réel.

### Fonctionnalités principales

- 🚗 **Catalogue de voitures** : Affichage en grille des voitures classiques avec images et informations essentielles
- 🔍 **Détails d'une voiture** : Page dédiée avec toutes les spécifications techniques (année, marque, modèle, couleur, kilométrage, prix, description)
- ➕ **Ajout de voitures** : Modal pour ajouter de nouvelles voitures au catalogue
- 🎨 **Interface moderne** : Design responsive avec Bootstrap 5, animations et transitions fluides
- ⚡ **Performance optimisée** : Gestion asynchrone des données, lazy loading, gestion des erreurs robuste
- 🔄 **Temps réel** : Synchronisation avec l'API REST pour des données toujours à jour

## 🛠️ Technologies utilisées

- **HTML5** : Structure sémantique et accessible
- **CSS3** : Styles personnalisés avec animations
- **JavaScript ES6+** : Modules ES6, async/await, Fetch API
- **Bootstrap 5.2.3** : Framework CSS pour le design responsive
- **Python HTTP Server** : Serveur de développement local

## 📁 Structure du projet

```
TP_JeanJaussaud_MaelKorchef_DevWeb_Frontend/
│
├── front/                          # Dossier principal de l'application
│   ├── index.html                  # Page d'accueil (liste des voitures)
│   ├── car.html                    # Page de détail d'une voiture
│   │
│   ├── js/                         # Scripts JavaScript
│   │   ├── config.js              # Configuration de l'API (URL, clé API)
│   │   ├── script.js              # Logique principale (liste des voitures)
│   │   ├── car.js                 # Logique de la page détail
│   │   └── mock-data.js           # Données de référence (structure)
│   │
│   └── imgs/                       # Ressources images
│       ├── cars/                   # Images des voitures
│       └── [favicons et logos]    # Icônes et favicons
│
├── start-server.bat                # Script de démarrage Windows
├── start-server.sh                 # Script de démarrage Linux/Mac
├── README.md                       # Ce fichier
└── DEBUG.md                        # Guide de débogage
```

## 🚀 Installation et démarrage

### Prérequis

- **Python 3.x** installé sur votre machine
- **Un éditeur de code** (VS Code recommandé)
- **Git** (optionnel, pour le contrôle de version)
- **Une API REST** déployée et accessible (voir section Configuration)

### Démarrage rapide

1. **Cloner ou télécharger le projet**
   ```bash
   git clone <url-du-repo>
   cd TP_JeanJaussaud_MaelKorchef_DevWeb_Frontend
   ```

2. **Configurer l'API** (voir section Configuration ci-dessous)

3. **Démarrer le serveur local**

   **Sur Windows :**
   ```bash
   start-server.bat
   ```

   **Sur Linux/Mac :**
   ```bash
   chmod +x start-server.sh
   ./start-server.sh
   ```

   **Ou manuellement :**
   ```bash
   cd front
   python -m http.server 8000
   # ou python3 -m http.server 8000
   ```

4. **Ouvrir dans le navigateur**
   ```
   http://localhost:8000
   ```

## ⚙️ Configuration de l'API

⚠️ **Important** : Ce projet nécessite une API REST fonctionnelle pour fonctionner correctement.

### Configuration dans `front/js/config.js`

Éditez le fichier `front/js/config.js` pour configurer la connexion à votre API :

```javascript
// Configuration de l'API
export const API_BASE_URL = 'https://votre-api.onrender.com';  // URL de votre API
export const API_KEY = 'votre-cle-api';                         // Votre clé API
```

### Configuration CORS requise

Votre API backend doit autoriser les requêtes depuis `http://localhost:8000`. Exemple de configuration (Express.js) :

```javascript
app.use(cors({
  origin: ['http://localhost:8000', 'http://127.0.0.1:8000'],
  credentials: true
}));
```

### Endpoints utilisés

L'application utilise les endpoints suivants de votre API :

- `GET /api/cars` : Récupère la liste de toutes les voitures
- `GET /api/cars/:id` : Récupère les détails d'une voiture spécifique
- `POST /api/cars` : Crée une nouvelle voiture (via modal)
- `DELETE /api/cars/:id` : Supprime une voiture

### Données mockées

Le fichier `mock-data.js` contient des données de référence pour comprendre la structure attendue. **Ces données ne sont pas utilisées en production**, elles servent uniquement de documentation.

## 📄 Fichiers importants

### `front/js/script.js`
- Gère l'affichage de la liste des voitures
- Implémente la fonction `fetchWithErrorHandling()` avec gestion du timeout
- Crée dynamiquement les cartes de voitures
- Gère les états de chargement et les erreurs

### `front/js/car.js`
- Gère l'affichage des détails d'une voiture
- Récupère les données via l'ID dans l'URL
- Affiche toutes les spécifications techniques

### `front/js/config.js`
- Contient la configuration de l'API (URL, clé API)
- Point central pour modifier la connexion à l'API

### `front/index.html`
- Page d'accueil avec la grille de voitures
- Modal pour ajouter une nouvelle voiture
- Structure Bootstrap responsive

### `front/car.html`
- Page de détail d'une voiture
- Affichage des spécifications complètes

## 🐛 Débogage

Si vous rencontrez des problèmes, consultez le fichier **[DEBUG.md](DEBUG.md)** qui contient :

- Guide de diagnostic des erreurs courantes
- Solutions aux problèmes CORS
- Gestion des erreurs réseau
- Vérification de la configuration

### Erreurs courantes

- **CORS** : Vérifiez que l'API autorise les requêtes depuis localhost
- **404** : Vérifiez l'URL de l'API dans `config.js`
- **Timeout** : L'API Render peut être lente au démarrage (cold start)
- **401/403** : Vérifiez que la clé API est correcte

## 🎨 Fonctionnalités de l'interface

### Page d'accueil (`index.html`)
- **Grille responsive** : Affichage en cartes adaptatif selon la taille de l'écran
- **Hover effects** : Animations au survol des images
- **Spinner de chargement** : Indicateur visuel pendant le chargement des données
- **Gestion d'erreurs** : Messages d'erreur clairs pour l'utilisateur
- **Bouton flottant** : Bouton "Add car" fixe en bas à droite pour l'ajout rapide

### Page détail (`car.html`)
- **Vue complète** : Toutes les informations de la voiture
- **Image principale** : Photo haute résolution
- **Tableau de spécifications** : Année, marque, modèle, couleur, kilométrage, prix, description
- **Navigation** : Bouton de retour vers la liste

## 🔧 Développement

### Architecture

L'application utilise une architecture modulaire :
- **Modules ES6** : Import/export pour une meilleure organisation
- **Separation of concerns** : Logique métier séparée de la présentation
- **Error handling** : Gestion centralisée des erreurs avec messages explicites

### Améliorations possibles

- 🔐 Authentification utilisateur
- 🔍 Barre de recherche et filtres avancés
- 📱 Version Progressive Web App (PWA)
- 💾 Mise en cache locale des données
- 🖼️ Galerie d'images multiples par voiture
- ✏️ Édition et suppression de voitures depuis l'interface

## 📝 Notes

- Les données sont récupérées dynamiquement depuis l'API REST
- Le serveur de développement Python sert uniquement les fichiers statiques
- L'application nécessite un serveur HTTP pour fonctionner (pas de `file://`)
- Les modules ES6 nécessitent un serveur avec support des modules

## 👥 Auteurs

- **Jean Jaussaud**
- **Mael Korchef**

## 📚 Ressources

- [Documentation Bootstrap 5](https://getbootstrap.com/docs/5.2/)
- [MDN Web Docs - Fetch API](https://developer.mozilla.org/fr/docs/Web/API/Fetch_API)
- [JavaScript Modules](https://developer.mozilla.org/fr/docs/Web/JavaScript/Guide/Modules)

---

**Année académique** : 2024-2025  
**Contexte** : Travail Pratique - Développement Web Frontend 
