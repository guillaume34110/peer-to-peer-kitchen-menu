/**
 * Module de gestion de l'affichage et du filtrage du menu
 */
import { EVENTS, onEvent, createElement, formatPrice, emitEvent } from './utils.js';
import { translate, getCurrentLanguage } from './i18n.js';

// État du menu
let menuData = [];
let currentCategory = 'all';
let isLoading = true;

/**
 * Filtre les plats selon la catégorie sélectionnée
 */
const filterDishesByCategory = (dishes, category) => {
  if (category === 'all') return dishes;
  return dishes.filter(dish => dish.category && dish.category.id === category);
};

/**
 * Extrait les catégories uniques du menu
 */
const extractCategories = (dishes) => {
  const categories = new Map();
  dishes.forEach(dish => {
    if (dish.category && dish.category.id && !categories.has(dish.category.id)) {
      categories.set(dish.category.id, dish.category);
    }
  });
  return Array.from(categories.values());
};

/**
 * Crée les boutons de catégorie dans l'UI
 */
const createCategoryButtons = (categories) => {
  const container = document.querySelector('.category-buttons');
  if (!container) return;
  const allButton = container.querySelector('[data-category="all"]');
  container.innerHTML = '';
  if (allButton) container.appendChild(allButton);

  const currentLang = getCurrentLanguage();
  categories.forEach(category => {
    const button = createElement('button', {
      'class': 'btn-category',
      'data-category': category.id
    }, category.name[currentLang] || category.name.fr || category.id);
    button.addEventListener('click', () => selectCategory(category.id));
    container.appendChild(button);
  });
};

/**
 * Sélectionne une catégorie et met à jour l'UI
 */
const selectCategory = (categoryId) => {
  currentCategory = categoryId;
  document.querySelectorAll('.btn-category').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-category') === categoryId);
  });
  renderDishes();
  emitEvent(EVENTS.CATEGORY_SELECTED, categoryId);
};

/**
 * Crée une carte de plat
 */
const createDishCard = (dish) => {
  const template = document.getElementById('dish-template');
  if (!template) return null;
  const card = document.importNode(template.content, true).querySelector('.dish-card');
  const currentLang = getCurrentLanguage();

  // Image, Nom, Prix, etc.
  card.querySelector('img').src = dish.image.startsWith('data:') ? dish.image : `data:image/jpeg;base64,${dish.image}`;
  card.querySelector('img').alt = dish.name[currentLang] || dish.name.fr || '';
  card.querySelector('.dish-name').textContent = dish.name[currentLang] || dish.name.fr || '';
  card.querySelector('.dish-price').textContent = formatPrice(dish.price);

  // Quantité
  const quantityElement = card.querySelector('.dish-quantity');
  if (dish.quantity) {
    if (dish.quantity.infinite) {
      quantityElement.textContent = translate('dish.quantity.infinite');
    } else {
      const amount = dish.quantity.amount;
      if (amount <= 0) {
        quantityElement.textContent = translate('dish.quantity.out');
        quantityElement.classList.add('out');
        card.classList.add('out-of-stock');
      } else if (amount <= 5) {
        quantityElement.textContent = translate('dish.quantity.low', { amount });
        quantityElement.classList.add('low');
      } else {
        quantityElement.textContent = translate('dish.quantity.available', { amount });
      }
    }
  } else {
    quantityElement.style.display = 'none';
  }

  // Ingrédients (collapsible)
  const ingredientsElement = card.querySelector('.dish-ingredients');
  if (ingredientsElement && dish.ingredients && dish.ingredients.length > 0) {
    ingredientsElement.innerHTML = '';
    const labelElement = createElement('div', { class: 'ingredients-label' }, [
      createElement('span', {}, translate('dish.ingredients')),
      createElement('span', { class: 'toggle-icon' }, '▶')
    ]);
    const tagsContainer = createElement('div', { class: 'tags-container' });
    dish.ingredients.forEach(ingredient => {
      tagsContainer.appendChild(createElement('span', { class: 'ingredient-tag' }, ingredient));
    });
    ingredientsElement.appendChild(labelElement);
    ingredientsElement.appendChild(tagsContainer);
  } else if (ingredientsElement) {
    ingredientsElement.style.display = 'none';
  }

  // Suppléments
  const supplementsContainer = card.querySelector('.dish-supplements');
  if (supplementsContainer && dish.supplements && dish.supplements.length > 0) {
    supplementsContainer.innerHTML = '';
    const titleElement = createElement('h4', { class: 'supplements-title' }, translate('dish.supplements'));
    const tagsContainer = createElement('div', { class: 'tags-container supplements-tags' });
    dish.supplements.forEach(supplement => {
      const price = formatPrice(supplement.price || dish.supplementPrice || 0);
      const name = supplement.name[currentLang] || supplement.name.fr || '';
      const tagElement = createElement('span', { class: 'supplement-tag' }, [
        createElement('span', { class: 'supplement-name' }, name),
        createElement('span', { class: 'supplement-price' }, translate('dish.supplement.price', { price }))
      ]);
      tagsContainer.appendChild(tagElement);
    });
    supplementsContainer.appendChild(titleElement);
    supplementsContainer.appendChild(tagsContainer);
  } else if (supplementsContainer) {
    supplementsContainer.style.display = 'none';
  }

  // Ajout de l'événement de clic sur la carte entière pour déplier les ingrédients
  if (ingredientsElement) {
    card.addEventListener('click', () => {
      ingredientsElement.classList.toggle('expanded');
    });
  }

  return card;
};

/**
 * Affiche les plats dans l'UI
 */
const renderDishes = () => {
  const container = document.getElementById('dishes-grid');
  if (!container) return;
  container.innerHTML = '';

  if (isLoading) {
    container.appendChild(createElement('div', { 'class': 'loading-indicator' }, [
      createElement('span', { 'data-i18n': 'app.loading' }, translate('app.loading'))
    ]));
    return;
  }

  if (!menuData || menuData.length === 0) {
    container.appendChild(createElement('div', { 'class': 'empty-message' }, 'Aucun plat disponible.'));
    return;
  }

  const filteredDishes = filterDishesByCategory(menuData, currentCategory);
  filteredDishes.forEach(dish => {
    const card = createDishCard(dish);
    if (card) container.appendChild(card);
  });
};

/**
 * Met à jour le menu avec les nouvelles données
 */
const updateMenu = (menu) => {
  if (!menu || !Array.isArray(menu)) {
    console.error('[Menu] Format de menu invalide:', menu);
    return;
  }
  menuData = menu;
  isLoading = false;
  createCategoryButtons(extractCategories(menu));
  renderDishes();
};

/**
 * Initialise le module de menu
 */
export const initMenu = () => {
  renderDishes();
  onEvent(EVENTS.MENU_UPDATED, updateMenu);
  onEvent(EVENTS.LANGUAGE_CHANGED, () => {
    if (menuData.length > 0) {
      createCategoryButtons(extractCategories(menuData));
      renderDishes();
    }
  });
  document.querySelectorAll('.btn-category').forEach(btn => {
    btn.addEventListener('click', () => {
      selectCategory(btn.getAttribute('data-category'));
    });
  });
};

// Point d'entrée de l'application
document.addEventListener('DOMContentLoaded', () => {
  import('./i18n.js').then(({ initI18n }) => {
    initI18n();
    import('./theme.js').then(({ initTheme }) => {
      initTheme();
      import('./websocket.js').then(({ initWebSocket }) => {
        initWebSocket();
        initMenu();
      });
    });
  });
});

export default {
  initMenu,
  updateMenu
};