/**
 * Module de gestion des thèmes visuels
 */
import { getStoredData, storeData, EVENTS, STORAGE_KEYS, emitEvent } from './utils.js';

// Thèmes disponibles
const AVAILABLE_THEMES = ['morning', 'day', 'sunset', 'night'];
const DEFAULT_THEME = 'day';

/**
 * État actuel du thème
 */
let currentTheme = getStoredData(STORAGE_KEYS.THEME, DEFAULT_THEME);

/**
 * Obtient le thème actuel
 * @returns {string} Nom du thème actuel
 */
export const getCurrentTheme = () => currentTheme;

/**
 * Change le thème courant
 * @param {string} theme - Nom du thème
 */
export const setTheme = (theme) => {
  if (!AVAILABLE_THEMES.includes(theme)) {
    console.error(`Thème non supporté: ${theme}`);
    return;
  }
  
  // Mettre à jour le thème dans le DOM
  document.body.classList.remove(...AVAILABLE_THEMES.map(t => `theme-${t}`));
  document.body.classList.add(`theme-${theme}`);
  
  // Mettre à jour l'état
  currentTheme = theme;
  // La sauvegarde du thème est intentionnellement retirée
  // storeData(STORAGE_KEYS.THEME, theme);
  
  // Mettre à jour les boutons de thème
  document.querySelectorAll('.btn-theme').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-theme') === theme);
  });
  
  // Émettre un événement pour informer les autres modules
  emitEvent(EVENTS.THEME_CHANGED, theme);
};

/**
 * Détermine le thème en fonction de l'heure actuelle
 * @returns {string} Le nom du thème approprié
 */
const getThemeForCurrentHour = () => {
  const currentHour = new Date().getHours();
  if (currentHour >= 5 && currentHour < 11) return 'morning'; // 5h à 10h59
  if (currentHour >= 11 && currentHour < 17) return 'day'; // 11h à 16h59
  if (currentHour >= 17 && currentHour < 21) return 'sunset'; // 17h à 20h59
  return 'night'; // 21h à 4h59
};

/**
 * Initialise le module de thème
 */
export const initTheme = () => {
  // Appliquer le thème en fonction de l'heure, à chaque chargement
  const themeFromTime = getThemeForCurrentHour();
  setTheme(themeFromTime);
  
  // Ajouter les écouteurs d'événements sur les boutons de thème
  document.querySelectorAll('.btn-theme').forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.getAttribute('data-theme');
      setTheme(theme);
    });
  });
};

export default {
  initTheme,
  getCurrentTheme,
  setTheme
};



