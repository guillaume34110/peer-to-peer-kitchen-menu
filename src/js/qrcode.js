/**
 * Module de gestion des QR codes via WebSocket
 */
import { EVENTS, onEvent, emitEvent } from './utils.js';
import { requestQRCodes } from './websocket.js';

// État des QR codes
let qrCodesData = null;
let isModalOpen = false;
let qrRequestTimeout = null;

/**
 * Ouvre la modal des QR codes
 */
const openQRModal = () => {
  const modal = document.getElementById('qr-modal');
  if (modal) {
    modal.classList.add('show');
    isModalOpen = true;
    
    // Afficher les QR codes si déjà disponibles
    if (qrCodesData) {
      displayQRCodes(qrCodesData);
    } else {
      // Afficher un message de chargement
      const menuElement = document.getElementById('qr-menu');
      if (menuElement) {
        menuElement.innerHTML = `
          <div class="qr-loading">Demande des QR codes en cours...</div>
        `;
      }
    }
    
    // Toujours demander les QR codes pour s'assurer qu'ils sont à jour
    requestQRCodes();
    
    // Timeout pour la demande (10 secondes)
    qrRequestTimeout = setTimeout(() => {
      const menuElement = document.getElementById('qr-menu');
      if (menuElement && !qrCodesData) {
        menuElement.innerHTML = `
          <div class="qr-loading">Erreur: Impossible de récupérer le QR code</div>
        `;
      }
    }, 10000);
  }
};

/**
 * Ferme la modal des QR codes
 */
const closeQRModal = () => {
  const modal = document.getElementById('qr-modal');
  if (modal) {
    modal.classList.remove('show');
    isModalOpen = false;
    
    // Annuler le timeout si il y en a un
    if (qrRequestTimeout) {
      clearTimeout(qrRequestTimeout);
      qrRequestTimeout = null;
    }
  }
};

/**
 * Affiche le QR code du menu dans la modal
 */
const displayQRCodes = (qrCodes) => {
  console.log('[QR Code] Affichage du QR code menu:', qrCodes);
  
  // QR Code Menu uniquement
  const menuElement = document.getElementById('qr-menu');
  if (menuElement && qrCodes.menu) {
    if (qrCodes.menu.qrCodeDataURL) {
      menuElement.innerHTML = `
        <img src="${qrCodes.menu.qrCodeDataURL}" alt="QR Code Menu" />
        <div class="qr-url">${qrCodes.menu.url}</div>
      `;
    } else if (qrCodes.menu.qrCode) {
      // Fallback pour l'ancien format
      menuElement.innerHTML = `
        <img src="${qrCodes.menu.qrCode}" alt="QR Code Menu" />
        <div class="qr-url">${qrCodes.menu.url}</div>
      `;
    } else {
      menuElement.innerHTML = `
        <div class="qr-loading">QR Code non disponible</div>
        <div class="qr-url">${qrCodes.menu.url}</div>
      `;
    }
  } else if (menuElement) {
    menuElement.innerHTML = `
      <div class="qr-loading">QR Code du menu non disponible</div>
    `;
  }
};

/**
 * Met à jour le QR code du menu reçu
 */
const updateQRCodes = (qrCodes) => {
  qrCodesData = qrCodes;
  console.log('[QR Code] QR code menu mis à jour:', qrCodes);
  
  // Annuler le timeout car on a reçu les données
  if (qrRequestTimeout) {
    clearTimeout(qrRequestTimeout);
    qrRequestTimeout = null;
  }
  
  // Afficher le QR code si la modal est ouverte
  if (isModalOpen) {
    displayQRCodes(qrCodes);
  } else {
    // Si la modal n'est pas ouverte, on peut quand même stocker les données
    console.log('[QR Code] QR codes reçus mais modal fermée');
  }
};

/**
 * Initialise le module QR code
 */
export const initQRCode = () => {
  console.log('[QR Code] Initialisation du module QR code menu');
  
  // Écouter les mises à jour de QR codes
  onEvent(EVENTS.QR_CODES_UPDATED, updateQRCodes);
  
  // Gérer le bouton QR code
  const qrButton = document.getElementById('qr-code-btn');
  if (qrButton) {
    qrButton.addEventListener('click', openQRModal);
  }
  
  // Gérer la fermeture de la modal
  const closeButton = document.getElementById('qr-modal-close');
  if (closeButton) {
    closeButton.addEventListener('click', closeQRModal);
  }
  
  // Fermer la modal en cliquant à l'extérieur
  const modal = document.getElementById('qr-modal');
  if (modal) {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeQRModal();
      }
    });
  }
  
  // Fermer la modal avec la touche Escape
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isModalOpen) {
      closeQRModal();
    }
  });
};

export default {
  initQRCode,
  openQRModal,
  closeQRModal,
  displayQRCodes
}; 