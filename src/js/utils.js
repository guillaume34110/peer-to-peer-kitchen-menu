/**
 * Module utilitaire contenant des fonctions d'aide réutilisables
 */

/**
 * Crée un élément DOM avec des attributs et du contenu
 * @param {string} tag - Type d'élément à créer
 * @param {Object} attributes - Attributs à ajouter à l'élément
 * @param {string|Node|Array} content - Contenu à ajouter à l'élément
 * @returns {HTMLElement} Élément DOM créé
 */
export const createElement = (tag, attributes = {}, content = null) => {
  const element = document.createElement(tag);
  
  // Ajouter les attributs
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'classList' && Array.isArray(value)) {
      value.forEach(cls => element.classList.add(cls));
    } else {
      element.setAttribute(key, value);
    }
  });
  
  // Ajouter le contenu
  if (content) {
    if (Array.isArray(content)) {
      content.forEach(item => {
        if (typeof item === 'string') {
          element.appendChild(document.createTextNode(item));
        } else if (item instanceof Node) {
          element.appendChild(item);
        }
      });
    } else if (typeof content === 'string') {
      element.textContent = content;
    } else if (content instanceof Node) {
      element.appendChild(content);
    }
  }
  
  return element;
};

/**
 * Formate un prix avec le symbole de devise
 * @param {number} price - Prix à formater
 * @param {string} currency - Symbole de devise
 * @returns {string} Prix formaté
 */
export const formatPrice = (price, currency = '฿') => {
  // Si le prix est un nombre entier (pas de décimales), on l'affiche sans centimes.
  if (Number.isInteger(price) || price % 1 === 0) {
    return `${currency} ${price}`;
  }
  // Sinon, on affiche le prix avec deux décimales.
  return `${currency} ${price.toFixed(2)}`;
};

/**
 * Débounce une fonction pour limiter son exécution
 * @param {Function} func - Fonction à débouncer
 * @param {number} wait - Délai d'attente en ms
 * @returns {Function} Fonction debouncée
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Publie un événement personnalisé
 * @param {string} eventName - Nom de l'événement
 * @param {any} data - Données à transmettre avec l'événement
 */
export const emitEvent = (eventName, data = null) => {
  const event = new CustomEvent(eventName, { detail: data });
  document.dispatchEvent(event);
};

/**
 * S'abonne à un événement personnalisé
 * @param {string} eventName - Nom de l'événement
 * @param {Function} callback - Fonction de rappel
 */
export const onEvent = (eventName, callback) => {
  document.addEventListener(eventName, (event) => callback(event.detail));
};

/**
 * Récupère les données stockées dans le localStorage
 * @param {string} key - Clé de stockage
 * @param {any} defaultValue - Valeur par défaut
 * @returns {any} Données récupérées
 */
export const getStoredData = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Erreur lors de la récupération de ${key}:`, error);
    return defaultValue;
  }
};

/**
 * Stocke des données dans le localStorage
 * @param {string} key - Clé de stockage
 * @param {any} data - Données à stocker
 */
export const storeData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Erreur lors du stockage de ${key}:`, error);
  }
};

// Constantes pour les événements personnalisés
export const EVENTS = {
  MENU_UPDATED: 'menu:updated',
  LANGUAGE_CHANGED: 'language:changed',
  THEME_CHANGED: 'theme:changed',
  CATEGORY_SELECTED: 'category:selected',
  CONNECTION_STATUS_CHANGED: 'connection:status-changed',
  INGREDIENTS_UPDATED: 'ingredients:updated'
};

// Constantes pour les clés de stockage
export const STORAGE_KEYS = {
  LANGUAGE: 'menu-app-language',
  THEME: 'menu-app-theme'
};



