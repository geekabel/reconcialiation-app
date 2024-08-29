# Outil de Réconciliation de Fichiers

## Table des matières

- [Outil de Réconciliation de Fichiers](#outil-de-réconciliation-de-fichiers)
  - [Table des matières](#table-des-matières)
  - [Description](#description)
  - [Fonctionnalités](#fonctionnalités)
  - [Prérequis](#prérequis)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Utilisation](#utilisation)
  - [Déploiement](#déploiement)
    - [Configuration spécifique à la plateforme](#configuration-spécifique-à-la-plateforme)
  - [Dépannage](#dépannage)
  - [Contribution](#contribution)
  - [Licence](#licence)

## Description

Cet outil de réconciliation de fichiers est une application web React conçue pour comparer efficacement de grands volumes de données provenant de fichiers Excel (XLSX) ou CSV. Il est particulièrement utile pour les institutions financières ou toute organisation nécessitant une comparaison précise et rapide de données structurées.

## Fonctionnalités

- Support des fichiers XLSX et CSV jusqu'à 1,5 Go
- Interface utilisateur intuitive pour la sélection des fichiers et des champs à comparer
- Traitement asynchrone des données pour une performance optimale
- Affichage détaillé des différences trouvées
- Gestion des erreurs robuste
- Options de déploiement flexibles (VPS, GitHub Pages, GitLab Pages)

## Prérequis

- Node.js (version 14 ou supérieure)
- npm (généralement inclus avec Node.js)
- Git

## Installation

1. Clonez le dépôt :

   ```
   git clone https://votre-repo-url.git
   cd nom-du-projet
   ```

2. Installez les dépendances :

   ```
   npm install
   ```

## Configuration

1. Copiez le fichier `.env.example` en `.env` :

   ```
   cp .env.example .env
   ```

2. Modifiez le fichier `.env` selon vos besoins :

   ```
   REACT_APP_MAX_FILE_SIZE=1610612736  # 1.5 Go en octets
   REACT_APP_BATCH_SIZE=10000
   ```

## Utilisation

1. Lancez l'application en mode développement :

   ```
   npm start
   ```

2. Ouvrez votre navigateur et accédez à `http://localhost:3000`

3. Suivez les instructions à l'écran pour uploader et comparer vos fichiers

## Déploiement

Utilisez le script `deploy.sh` pour déployer l'application :

```
./deploy.sh <vps|github|gitlab>
```

Assurez-vous de configurer correctement les informations de déploiement dans le script avant de l'utiliser.

### Configuration spécifique à la plateforme

- **VPS** : Mettez à jour les variables `VPS_USER`, `VPS_HOST`, et `VPS_PATH` dans `deploy.sh`
- **GitHub Pages** : Ajoutez `"homepage": "https://votre-nom-utilisateur.github.io/nom-du-repo"` à votre `package.json`
- **GitLab Pages** : Assurez-vous que votre `.gitlab-ci.yml` est correctement configuré

## Dépannage

- **Erreur "File too large"** : Vérifiez la limite de taille de fichier dans `.env`
- **Problèmes de performance** : Ajustez `REACT_APP_BATCH_SIZE` dans `.env`
- **Erreurs de déploiement** : Vérifiez les logs et assurez-vous que toutes les configurations sont correctes

## Contribution

Les contributions sont les bienvenues ! Veuillez suivre ces étapes :

1. Forkez le projet
2. Créez votre branche de fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Poussez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## Licence

Distribué sous la licence MIT. Voir `LICENSE` pour plus d'informations.

---

Pour toute question ou support, veuillez ouvrir un ticket dans la section Issues du dépôt.
