import axios from 'axios';

// Base URL de l'API Spring Boot. Modifiable via une variable d'env Vite
// (VITE_API_BASE_URL) si le backend ne tourne pas sur localhost:8080.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Injecte le token JWT (stocké en mémoire/sessionStorage côté AuthContext)
// dans chaque requête sortante.
let currentToken = null;
export function setApiToken(token) {
  currentToken = token;
}

api.interceptors.request.use((config) => {
  if (currentToken) {
    config.headers.Authorization = `Bearer ${currentToken}`;
  }
  return config;
});

// Callback déclenché en cas de 401 (token expiré/invalide) -> déconnexion.
let onUnauthorized = null;
export function setOnUnauthorized(callback) {
  onUnauthorized = callback;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && onUnauthorized) {
      onUnauthorized();
    }
    return Promise.reject(error);
  }
);

// Extrait un message d'erreur lisible depuis une réponse d'erreur Axios,
// quel que soit le format renvoyé par GlobalExceptionHandler.
export function extractErrorMessage(error, fallback = 'Une erreur est survenue.') {
  const data = error?.response?.data;
  if (!data) return error?.message || fallback;
  if (typeof data === 'string') return data;
  if (data.message) return data.message;
  if (data.error) return data.error;
  if (Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors.map((e) => e.defaultMessage || e.message || e).join(' • ');
  }
  return fallback;
}
