import { API_BASE_URL, API_KEY } from "./config.js";

// Fonction utilitaire pour gérer les erreurs de fetch avec timeout
async function fetchWithErrorHandling(url, timeout = 30000) {
	try {
		console.log("Fetch vers:", url);
		
		// Créer un AbortController pour le timeout
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeout);
		
		const response = await fetch(url, {
			signal: controller.signal,
			method: 'GET',
			headers: {
				'Accept': 'application/json',
				'x-api-key': API_KEY,
			}
		});
		
		clearTimeout(timeoutId);
		console.log("Status de la réponse:", response.status, response.statusText);

		// Vérifier si la réponse est OK (status 200-299)
		if (!response.ok) {
			let errorMessage = `Erreur HTTP: ${response.status}`;
			try {
				const errorData = await response.json();
				errorMessage = errorData.error || errorData.message || errorMessage;
			} catch (e) {
				// Si on ne peut pas parser le JSON, utiliser le message par défaut
			}
			
			if (response.status === 401 || response.status === 403) {
				throw new Error("Non autorisé: Vérifiez votre clé API");
			} else if (response.status === 404) {
				throw new Error("Ressource non trouvée (404)");
			} else if (response.status === 500) {
				throw new Error("Erreur serveur (500)");
			} else {
				throw new Error(errorMessage);
			}
		}

		// Parser le JSON
		const data = await response.json();
		console.log("Données parsées:", data);

		// Vérifier si la réponse de l'API indique un succès
		// Note: Certaines APIs peuvent retourner directement les données sans wrapper "success"
		if (data.success === false) {
			throw new Error(data.error || "Erreur lors de la récupération des données");
		}

		// Si pas de champ success, vérifier si on a directement un tableau
		if (!data.success && !data.data && !Array.isArray(data)) {
			// Peut-être que l'API retourne directement un tableau
			if (Array.isArray(data)) {
				return { success: true, data: data };
			}
		}

		return data;
	} catch (error) {
		// Gérer les erreurs de timeout
		if (error.name === 'AbortError') {
			throw new Error("Timeout: Le serveur met trop de temps à répondre. L'API Render peut être en cours de démarrage (cold start). Réessayez dans quelques secondes.");
		}
		// Gérer les erreurs CORS
		if (error.message.includes("CORS") || error.message.includes("cross-origin") || error.message.includes("Access-Control")) {
			throw new Error("Erreur CORS: Le serveur ne permet pas les requêtes depuis ce domaine. Vérifiez que l'API autorise les requêtes depuis localhost dans sa configuration CORS.");
		}
		// Gérer les erreurs réseau
		if (error instanceof TypeError && (error.message.includes("fetch") || error.message.includes("Failed to fetch") || error.message.includes("NetworkError"))) {
			throw new Error("Erreur réseau: Impossible de contacter le serveur. Vérifiez votre connexion internet et que l'URL de l'API est correcte: " + url);
		}
		// Gérer les erreurs de parsing JSON
		if (error instanceof SyntaxError) {
			throw new Error("Erreur: Réponse du serveur invalide (JSON mal formé). La réponse n'est peut-être pas au format JSON.");
		}
		// Propager les autres erreurs
		console.error("Erreur détaillée:", error);
		throw error;
	}
}

// Fonction pour créer une carte de voiture
function createCarCard(car) {
	// Valeurs par défaut pour les données manquantes
	const id = car.id || "";
	const brand = car.brand || "Marque inconnue";
	const model = car.model || "Modèle inconnu";
	const year = car.year || "N/A";
	const description = car.description || "Aucune description disponible";
	const imageUrl = car.image_url || car.imageUrl || "./imgs/classic-cars.jpg";

	// 1. Créer l'article principal
	const article = document.createElement("article");
	article.className = "card shadow-sm";

	// 2. Créer le lien pour l'image
	const imageLink = document.createElement("a");
	imageLink.href = `car.html?id=${id}`;

	// 3. Créer l'image
	const image = document.createElement("img");
	image.src = imageUrl;
	image.className = "card-img-top object-fit-fill";
	image.alt = `${brand} ${model}`;
	// Gérer l'erreur de chargement d'image
	image.onerror = function() {
		this.src = "./imgs/classic-cars.jpg";
	};

	// Ajouter l'image au lien
	imageLink.appendChild(image);

	// 4. Créer le corps de la carte
	const cardBody = document.createElement("div");
	cardBody.className = "card-body";

	// Créer le titre
	const title = document.createElement("h5");
	title.className = "card-title";
	title.textContent = `${year} ${brand} ${model}`;

	// Créer la description
	const descriptionText = document.createElement("p");
	descriptionText.className = "card-text";
	descriptionText.textContent = description;

	// Créer le bouton "See more"
	const seeMoreLink = document.createElement("a");
	seeMoreLink.href = `car.html?id=${id}`;
	seeMoreLink.className = "btn btn-primary";
	seeMoreLink.textContent = "See more";

	// Ajouter les éléments au corps de la carte
	cardBody.appendChild(title);
	cardBody.appendChild(descriptionText);
	cardBody.appendChild(seeMoreLink);

	// 5. Assembler le tout : ajouter le lien image et le corps à l'article
	article.appendChild(imageLink);
	article.appendChild(cardBody);

	return article;
}

// Fonction pour afficher un message d'erreur
function displayError(message) {
	const container = document.querySelector(".card-cont");
	if (!container) return;

	// Vider le container
	container.innerHTML = "";

	// Créer l'alerte d'erreur avec createElement
	const alertDiv = document.createElement("div");
	alertDiv.className = "alert alert-danger w-100";
	alertDiv.setAttribute("role", "alert");

	const heading = document.createElement("h4");
	heading.className = "alert-heading";
	heading.textContent = "Erreur de chargement";

	const errorMessage = document.createElement("p");
	errorMessage.textContent = message;

	const hr = document.createElement("hr");

	const helpMessage = document.createElement("p");
	helpMessage.className = "mb-0";
	helpMessage.textContent = "Veuillez réessayer plus tard ou contacter le support si le problème persiste.";

	// Assembler l'alerte
	alertDiv.appendChild(heading);
	alertDiv.appendChild(errorMessage);
	alertDiv.appendChild(hr);
	alertDiv.appendChild(helpMessage);

	container.appendChild(alertDiv);
}

// Fonction pour afficher un indicateur de chargement
function displayLoading() {
	const container = document.querySelector(".card-cont");
	if (!container) return;

	container.innerHTML = `
		<div class="d-flex justify-content-center align-items-center w-100" style="min-height: 200px;">
			<div class="spinner-border text-primary" role="status">
				<span class="visually-hidden">Chargement...</span>
			</div>
		</div>
	`;
}

// Fonction principale pour charger et afficher les voitures
async function loadCars() {
	const container = document.querySelector(".card-cont");
	
	if (!container) {
		console.error("Container .card-cont non trouvé");
		return;
	}

	// Afficher l'indicateur de chargement
	displayLoading();

	try {
		// Construire l'URL de l'API
		const apiUrl = `${API_BASE_URL}/api/cars`;
		console.log("Tentative de connexion à l'API:", apiUrl);

		// Récupérer les données
		const response = await fetchWithErrorHandling(apiUrl);
		console.log("Réponse de l'API reçue:", response);

		// Vérifier que les données existent
		if (!response.data || !Array.isArray(response.data)) {
			console.error("Structure de réponse invalide:", response);
			throw new Error("Format de données invalide: tableau de voitures attendu");
		}

		// Vider le container
		container.innerHTML = "";

		// Vérifier si des voitures sont disponibles
		if (response.data.length === 0) {
			const alertDiv = document.createElement("div");
			alertDiv.className = "alert alert-info w-100";
			alertDiv.setAttribute("role", "alert");
			
			const heading = document.createElement("h4");
			heading.className = "alert-heading";
			heading.textContent = "Aucune voiture disponible";
			
			const message = document.createElement("p");
			message.textContent = "Aucune voiture n'est actuellement disponible dans le catalogue.";
			
			alertDiv.appendChild(heading);
			alertDiv.appendChild(message);
			container.appendChild(alertDiv);
			return;
		}

		// Utiliser DocumentFragment pour améliorer les performances (éviter les reflows multiples)
		const fragment = document.createDocumentFragment();
		
		// Créer et ajouter les cartes pour chaque voiture
		response.data.forEach((car) => {
			const card = createCarCard(car);
			fragment.appendChild(card);
		});
		
		// Ajouter toutes les cartes au container en une seule opération
		container.appendChild(fragment);

		console.log(`${response.data.length} voiture(s) chargée(s) avec succès`);
	} catch (error) {
		console.error("Erreur lors du chargement des voitures:", error);
		console.error("Détails de l'erreur:", {
			message: error.message,
			stack: error.stack,
			name: error.name
		});
		displayError(error.message || "Une erreur inattendue s'est produite");
	}
}

// Charger les voitures au chargement de la page
document.addEventListener("DOMContentLoaded", loadCars);
