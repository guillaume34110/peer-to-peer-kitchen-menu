/**
 * Module de gestion des langues (i18n)
 */
import { getStoredData, storeData, EVENTS, STORAGE_KEYS, emitEvent } from './utils.js';

// Langues disponibles
const AVAILABLE_LANGUAGES = ['fr', 'th'];
const DEFAULT_LANGUAGE = 'fr';

// Traductions
const translations = {
  fr: {
    'app.title': 'Menu Restaurant',
    'app.categories': 'Catégories',
    'app.loading': 'Chargement du menu...',
    'app.footer': '© 2023 Restaurant - Menu en temps réel',
    'category.all': 'Tous',
    'connection.connected': 'Connecté',
    'connection.connecting': 'Connexion...',
    'connection.disconnected': 'Déconnecté',
    'dish.quantity.infinite': 'Disponible',
    'dish.quantity.available': 'Disponible: {amount}',
    'dish.quantity.low': 'Reste: {amount}',
    'dish.quantity.out': 'Épuisé',
    'dish.ingredients': 'Ingrédients: ',
    'dish.supplements': 'Suppléments:',
    'dish.supplement.price': '+{price}'
  },
  th: {
    'app.title': 'เมนูร้านอาหาร',
    'app.categories': 'หมวดหมู่',
    'app.loading': 'กำลังโหลดเมนู...',
    'app.footer': '© 2023 ร้านอาหาร - เมนูเรียลไทม์',
    'category.all': 'ทั้งหมด',
    'connection.connected': 'เชื่อมต่อแล้ว',
    'connection.connecting': 'กำลังเชื่อมต่อ...',
    'connection.disconnected': 'ขาดการเชื่อมต่อ',
    'dish.quantity.infinite': 'มีพร้อมเสิร์ฟ',
    'dish.quantity.available': 'มีพร้อมเสิร์ฟ: {amount}',
    'dish.quantity.low': 'เหลือ: {amount}',
    'dish.quantity.out': 'หมด',
    'dish.ingredients': 'ส่วนผสม: ',
    'dish.supplements': 'เพิ่มเติม:',
    'dish.supplement.price': '+{price}'
  }
};

/**
 * État actuel de la langue
 */
let currentLanguage = getStoredData(STORAGE_KEYS.LANGUAGE, DEFAULT_LANGUAGE);

/**
 * Obtient la langue actuelle
 * @returns {string} Code de la langue actuelle
 */
export const getCurrentLanguage = () => currentLanguage;

/**
 * Change la langue courante
 * @param {string} lang - Code de la langue
 */
export const setLanguage = (lang) => {
  if (!AVAILABLE_LANGUAGES.includes(lang)) {
    console.error(`Langue non supportée: ${lang}`);
    return;
  }
  
  currentLanguage = lang;
  storeData(STORAGE_KEYS.LANGUAGE, lang);
  updateDOMTranslations();
  
  // Mettre à jour la valeur du sélecteur
  const select = document.getElementById('language-select');
  if (select) {
    select.value = lang;
  }
  
  // Émettre un événement pour informer les autres modules
  emitEvent(EVENTS.LANGUAGE_CHANGED, lang);
};

/**
 * Traduit une clé dans la langue courante
 * @param {string} key - Clé de traduction
 * @param {Object} params - Paramètres à remplacer dans la traduction
 * @returns {string} Texte traduit
 */
export const translate = (key, params = {}) => {
  const langData = translations[currentLanguage] || translations[DEFAULT_LANGUAGE];
  let text = langData[key] || key;
  
  // Remplacer les paramètres {param} dans le texte
  Object.entries(params).forEach(([param, value]) => {
    text = text.replace(new RegExp(`{${param}}`, 'g'), value);
  });
  
  return text;
};

/**
 * Met à jour toutes les traductions dans le DOM
 */
const updateDOMTranslations = () => {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    element.textContent = translate(key);
  });
};

/**
 * Initialise le module i18n
 */
export const initI18n = () => {
  const select = document.getElementById('language-select');

  // Appliquer les traductions initiales et définir la valeur du sélecteur
  setLanguage(currentLanguage);

  // Ajouter l'écouteur d'événements sur le sélecteur
  if (select) {
    select.addEventListener('change', (e) => {
      setLanguage(e.target.value);
    });
  }
};

export default {
  initI18n,
  translate,
  getCurrentLanguage,
  setLanguage
};



