# Application de Menu Restaurant - Client

Une application web statique permettant la consultation du menu d'un restaurant en temps réel via WebSocket.

## Fonctionnalités

- 🌐 Connexion WebSocket pour recevoir les mises à jour du menu en temps réel
- 🌍 Support multilingue (français et thaï)
- 🔍 Filtrage des plats par catégories
- 🎨 Plusieurs thèmes visuels disponibles (clair, sombre, coloré)
- 📱 Design responsive (mobile, tablette, desktop)

## Structure du projet

```
.
├── src/
│   ├── css/
│   │   ├── styles.css     # Styles principaux
│   │   └── themes.css     # Thèmes visuels
│   ├── js/
│   │   ├── i18n.js        # Module de gestion des langues
│   │   ├── menu.js        # Module d'affichage du menu
│   │   ├── theme.js       # Module de gestion des thèmes
│   │   ├── utils.js       # Fonctions utilitaires
│   │   └── websocket.js   # Module de connexion WebSocket
│   └── index.html         # Page principale
├── .github/
│   └── workflows/
│       └── deploy.yml     # Workflow de déploiement GitHub Pages
└── README.md              # Documentation
```

## Installation

1. Clonez ce dépôt :
```bash
git clone https://github.com/votre-username/menu-client.git
cd menu-client
```

2. Servez l'application avec un serveur HTTP statique :

Avec Python :
```bash
python -m http.server 8000 --directory src
```

Ou avec Node.js (après avoir installé `http-server`) :
```bash
npx http-server src -p 8000
```

3. Ouvrez votre navigateur à l'adresse `http://localhost:8000`

## Déploiement sur GitHub Pages

Cette application est configurée pour être déployée automatiquement sur GitHub Pages. Voici les étapes à suivre :

1. Créez un nouveau dépôt sur GitHub (ou utilisez un dépôt existant).

2. Committez et poussez vos changements :
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

3. Activez GitHub Pages dans les paramètres du dépôt :
   - Allez dans "Settings" > "Pages"
   - Dans "Source", sélectionnez "GitHub Actions"

4. Le workflow GitHub Actions configuré dans `.github/workflows/deploy.yml` déploiera automatiquement le contenu du dossier `/src` vers GitHub Pages à chaque push sur la branche `main`.

5. Votre site sera disponible à l'adresse `https://votre-username.github.io/nom-du-repo/`

## Configuration

Par défaut, l'application essaie de se connecter à un serveur WebSocket à l'adresse locale ou à une adresse de production, en fonction de l'environnement d'exécution. Vous pouvez modifier ces adresses dans le fichier `src/js/websocket.js` :

```javascript
// Configuration WebSocket
const WS_URLS = {
  LOCAL: 'ws://guillaume.local:3000',
  PROD: 'wss://your-production-websocket-server.com' // À remplacer par votre URL WebSocket de production
};
```

## Format des données

L'application attend des données de menu au format suivant via WebSocket :

```javascript
{
  type: "menuUpdate",
  menu: [
    {
      id: "plat1",
      price: 120,
      name: { 
        fr: "Pad Thai", 
        th: "ผัดไทย" 
      },
      category: { 
        id: "noodles", 
        name: { 
          fr: "Nouilles", 
          th: "ก๋วยเตี๋ยว" 
        } 
             },
      image: "base64EncodedImageString...", // Image encodée en base64
      quantity: { 
        amount: 10, 
        infinite: false 
      },
      ingredients: ["Nouilles de riz", "Crevettes", "Tofu", "Cacahuètes"],
      supplementPrice: 20,
      supplements: [
        { 
          name: { 
            fr: "Oeuf", 
            th: "ไข่" 
          }, 
          price: 20 
        }
      ]
    }
    // ... autres plats
  ]
}
```

## Développement

### Ajout de nouvelles langues

Pour ajouter une nouvelle langue, modifiez le fichier `src/js/i18n.js` :

1. Ajoutez le code de langue dans `AVAILABLE_LANGUAGES`
2. Ajoutez les traductions dans l'objet `translations`
3. Ajoutez un bouton de langue dans `src/index.html`

### Ajout d'un nouveau thème

Pour ajouter un nouveau thème visuel, modifiez les fichiers suivants :

1. Dans `src/css/themes.css`, ajoutez une nouvelle classe `.theme-votre-theme`
2. Dans `src/js/theme.js`, ajoutez le nom du thème à `AVAILABLE_THEMES`
3. Ajoutez un bouton dans `src/index.html`

## Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.
