/**
 * Module de gestion des langues (i18n)
 */
import { getStoredData, storeData, EVENTS, STORAGE_KEYS, emitEvent } from './utils.js';

// Langues disponibles
const AVAILABLE_LANGUAGES = ['fr', 'en', 'de', 'ru', 'zh', 'ko', 'ja', 'es', 'it', 'nl', 'pt', 'th'];
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
  en: {
    'app.title': 'Restaurant Menu',
    'app.categories': 'Categories',
    'app.loading': 'Loading menu...',
    'app.footer': '© 2023 Restaurant - Real-time menu',
    'category.all': 'All',
    'connection.connected': 'Connected',
    'connection.connecting': 'Connecting...',
    'connection.disconnected': 'Disconnected',
    'dish.quantity.infinite': 'Available',
    'dish.quantity.available': 'Available: {amount}',
    'dish.quantity.low': 'Remaining: {amount}',
    'dish.quantity.out': 'Sold out',
    'dish.ingredients': 'Ingredients: ',
    'dish.supplements': 'Add-ons:',
    'dish.supplement.price': '+{price}'
  },
  de: {
    'app.title': 'Restaurantmenü',
    'app.categories': 'Kategorien',
    'app.loading': 'Menü wird geladen...',
    'app.footer': '© 2023 Restaurant - Echtzeitmenü',
    'category.all': 'Alle',
    'connection.connected': 'Verbunden',
    'connection.connecting': 'Verbindung wird hergestellt...',
    'connection.disconnected': 'Verbindung getrennt',
    'dish.quantity.infinite': 'Verfügbar',
    'dish.quantity.available': 'Verfügbar: {amount}',
    'dish.quantity.low': 'Verbleibend: {amount}',
    'dish.quantity.out': 'Ausverkauft',
    'dish.ingredients': 'Zutaten: ',
    'dish.supplements': 'Extras:',
    'dish.supplement.price': '+{price}'
  },
  ru: {
    'app.title': 'Меню ресторана',
    'app.categories': 'Категории',
    'app.loading': 'Загрузка меню...',
    'app.footer': '© 2023 Ресторан - меню в реальном времени',
    'category.all': 'Все',
    'connection.connected': 'Подключено',
    'connection.connecting': 'Подключение...',
    'connection.disconnected': 'Отключено',
    'dish.quantity.infinite': 'В наличии',
    'dish.quantity.available': 'В наличии: {amount}',
    'dish.quantity.low': 'Осталось: {amount}',
    'dish.quantity.out': 'Нет в наличии',
    'dish.ingredients': 'Ингредиенты: ',
    'dish.supplements': 'Дополнения:',
    'dish.supplement.price': '+{price}'
  },
  zh: {
    'app.title': '餐厅菜单',
    'app.categories': '分类',
    'app.loading': '正在加载菜单...',
    'app.footer': '© 2023 餐厅 - 实时菜单',
    'category.all': '全部',
    'connection.connected': '已连接',
    'connection.connecting': '连接中...',
    'connection.disconnected': '已断开',
    'dish.quantity.infinite': '供应中',
    'dish.quantity.available': '供应中: {amount}',
    'dish.quantity.low': '剩余: {amount}',
    'dish.quantity.out': '售罄',
    'dish.ingredients': '配料: ',
    'dish.supplements': '加料:',
    'dish.supplement.price': '+{price}'
  },
  ko: {
    'app.title': '레스토랑 메뉴',
    'app.categories': '카테고리',
    'app.loading': '메뉴 불러오는 중...',
    'app.footer': '© 2023 레스토랑 - 실시간 메뉴',
    'category.all': '전체',
    'connection.connected': '연결됨',
    'connection.connecting': '연결 중...',
    'connection.disconnected': '연결 끊김',
    'dish.quantity.infinite': '이용 가능',
    'dish.quantity.available': '이용 가능: {amount}',
    'dish.quantity.low': '남음: {amount}',
    'dish.quantity.out': '품절',
    'dish.ingredients': '재료: ',
    'dish.supplements': '추가 옵션:',
    'dish.supplement.price': '+{price}'
  },
  ja: {
    'app.title': 'レストランメニュー',
    'app.categories': 'カテゴリ',
    'app.loading': 'メニューを読み込み中...',
    'app.footer': '© 2023 レストラン - リアルタイムメニュー',
    'category.all': 'すべて',
    'connection.connected': '接続済み',
    'connection.connecting': '接続中...',
    'connection.disconnected': '切断されました',
    'dish.quantity.infinite': '提供中',
    'dish.quantity.available': '提供中: {amount}',
    'dish.quantity.low': '残り: {amount}',
    'dish.quantity.out': '売り切れ',
    'dish.ingredients': '原材料: ',
    'dish.supplements': '追加:',
    'dish.supplement.price': '+{price}'
  },
  es: {
    'app.title': 'Menú del restaurante',
    'app.categories': 'Categorías',
    'app.loading': 'Cargando el menú...',
    'app.footer': '© 2023 Restaurante - Menú en tiempo real',
    'category.all': 'Todos',
    'connection.connected': 'Conectado',
    'connection.connecting': 'Conectando...',
    'connection.disconnected': 'Desconectado',
    'dish.quantity.infinite': 'Disponible',
    'dish.quantity.available': 'Disponible: {amount}',
    'dish.quantity.low': 'Quedan: {amount}',
    'dish.quantity.out': 'Agotado',
    'dish.ingredients': 'Ingredientes: ',
    'dish.supplements': 'Suplementos:',
    'dish.supplement.price': '+{price}'
  },
  it: {
    'app.title': 'Menu del ristorante',
    'app.categories': 'Categorie',
    'app.loading': 'Caricamento del menu...',
    'app.footer': '© 2023 Ristorante - Menu in tempo reale',
    'category.all': 'Tutti',
    'connection.connected': 'Connesso',
    'connection.connecting': 'Connessione...',
    'connection.disconnected': 'Disconnesso',
    'dish.quantity.infinite': 'Disponibile',
    'dish.quantity.available': 'Disponibile: {amount}',
    'dish.quantity.low': 'Restano: {amount}',
    'dish.quantity.out': 'Esaurito',
    'dish.ingredients': 'Ingredienti: ',
    'dish.supplements': 'Supplementi:',
    'dish.supplement.price': '+{price}'
  },
  nl: {
    'app.title': 'Restaurantmenu',
    'app.categories': 'Categorieën',
    'app.loading': 'Menu wordt geladen...',
    'app.footer': '© 2023 Restaurant - Menu in realtime',
    'category.all': 'Alle',
    'connection.connected': 'Verbonden',
    'connection.connecting': 'Verbinding wordt gemaakt...',
    'connection.disconnected': 'Verbinding verbroken',
    'dish.quantity.infinite': 'Beschikbaar',
    'dish.quantity.available': 'Beschikbaar: {amount}',
    'dish.quantity.low': 'Resterend: {amount}',
    'dish.quantity.out': 'Uitverkocht',
    'dish.ingredients': 'Ingrediënten: ',
    'dish.supplements': 'Extra\'s:',
    'dish.supplement.price': '+{price}'
  },
  pt: {
    'app.title': 'Menu do restaurante',
    'app.categories': 'Categorias',
    'app.loading': 'Carregando o menu...',
    'app.footer': '© 2023 Restaurante - Menu em tempo real',
    'category.all': 'Todos',
    'connection.connected': 'Conectado',
    'connection.connecting': 'Conectando...',
    'connection.disconnected': 'Desconectado',
    'dish.quantity.infinite': 'Disponível',
    'dish.quantity.available': 'Disponível: {amount}',
    'dish.quantity.low': 'Restam: {amount}',
    'dish.quantity.out': 'Esgotado',
    'dish.ingredients': 'Ingredientes: ',
    'dish.supplements': 'Adicionais:',
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


