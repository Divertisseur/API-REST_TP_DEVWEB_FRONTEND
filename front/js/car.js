import { API_BASE_URL, API_KEY } from "./config.js";

// Fonction utilitaire pour gérer les erreurs de fetch
async function fetchWithErrorHandling(url) {
	try {
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Accept': 'application/json',
				'x-api-key': API_KEY,
			}
		});

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
				throw new Error("Voiture non trouvée (404)");
			} else if (response.status === 500) {
				throw new Error("Erreur serveur (500)");
			} else {
				throw new Error(errorMessage);
			}
		}

		// Parser le JSON
		const data = await response.json();

		// Vérifier si la réponse de l'API indique un succès
		if (!data.success) {
			throw new Error(data.error || "Erreur lors de la récupération des données");
		}

		return data;
	} catch (error) {
		// Gérer les erreurs CORS
		if (error.message.includes("CORS") || error.message.includes("cross-origin") || error.message.includes("Access-Control")) {
			throw new Error("Erreur CORS: Le serveur ne permet pas les requêtes depuis ce domaine.");
		}
		// Gérer les erreurs réseau
		if (error instanceof TypeError && (error.message.includes("fetch") || error.message.includes("Failed to fetch") || error.message.includes("NetworkError"))) {
			throw new Error("Erreur réseau: Impossible de contacter le serveur. Vérifiez votre connexion internet et que l'URL de l'API est correcte.");
		}
		// Gérer les erreurs de parsing JSON
		if (error instanceof SyntaxError) {
			throw new Error("Erreur: Réponse du serveur invalide (JSON mal formé).");
		}
		// Propager les autres erreurs
		console.error("Erreur détaillée:", error);
		throw error;
	}
}

// Fonction pour extraire l'ID depuis l'URL
function getCarIdFromUrl() {
	const urlParams = new URLSearchParams(window.location.search);
	const id = urlParams.get("id");

	if (!id) {
		throw new Error("ID de voiture manquant dans l'URL");
	}

	return id;
}

// Fonction pour formater le prix
function formatPrice(price) {
	if (!price && price !== 0) {
		return "Prix non disponible";
	}
	return `${price.toLocaleString("fr-FR")} €`;
}

// Fonction pour remplir les données de la voiture dans la page
function populateCarData(car) {
	// Valeurs par défaut pour les données manquantes
	const brand = car.brand || "Marque inconnue";
	const model = car.model || "Modèle inconnu";
	const year = car.year || "N/A";
	const color = car.color || "Non spécifiée";
	const mileage = car.mileage !== undefined && car.mileage !== null ? car.mileage.toLocaleString("fr-FR") : "N/A";
	const description = car.description || "Aucune description disponible";
	const price = formatPrice(car.price);
	const imageUrl = car.image_url || car.imageUrl || "./imgs/classic-cars.jpg";

	// Mettre à jour le titre
	const titleElement = document.querySelector("article h2");
	if (titleElement) {
		titleElement.textContent = `${year} ${brand} ${model}`;
	}

	// Mettre à jour l'image
	const imageElement = document.querySelector("article img");
	if (imageElement) {
		imageElement.src = imageUrl;
		imageElement.alt = `${brand} ${model}`;
		imageElement.onerror = function() {
			this.src = "./imgs/classic-cars.jpg";
		};
	}

	// Mettre à jour le tableau des spécifications en utilisant createElement
	const tableBody = document.querySelector("table tbody");
	if (tableBody) {
		// Vider le tbody existant
		tableBody.innerHTML = "";
		
		// Fonction helper pour créer une ligne de tableau
		function createTableRow(label, value, colspan = 1) {
			const row = document.createElement("tr");
			const th = document.createElement("th");
			th.scope = "row";
			th.textContent = label;
			
			const td = document.createElement("td");
			if (colspan > 1) {
				td.colSpan = colspan;
			}
			td.textContent = value;
			
			row.appendChild(th);
			row.appendChild(td);
			return row;
		}
		
		// Créer toutes les lignes
		tableBody.appendChild(createTableRow("Year", year));
		tableBody.appendChild(createTableRow("Make", brand));
		tableBody.appendChild(createTableRow("Model", model, 2));
		tableBody.appendChild(createTableRow("Color", color, 2));
		tableBody.appendChild(createTableRow("Mileage", `${mileage} km`, 2));
		tableBody.appendChild(createTableRow("Description", description, 2));
		tableBody.appendChild(createTableRow("Prize", price, 2));
	}
}

// Fonction pour afficher un message d'erreur
function displayError(message) {
	const container = document.querySelector(".container");
	if (!container) return;

	const article = container.querySelector("article");
	if (article) {
		// Vider l'article
		article.innerHTML = "";

		// Créer l'alerte d'erreur avec createElement
		const alertDiv = document.createElement("div");
		alertDiv.className = "alert alert-danger";
		alertDiv.setAttribute("role", "alert");

		const heading = document.createElement("h4");
		heading.className = "alert-heading";
		heading.textContent = "Erreur de chargement";

		const errorMessage = document.createElement("p");
		errorMessage.textContent = message;

		const hr = document.createElement("hr");

		const buttonContainer = document.createElement("p");
		buttonContainer.className = "mb-0";

		const backLink = document.createElement("a");
		backLink.href = "./index.html";
		backLink.className = "btn btn-primary";
		backLink.textContent = "Retour à l'accueil";

		buttonContainer.appendChild(backLink);

		// Assembler l'alerte
		alertDiv.appendChild(heading);
		alertDiv.appendChild(errorMessage);
		alertDiv.appendChild(hr);
		alertDiv.appendChild(buttonContainer);

		article.appendChild(alertDiv);
	}
}

// Fonction pour afficher un indicateur de chargement
function displayLoading() {
	const container = document.querySelector(".container");
	if (!container) return;

	const article = container.querySelector("article");
	if (article) {
		article.innerHTML = `
			<div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
				<div class="spinner-border text-primary" role="status">
					<span class="visually-hidden">Chargement...</span>
				</div>
			</div>
		`;
	}
}

// Fonction principale pour charger et afficher les détails de la voiture
async function loadCarDetails() {
	// Afficher l'indicateur de chargement
	displayLoading();

	try {
		// Extraire l'ID depuis l'URL
		const carId = getCarIdFromUrl();

		// Construire l'URL de l'API
		const apiUrl = `${API_BASE_URL}/api/cars/${carId}`;

		// Récupérer les données
		const response = await fetchWithErrorHandling(apiUrl);

		// Vérifier que les données existent
		if (!response.data) {
			throw new Error("Format de données invalide: données de voiture attendues");
		}

		// Remplir la page avec les données
		populateCarData(response.data);

		console.log("Détails de la voiture chargés avec succès");
	} catch (error) {
		console.error("Erreur lors du chargement des détails de la voiture:", error);
		displayError(error.message || "Une erreur inattendue s'est produite");
	}
}

// Charger les détails de la voiture au chargement de la page
document.addEventListener("DOMContentLoaded", loadCarDetails);
