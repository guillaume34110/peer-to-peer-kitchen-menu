/**
 * Module de gestion de la connexion WebSocket
 */
import { EVENTS, emitEvent } from './utils.js';

// Configuration WebSocket
const WS_URLS = {
  LOCAL: 'ws://guillaume.local:3000',
  PROD: 'wss://your-production-websocket-server.com' // À remplacer par l'URL WebSocket de production
};

// Déterminer l'URL WebSocket en fonction de l'environnement
const getWebSocketUrl = () => {
  // Si nous sommes sur GitHub Pages (ou en production)
  if (window.location.hostname.includes('github.io') || window.location.hostname === 'localhost') {
    return WS_URLS.PROD;
  }
  // Sinon, utiliser l'URL locale
  return WS_URLS.LOCAL;
};

const DEFAULT_WS_URL = getWebSocketUrl();
const RECONNECT_INTERVAL = 5000; // 5 secondes
const MAX_RECONNECT_ATTEMPTS = 10;

// États de connexion
const CONNECTION_STATES = {
  CONNECTED: 'connected',
  CONNECTING: 'connecting',
  DISCONNECTED: 'disconnected'
};

// État actuel
let socket = null;
let reconnectAttempts = 0;
let reconnectTimeout = null;
let connectionState = CONNECTION_STATES.DISCONNECTED;

/**
 * Met à jour l'état de connexion dans l'UI
 * @param {string} state - État de connexion
 */
const updateConnectionStatus = (state) => {
  connectionState = state;
  
  // Mettre à jour l'indicateur de statut dans l'UI
  const statusElement = document.querySelector('.connection-status');
  if (statusElement) {
    statusElement.setAttribute('data-status', state);
    
    // Mettre à jour l'icône selon l'état
    const iconElement = statusElement.querySelector('.status-icon');
    if (iconElement) {
      switch (state) {
        case CONNECTION_STATES.CONNECTED:
          iconElement.textContent = '🟢';
          break;
        case CONNECTION_STATES.CONNECTING:
          iconElement.textContent = '🟠';
          break;
        case CONNECTION_STATES.DISCONNECTED:
          iconElement.textContent = '🔴';
          break;
      }
    }
    
    // Mettre à jour le texte selon l'état
    const textElement = statusElement.querySelector('.status-text');
    if (textElement) {
      const key = `connection.${state}`;
      textElement.setAttribute('data-i18n', key);
      // La traduction sera appliquée par le module i18n
    }
  }
  
  // Émettre un événement pour informer les autres modules
  emitEvent(EVENTS.CONNECTION_STATUS_CHANGED, state);
};

/**
 * Gère les messages reçus du WebSocket
 * @param {MessageEvent} event - Événement de message WebSocket
 */
const handleMessage = (event) => {
  console.log('[WebSocket] ====== DÉBUT TRAITEMENT MESSAGE ======');
  console.log('[WebSocket] Message brut reçu:', event.data);
  
  try {
    console.log('[WebSocket] Message reçu (début):', event.data.substring(0, 100) + (event.data.length > 100 ? '...' : ''));
    console.log('[WebSocket] Taille du message:', event.data.length, 'caractères');
    
    const data = JSON.parse(event.data);
    console.log('[WebSocket] Structure du message:', Object.keys(data).join(', '));
    console.log('[WebSocket] Type de message:', data.type || 'non spécifié');
    
    // Format détecté automatiquement
    console.log('[WebSocket] Structure du message reçu:', JSON.stringify(Object.keys(data)));
    
    // Traiter le message selon son format
    if (data.type === 'menuUpdate' && data.menu) {
      // Format 1: {type: 'menuUpdate', menu: [...]}
      console.log('[WebSocket] Format détecté: type=menuUpdate');
      console.log('[WebSocket] Menu reçu:', data.menu ? `${data.menu.length} plats` : 'Menu vide ou invalide');
      if (data.menu && data.menu.length > 0) {
        console.log('[WebSocket] Premier plat complet:', JSON.stringify(data.menu[0], null, 2));
        if (data.menu[0].ingredients) {
          console.log('[WebSocket] Ingrédients du premier plat:', JSON.stringify(data.menu[0].ingredients, null, 2));
        }
      }
      
      console.log(`[WebSocket] Émission de l'événement ${EVENTS.MENU_UPDATED} avec ${data.menu?.length || 0} plats`);
      emitEvent(EVENTS.MENU_UPDATED, data.menu);
    } 
    else if (data.menu && Array.isArray(data.menu)) {
      // Format 2: {menu: [...]}
      console.log('[WebSocket] Format détecté: {menu: [...]}');
      console.log('[WebSocket] Menu reçu:', `${data.menu.length} plats`);
      if (data.menu.length > 0) {
        console.log('[WebSocket] Premier plat complet:', JSON.stringify(data.menu[0], null, 2));
        if (data.menu[0].ingredients) {
          console.log('[WebSocket] Ingrédients du premier plat:', JSON.stringify(data.menu[0].ingredients, null, 2));
        }
      }
      
      console.log(`[WebSocket] Émission de l'événement ${EVENTS.MENU_UPDATED} avec ${data.menu.length} plats`);
      emitEvent(EVENTS.MENU_UPDATED, data.menu);
    }
    else if (data.type === 'menuUpdate' && data.payload) {
      // Format 3: {type: 'menuUpdate', payload: [...]}
      console.log('[WebSocket] Format détecté: type=menuUpdate avec payload');
      console.log('[WebSocket] Menu reçu via payload:', data.payload ? `${data.payload.length} plats` : 'Payload vide ou invalide');
      if (data.payload && data.payload.length > 0) {
        console.log('[WebSocket] Premier plat complet via payload:', JSON.stringify(data.payload[0], null, 2));
        if (data.payload[0].ingredients) {
          console.log('[WebSocket] Ingrédients du premier plat via payload:', JSON.stringify(data.payload[0].ingredients, null, 2));
        }
      }
      
      console.log(`[WebSocket] Émission de l'événement ${EVENTS.MENU_UPDATED} avec ${data.payload?.length || 0} plats`);
      emitEvent(EVENTS.MENU_UPDATED, data.payload);
    }
    else if (data.ingredients && Array.isArray(data.ingredients)) {
      // Format: {ingredients: [...]}
      console.log('[WebSocket] Format détecté: {ingredients: [...]}');
      console.log('[WebSocket] Ingrédients reçus:', `${data.ingredients.length} ingrédients`);
      console.log('[WebSocket] Ingrédients complets:', JSON.stringify(data.ingredients, null, 2));
      
      console.log(`[WebSocket] Émission de l'événement ${EVENTS.INGREDIENTS_UPDATED} avec ${data.ingredients.length} ingrédients`);
      emitEvent(EVENTS.INGREDIENTS_UPDATED, data.ingredients);
    }
    else {
      // Message non reconnu
      console.log('[WebSocket] Message non reconnu comme menu ou ingrédients:', JSON.stringify(data, null, 2));
    }
    
    console.log('[WebSocket] ====== FIN TRAITEMENT MESSAGE ======');
  } catch (error) {
    console.error('[WebSocket] Erreur de traitement du message:', error);
    console.error('[WebSocket] Message d\'erreur:', error.message);
    console.error('[WebSocket] Stack trace:', error.stack);
    console.error('[WebSocket] Données reçues (début):', 
      event.data ? event.data.substring(0, 200) + (event.data.length > 200 ? '...' : '') : 'Aucune donnée');
    console.error('[WebSocket] ====== FIN AVEC ERREUR ======');
  }
};

/**
 * Tente de se reconnecter au serveur WebSocket
 */
const attemptReconnect = () => {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error('Nombre maximum de tentatives de reconnexion atteint.');
    updateConnectionStatus(CONNECTION_STATES.DISCONNECTED);
    return;
  }
  
  reconnectAttempts++;
  updateConnectionStatus(CONNECTION_STATES.CONNECTING);
  console.log(`Tentative de reconnexion (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
  
  // Tenter de créer une nouvelle connexion
  connectToWebSocket();
};

/**
 * Se connecte au serveur WebSocket
 */
export const connectToWebSocket = (url = DEFAULT_WS_URL) => {
  // Nettoyer toute connexion existante
  if (socket) {
    socket.close();
  }
  
  // Nettoyer tout timeout de reconnexion
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
  
  try {
    updateConnectionStatus(CONNECTION_STATES.CONNECTING);
    
    // Créer une nouvelle connexion WebSocket
    socket = new WebSocket(url);
    
    // Événement d'ouverture de connexion
    socket.addEventListener('open', () => {
      console.log('[WebSocket] Connexion WebSocket établie');
      reconnectAttempts = 0;
      updateConnectionStatus(CONNECTION_STATES.CONNECTED);
      
      // Envoyer une demande de menu au serveur
      try {
        console.log('[WebSocket] Envoi d\'une demande de menu');
        
        // Format 1: { type: 'requestMenu' }
        console.log('[WebSocket] Essai format 1: { type: "requestMenu" }');
        socket.send(JSON.stringify({ type: 'requestMenu' }));
        
        // Attendre un peu et envoyer une deuxième demande dans un autre format si nécessaire
        setTimeout(() => {
          // Format 2: { action: 'getMenu' }
          console.log('[WebSocket] Essai format 2: { action: "getMenu" }');
          socket.send(JSON.stringify({ action: 'getMenu', timestamp: Date.now() }));
        }, 1000);
        
      } catch (error) {
        console.error('[WebSocket] Erreur lors de l\'envoi de la demande:', error);
      }
      
      // Ajouter un log après quelques secondes pour vérifier si des messages ont été reçus
      setTimeout(() => {
        if (connectionState === CONNECTION_STATES.CONNECTED) {
          console.log('[WebSocket] État après 5 secondes de connexion:');
          console.log('[WebSocket] - État de connexion:', connectionState);
          console.log('[WebSocket] - Socket readyState:', socket ? socket.readyState : 'Socket non défini');
          console.log('[WebSocket] - Si aucun message n\'a été reçu, vérifiez que le serveur:');
          console.log('[WebSocket] - 1. Accepte bien les connexions à l\'URL', DEFAULT_WS_URL);
          console.log('[WebSocket] - 2. Envoie des messages de type "menuUpdate" avec une propriété "menu"');
          console.log('[WebSocket] - 3. Répond bien aux messages de type "requestMenu"');
        }
      }, 5000);
    });
    
    // Événement de message
    socket.addEventListener('message', handleMessage);
    
    // Événement d'erreur
    socket.addEventListener('error', (error) => {
      console.error('[WebSocket] ====== ERREUR DE CONNEXION ======');
      console.error('[WebSocket] Erreur WebSocket:', error);
      console.error('[WebSocket] URL de connexion:', url);
      console.error('[WebSocket] État actuel:', connectionState);
      console.error('[WebSocket] readyState:', socket ? socket.readyState : 'Socket non défini');
      console.error('[WebSocket] Vérifiez que le serveur est bien en cours d\'exécution à cette adresse');
      console.error('[WebSocket] ====== FIN ERREUR DE CONNEXION ======');
    });
    
    // Événement de fermeture
    socket.addEventListener('close', (event) => {
      console.log('[WebSocket] ====== FERMETURE DE CONNEXION ======');
      console.log(`[WebSocket] Connexion WebSocket fermée. Code: ${event.code}, Raison: ${event.reason || 'Non spécifiée'}`);
      
      // Informations sur les codes d'erreur communs
      if (event.code === 1000) {
        console.log('[WebSocket] Fermeture normale de la connexion');
      } else if (event.code === 1001) {
        console.log('[WebSocket] Le point de terminaison est "en train de partir" (navigateur fermé, etc.)');
      } else if (event.code === 1002) {
        console.log('[WebSocket] Erreur de protocole');
      } else if (event.code === 1003) {
        console.log('[WebSocket] Type de données non accepté');
      } else if (event.code === 1005) {
        console.log('[WebSocket] Aucun code d\'état reçu');
      } else if (event.code === 1006) {
        console.log('[WebSocket] Connexion fermée anormalement - Vérifiez que le serveur WebSocket est en cours d\'exécution');
      } else if (event.code === 1007) {
        console.log('[WebSocket] Message invalide (non-UTF8)');
      } else if (event.code === 1008) {
        console.log('[WebSocket] Violation de politique');
      } else if (event.code === 1009) {
        console.log('[WebSocket] Message trop grand');
      } else if (event.code === 1011) {
        console.log('[WebSocket] Erreur interne du serveur');
      } else if (event.code === 1015) {
        console.log('[WebSocket] Échec TLS');
      }
      
      updateConnectionStatus(CONNECTION_STATES.DISCONNECTED);
      console.log(`[WebSocket] Reconnexion prévue dans ${RECONNECT_INTERVAL/1000} secondes`);
      console.log('[WebSocket] ====== FIN FERMETURE DE CONNEXION ======');
      
      // Tenter de se reconnecter automatiquement
      reconnectTimeout = setTimeout(attemptReconnect, RECONNECT_INTERVAL);
    });
  } catch (error) {
    console.error('Erreur lors de la création de la connexion WebSocket:', error);
    updateConnectionStatus(CONNECTION_STATES.DISCONNECTED);
    
    // Tenter de se reconnecter
    reconnectTimeout = setTimeout(attemptReconnect, RECONNECT_INTERVAL);
  }
};

/**
 * Demande les ingrédients au serveur WebSocket
 */
export const requestIngredients = () => {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.error('[WebSocket] Impossible de demander les ingrédients: WebSocket non connecté');
    return false;
  }
  
  try {
    const message = {
      action: 'getIngredients',
      timestamp: Date.now()
    };
    socket.send(JSON.stringify(message));
    console.log('[WebSocket] Demande d\'ingrédients envoyée');
    return true;
  } catch (error) {
    console.error('[WebSocket] Erreur lors de l\'envoi de la demande d\'ingrédients:', error);
    return false;
  }
};

/**
 * Initialise le module WebSocket
 */
export const initWebSocket = (url = DEFAULT_WS_URL) => {
  console.log('[WebSocket] Initialisation du module WebSocket');
  console.log(`[WebSocket] Adresse du serveur: ${url}`);
  
  // Démarrer avec l'état déconnecté
  updateConnectionStatus(CONNECTION_STATES.DISCONNECTED);
  
  // Établir la connexion initiale
  console.log('[WebSocket] Tentative de connexion initiale...');
  connectToWebSocket(url);
  
  // Gérer la reconnexion automatique lorsque la page devient visible
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && connectionState === CONNECTION_STATES.DISCONNECTED) {
      connectToWebSocket(url);
    }
  });
};

export default {
  initWebSocket,
  connectToWebSocket,
  requestIngredients
};

