// Configuration de l'API
// Remplacez cette URL par l'URL de votre API
export const API_BASE_URL = 'https://api-rest-tp-devweb.onrender.com';

// Clé API pour l'authentification
export const API_KEY = 'ma-super-cle-api-2024';

// Configuration centralisée
export const API_CONFIG = {
	BASE_URL: API_BASE_URL,
	API_KEY: API_KEY
};

/**
 * Fonction utilitaire pour les requêtes authentifiées avec timeout
 * @param {string} url - URL de l'endpoint
 * @param {object} options - Options de la requête (method, body, etc.)
 * @param {number} timeout - Timeout en millisecondes (défaut: 30000)
 * @returns {Promise<Response>}
 */
export async function fetchWithAuth(url, options = {}, timeout = 30000) {
	const defaultHeaders = {
		'Content-Type': 'application/json',
		'Accept': 'application/json',
		'x-api-key': API_CONFIG.API_KEY
	};

	// Créer un AbortController pour le timeout
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeout);

	try {
		const response = await fetch(url, {
			...options,
			signal: controller.signal,
			headers: {
				...defaultHeaders,
				...options.headers
			}
		});

		clearTimeout(timeoutId);
		return response;
	} catch (error) {
		clearTimeout(timeoutId);
		if (error.name === 'AbortError') {
			throw new Error("Timeout: Le serveur met trop de temps à répondre. Réessayez dans quelques secondes.");
		}
		throw error;
	}
}