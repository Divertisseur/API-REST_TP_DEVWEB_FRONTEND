import { API_BASE_URL, API_KEY, fetchWithAuth, API_CONFIG } from "./config.js";

// Log de démarrage pour vérifier que le script se charge
console.log("🚀 Script script.js chargé et initialisé");

// Définir immédiatement la fonction globale pour la soumission du formulaire
// Cette fonction temporaire sera remplacée plus tard
window._handleFormSubmitModule = function(event) {
	console.log("⚠️ Module en cours de chargement, fonction temporaire appelée");
	// La fonction sera remplacée plus bas dans le fichier
	if (window._realHandleFormSubmit) {
		window._realHandleFormSubmit(event);
	} else {
		console.warn("⏳ La vraie fonction n'est pas encore disponible, attente...");
		// Mettre en file d'attente
		if (!window._formSubmitQueue) {
			window._formSubmitQueue = [];
		}
		window._formSubmitQueue.push(event);
	}
};

// Fonction utilitaire pour gérer les erreurs de fetch avec timeout (GET uniquement)
async function fetchWithErrorHandling(url, timeout = 30000) {
	try {
		console.log("Fetch vers:", url);
		
		const response = await fetchWithAuth(url, {
			method: 'GET'
		}, timeout);
		
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
	image.className = "card-img-top object-fit-cover";
	image.alt = `${brand} ${model}`;
	image.style.width = "100%";
	image.style.height = "235px";
	image.style.objectFit = "cover";
	image.loading = "lazy"; // Chargement paresseux pour améliorer les performances
	
	// Gérer le chargement de l'image avec meilleure gestion d'erreur
	image.onload = function() {
		console.log(`✅ Image chargée avec succès: ${imageUrl}`);
	};
	
	// Gérer l'erreur de chargement d'image
	image.onerror = function() {
		console.warn(`⚠️ Erreur de chargement d'image: ${imageUrl}`);
		console.warn(`⚠️ URL tentée: ${this.src}`);
		// Ne remplacer que si ce n'est pas déjà l'image par défaut
		const defaultImgPath = new URL("./imgs/classic-cars.jpg", window.location.href).href;
		if (this.src !== defaultImgPath && !this.src.includes('classic-cars.jpg')) {
			console.log(`🔄 Remplacement par l'image par défaut`);
			this.src = "./imgs/classic-cars.jpg";
		}
	};
	
	// Définir la source après avoir configuré les handlers
	console.log(`🖼️ Tentative de chargement d'image: ${imageUrl}`);
	image.src = imageUrl;
	
	// Ajouter un attribut pour le débogage
	image.setAttribute('data-original-src', imageUrl);

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

	// Créer le bouton "Supprimer"
	const deleteButton = document.createElement("button");
	deleteButton.className = "btn btn-danger btn-sm";
	deleteButton.textContent = "Supprimer";
	deleteButton.setAttribute("data-car-id", id);
	deleteButton.setAttribute("aria-label", `Supprimer ${brand} ${model}`);
	deleteButton.type = "button"; // Empêcher la soumission de formulaire
	deleteButton.setAttribute("data-car-id", id);
	deleteButton.setAttribute("aria-label", `Supprimer ${brand} ${model}`);
	deleteButton.type = "button"; // Empêcher la soumission de formulaire
	
	// Debug : vérifier que le bouton est créé
	if (!id || id === "") {
		console.warn("⚠️ Attention : Voiture sans ID, le bouton de suppression ne fonctionnera pas", car);
	}

	// Créer un conteneur pour les boutons avec un style visible
	const buttonContainer = document.createElement("div");
	buttonContainer.className = "button-container";
	buttonContainer.appendChild(seeMoreLink);
	buttonContainer.appendChild(deleteButton);
	
	console.log(`✅ Carte créée avec bouton Supprimer pour voiture ID: ${id}, Brand: ${brand}, Model: ${model}`);

	// Ajouter les éléments au corps de la carte
	cardBody.appendChild(title);
	cardBody.appendChild(descriptionText);
	cardBody.appendChild(buttonContainer);

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
			console.log(`📦 Données de la voiture:`, {
				id: car.id,
				brand: car.brand,
				model: car.model,
				image_url: car.image_url,
				imageUrl: car.imageUrl,
				imageUrl_final: car.image_url || car.imageUrl || "./imgs/classic-cars.jpg"
			});
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

// ============================================
// FONCTIONS DE VALIDATION
// ============================================

/**
 * Valide les données d'une voiture avant envoi à l'API
 * @param {object} data - Données de la voiture à valider
 * @returns {object} - { isValid: boolean, errors: string[] }
 */
function validateCarData(data) {
	const errors = [];
	const currentYear = new Date().getFullYear();

	// Vérifier les champs requis
	if (!data.brand || data.brand.trim() === '') {
		errors.push('La marque est requise');
	}

	if (!data.model || data.model.trim() === '') {
		errors.push('Le modèle est requis');
	}

	if (!data.year) {
		errors.push('L\'année est requise');
	} else {
		const yearNum = parseInt(data.year);
		if (isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear) {
			errors.push(`L'année doit être entre 1900 et ${currentYear}`);
		}
	}

	if (!data.color || data.color.trim() === '') {
		errors.push('La couleur est requise');
	}

	if (!data.price) {
		errors.push('Le prix est requis');
	} else {
		const priceNum = parseFloat(data.price);
		if (isNaN(priceNum) || priceNum < 0) {
			errors.push('Le prix doit être un nombre positif');
		}
	}

	if (!data.mileage) {
		errors.push('Le kilométrage est requis');
	} else {
		const mileageNum = parseInt(data.mileage);
		if (isNaN(mileageNum) || mileageNum < 0) {
			errors.push('Le kilométrage doit être un nombre positif');
		}
	}

	// Vérifier l'URL de l'image si fournie
	if (data.image_url && data.image_url.trim() !== '') {
		try {
			new URL(data.image_url);
		} catch (e) {
			errors.push('L\'URL de l\'image n\'est pas valide');
		}
	}

	return {
		isValid: errors.length === 0,
		errors: errors
	};
}

/**
 * Affiche les erreurs de validation dans le formulaire
 * @param {string[]} errors - Liste des erreurs à afficher
 */
function displayValidationErrors(errors) {
	// Afficher les erreurs dans l'alerte globale
	const errorAlert = document.getElementById('formErrorAlert');
	if (errorAlert && errors.length > 0) {
		errorAlert.classList.remove('d-none');
		errorAlert.innerHTML = `
			<strong>Erreurs de validation :</strong>
			<ul class="mb-0">
				${errors.map(error => `<li>${error}</li>`).join('')}
			</ul>
		`;
	}

	// Marquer les champs en erreur (optionnel, on se concentre sur l'alerte globale)
	const form = document.getElementById('addCarForm');
	if (form) {
		// Supprimer les classes d'erreur précédentes
		form.querySelectorAll('.is-invalid').forEach(el => {
			el.classList.remove('is-invalid');
		});
	}
}

/**
 * Cache les alertes d'erreur et de succès
 */
function clearAlerts() {
	const errorAlert = document.getElementById('formErrorAlert');
	const successAlert = document.getElementById('formSuccessAlert');
	if (errorAlert) errorAlert.classList.add('d-none');
	if (successAlert) successAlert.classList.add('d-none');
}

// ============================================
// FONCTIONS API - CRÉATION ET SUPPRESSION DE VOITURE
// ============================================

/**
 * Supprime une voiture via l'API
 * @param {number|string} carId - ID de la voiture à supprimer
 * @returns {Promise<boolean>} - true si succès, false sinon
 */
async function deleteCar(carId) {
	try {
		const url = `${API_CONFIG.BASE_URL}/api/cars/${carId}`;
		console.log("Suppression de la voiture ID:", carId);

		const response = await fetchWithAuth(url, {
			method: 'DELETE'
		});

		console.log("Status de la réponse:", response.status, response.statusText);

		if (!response.ok) {
			if (response.status === 404) {
				console.warn("La voiture n'existe déjà plus (404)");
				// On considère ça comme un succès car l'objectif est atteint (la voiture n'existe plus)
				return true;
			} else if (response.status === 401 || response.status === 403) {
				throw new Error("Non autorisé: Vérifiez votre clé API");
			} else if (response.status === 500) {
				throw new Error("Erreur serveur (500)");
			} else {
				let errorMessage = `Erreur HTTP: ${response.status}`;
				try {
					const errorData = await response.json();
					errorMessage = errorData.error || errorData.message || errorMessage;
				} catch (e) {
					// Si on ne peut pas parser le JSON, utiliser le message par défaut
				}
				throw new Error(errorMessage);
			}
		}

		// La réponse peut être vide (204 No Content) ou contenir un message
		if (response.status === 204 || response.status === 200) {
			console.log("✅ Voiture supprimée avec succès");
			return true;
		}

		return true;
	} catch (error) {
		console.error('Erreur lors de la suppression de la voiture:', error);
		
		// Gérer les erreurs réseau
		if (error instanceof TypeError && error.message.includes("fetch")) {
			throw new Error("Erreur réseau: Impossible de contacter le serveur. Vérifiez votre connexion internet.");
		}
		
		// Propager les autres erreurs
		throw error;
	}
}

/**
 * Crée une nouvelle voiture via l'API
 * @param {object} carData - Données de la voiture à créer
 * @returns {Promise<object|null>} - La voiture créée ou null en cas d'erreur
 */
async function createCar(carData) {
	try {
		const url = `${API_CONFIG.BASE_URL}/api/cars`;
		console.log("Création d'une voiture:", carData);

		const response = await fetchWithAuth(url, {
			method: 'POST',
			body: JSON.stringify(carData)
		});

		console.log("Status de la réponse:", response.status, response.statusText);

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
			} else if (response.status === 400) {
				throw new Error(`Erreur de validation: ${errorMessage}`);
			} else if (response.status === 500) {
				throw new Error("Erreur serveur (500)");
			} else {
				throw new Error(errorMessage);
			}
		}

		const data = await response.json();
		
		// L'API peut retourner { success: true, data: {...} } ou directement l'objet
		const newCar = data.data || data;
		console.log("Voiture créée avec succès:", newCar);
		return newCar;

	} catch (error) {
		console.error('Erreur lors de la création de la voiture:', error);
		
		// Gérer les erreurs réseau
		if (error instanceof TypeError && error.message.includes("fetch")) {
			throw new Error("Erreur réseau: Impossible de contacter le serveur. Vérifiez votre connexion internet.");
		}
		
		// Propager les autres erreurs
		throw error;
	}
}

// ============================================
// GESTION DU FORMULAIRE
// ============================================

/**
 * Ferme le modal Bootstrap
 */
function closeModal() {
	const modalElement = document.getElementById('exampleModal');
	if (modalElement) {
		const modal = bootstrap.Modal.getInstance(modalElement);
		if (modal) {
			modal.hide();
		}
	}
}

/**
 * Réinitialise le formulaire
 */
function resetForm() {
	const form = document.getElementById('addCarForm');
	if (form) {
		form.reset();
		// Supprimer les classes d'erreur
		form.querySelectorAll('.is-invalid').forEach(el => {
			el.classList.remove('is-invalid');
		});
		clearAlerts();
	}
}

/**
 * Gère la soumission du formulaire
 * @param {Event} event - Événement de soumission
 */
async function handleFormSubmit(event) {
	// Si cette fonction est appelée, on sait que le module est chargé
	if (!window._realHandleFormSubmit) {
		window._realHandleFormSubmit = handleFormSubmit;
	}
	event.preventDefault(); // Empêcher le rechargement de la page
	event.stopPropagation(); // Empêcher la propagation de l'événement
	
	console.log("Formulaire soumis, interception de l'événement");

	const form = event.target;
	const submitButton = document.getElementById('submitButton');

	// Effacer les alertes précédentes
	clearAlerts();

	// Désactiver le bouton pour éviter les doubles soumissions
	if (submitButton) {
		const originalText = submitButton.textContent;
		submitButton.disabled = true;
		submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Envoi en cours...';
		
		try {
			// 1. Récupérer les données du formulaire
			const formData = new FormData(form);
			const carData = Object.fromEntries(formData);

			// 2. Convertir les types de données
			carData.year = parseInt(carData.year);
			carData.price = parseFloat(carData.price);
			carData.mileage = parseInt(carData.mileage);

			// Nettoyer les chaînes vides pour les champs optionnels
			if (!carData.description || carData.description.trim() === '') {
				delete carData.description;
			}
			if (!carData.image_url || carData.image_url.trim() === '') {
				delete carData.image_url;
			}

			// 3. Valider les données
			const validation = validateCarData(carData);
			if (!validation.isValid) {
				displayValidationErrors(validation.errors);
				// Réactiver le bouton avant de retourner
				if (submitButton) {
					submitButton.disabled = false;
					submitButton.textContent = originalText;
				}
				return;
			}

			// 4. Envoyer à l'API
			const newCar = await createCar(carData);

			// 5. Gérer le succès
			if (newCar) {
				// Afficher un message de succès
				const successAlert = document.getElementById('formSuccessAlert');
				if (successAlert) {
					successAlert.classList.remove('d-none');
					successAlert.textContent = `✓ La voiture "${carData.brand} ${carData.model}" a été ajoutée avec succès !`;
				}

				// Réinitialiser le formulaire
				resetForm();

				// Fermer le modal après un court délai
				setTimeout(() => {
					closeModal();
					// Rafraîchir la liste des voitures
					loadCars();
				}, 1500);
			}

		} catch (error) {
			// Afficher l'erreur
			const errorAlert = document.getElementById('formErrorAlert');
			if (errorAlert) {
				errorAlert.classList.remove('d-none');
				errorAlert.textContent = `Erreur: ${error.message}`;
			}
			console.error('Erreur lors de la soumission:', error);
		} finally {
			// Réactiver le bouton
			if (submitButton) {
				submitButton.disabled = false;
				submitButton.textContent = originalText;
			}
		}
	}
}

// ============================================
// FONCTION GLOBALE POUR L'INTERCEPTION DU FORMULAIRE
// ============================================

// Remplacer la fonction globale temporaire par la vraie fonction
window._realHandleFormSubmit = handleFormSubmit;
window._handleFormSubmitModule = function(event) {
	console.log("🔵 Module : Traitement de la soumission du formulaire");
	handleFormSubmit(event);
};

// Traiter la file d'attente si elle existe
if (window._formSubmitQueue && window._formSubmitQueue.length > 0) {
	console.log("📦 Traitement de la file d'attente au chargement du module");
	window._formSubmitQueue.forEach(event => {
		window._handleFormSubmitModule(event);
	});
	window._formSubmitQueue = [];
}

// Garder aussi handleFormSubmitGlobal pour compatibilité
window.handleFormSubmitGlobal = window._handleFormSubmitModule;

console.log("✅ Module script.js chargé, _handleFormSubmitModule disponible");

// ============================================
// GESTION DE LA SUPPRESSION
// ============================================

// Variable pour stocker temporairement l'ID de la voiture à supprimer
let carToDelete = null;
let deleteButtonElement = null;

/**
 * Gère la demande de suppression (ouvre le modal de confirmation)
 * @param {string} carId - ID de la voiture à supprimer
 * @param {HTMLElement} button - Bouton de suppression cliqué
 */
function handleDeleteRequest(carId, button) {
	carToDelete = carId;
	deleteButtonElement = button;
	
	// Récupérer les informations de la voiture depuis la carte
	const card = button.closest('.card');
	const title = card ? card.querySelector('.card-title')?.textContent : '';
	
	// Mettre à jour le message de confirmation
	const deleteCarInfo = document.getElementById('deleteCarInfo');
	if (deleteCarInfo && title) {
		deleteCarInfo.textContent = `Voiture : ${title}`;
	}
	
	// Ouvrir le modal de confirmation
	const confirmModal = new bootstrap.Modal(document.getElementById('confirmDeleteModal'));
	confirmModal.show();
}

/**
 * Effectue la suppression après confirmation
 */
async function confirmDelete() {
	if (!carToDelete || !deleteButtonElement) {
		console.error("Aucune voiture à supprimer");
		return;
	}
	
	const confirmBtn = document.getElementById('confirmDeleteBtn');
	const spinner = confirmBtn?.querySelector('.spinner-border');
	
	try {
		// Désactiver le bouton et afficher le spinner
		if (confirmBtn) {
			confirmBtn.disabled = true;
			if (spinner) spinner.classList.remove('d-none');
		}
		
		// Effectuer la suppression via l'API
		const success = await deleteCar(carToDelete);
		
		if (success) {
			// Supprimer la carte de l'interface
			const card = deleteButtonElement.closest('.card');
			if (card) {
				// Animation de fade out avant suppression
				card.style.transition = 'opacity 0.3s ease-out';
				card.style.opacity = '0';
				setTimeout(() => {
					card.remove();
					
					// Vérifier s'il reste des voitures
					const container = document.querySelector('.card-cont');
					if (container && container.children.length === 0) {
						// Afficher un message si plus aucune voiture
						container.innerHTML = `
							<div class="alert alert-info w-100" role="alert">
								<h4 class="alert-heading">Aucune voiture disponible</h4>
								<p class="mb-0">Aucune voiture n'est actuellement disponible dans le catalogue.</p>
							</div>
						`;
					}
				}, 300);
			}
			
			// Fermer le modal
			const modal = bootstrap.Modal.getInstance(document.getElementById('confirmDeleteModal'));
			if (modal) modal.hide();
			
			// Afficher un message de succès (optionnel, via toast ou notification)
			console.log("✅ Voiture supprimée avec succès");
		}
	} catch (error) {
		console.error('Erreur lors de la suppression:', error);
		
		// Réactiver le bouton
		if (confirmBtn) {
			confirmBtn.disabled = false;
			if (spinner) spinner.classList.add('d-none');
		}
		
		// Afficher l'erreur dans le modal
		const modalBody = document.querySelector('#confirmDeleteModal .modal-body');
		if (modalBody) {
			let errorAlert = modalBody.querySelector('.alert-danger');
			if (!errorAlert) {
				errorAlert = document.createElement('div');
				errorAlert.className = 'alert alert-danger mt-3';
				modalBody.appendChild(errorAlert);
			}
			errorAlert.textContent = `Erreur : ${error.message}`;
		}
	} finally {
		// Réinitialiser les variables
		carToDelete = null;
		deleteButtonElement = null;
	}
}

// ============================================
// INITIALISATION
// ============================================

// Charger les voitures au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
	loadCars();

	// Utiliser la délégation d'événements pour capturer la soumission du formulaire
	// Cela fonctionne même si le formulaire est dans un modal chargé dynamiquement
	document.addEventListener('submit', function(e) {
		const form = e.target;
		if (form && form.id === 'addCarForm') {
			console.log("✓ Événement submit intercepté pour le formulaire #addCarForm");
			e.preventDefault();
			e.stopPropagation();
			handleFormSubmit(e);
		}
	}, true); // Utiliser capture phase pour intercepter avant Bootstrap

	// Attacher l'événement directement aussi (au cas où)
	const form = document.getElementById('addCarForm');
	if (form) {
		console.log("✓ Formulaire trouvé au chargement, attachement direct de l'événement");
		form.addEventListener('submit', function(e) {
			e.preventDefault();
			e.stopPropagation();
			handleFormSubmit(e);
		});
	}

	// Attacher l'événement quand le modal est montré (Bootstrap event)
	const modalElement = document.getElementById('exampleModal');
	if (modalElement) {
		// Réinitialiser le formulaire quand le modal est fermé
		modalElement.addEventListener('hidden.bs.modal', resetForm);
		
		// S'assurer que l'événement est attaché quand le modal s'ouvre
		modalElement.addEventListener('shown.bs.modal', function() {
			const form = document.getElementById('addCarForm');
			if (form) {
				console.log("✓ Formulaire trouvé lors de l'ouverture du modal");
				// L'événement est déjà attaché via la délégation, mais on peut ajouter une protection
				if (!form.hasAttribute('data-event-attached')) {
					form.setAttribute('data-event-attached', 'true');
					form.addEventListener('submit', function(e) {
						e.preventDefault();
						e.stopPropagation();
						handleFormSubmit(e);
					});
				}
			}
		});
	}

	// ============================================
	// EVENT DELEGATION POUR LA SUPPRESSION
	// ============================================
	
	// Utiliser la délégation d'événements pour gérer les clics sur les boutons de suppression
	// Cela fonctionne même pour les cartes créées dynamiquement
	const cardContainer = document.querySelector('.card-cont');
	if (cardContainer) {
		cardContainer.addEventListener('click', function(e) {
			// Vérifier si le clic est sur un bouton de suppression
			const deleteBtn = e.target.closest('button[data-car-id]');
			if (deleteBtn) {
				e.preventDefault();
				e.stopPropagation();
				const carId = deleteBtn.getAttribute('data-car-id');
				console.log('🗑️ Demande de suppression pour la voiture ID:', carId);
				handleDeleteRequest(carId, deleteBtn);
			}
		});
		console.log('✅ Event delegation configurée pour les boutons de suppression');
	}

	// ============================================
	// BOUTON DE CONFIRMATION DU MODAL
	// ============================================
	
	// Attacher l'événement sur le bouton de confirmation du modal
	const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
	if (confirmDeleteBtn) {
		confirmDeleteBtn.addEventListener('click', confirmDelete);
		console.log('✅ Bouton de confirmation de suppression configuré');
	}

	// Réinitialiser les variables quand le modal de suppression est fermé
	const confirmDeleteModal = document.getElementById('confirmDeleteModal');
	if (confirmDeleteModal) {
		confirmDeleteModal.addEventListener('hidden.bs.modal', function() {
			// Réinitialiser les variables
			carToDelete = null;
			deleteButtonElement = null;
			
			// Supprimer les messages d'erreur
			const errorAlert = this.querySelector('.alert-danger');
			if (errorAlert) {
				errorAlert.remove();
			}
			
			// Réactiver le bouton de confirmation
			const confirmBtn = document.getElementById('confirmDeleteBtn');
			if (confirmBtn) {
				confirmBtn.disabled = false;
				const spinner = confirmBtn.querySelector('.spinner-border');
				if (spinner) spinner.classList.add('d-none');
			}
		});
	}
});
