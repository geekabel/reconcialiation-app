#!/bin/bash

# Vérifier si un argument a été fourni
if [ $# -eq 0 ]; then
    echo "Usage: $0 <vps|github|gitlab>"
    exit 1
fi

# Définir la plateforme de déploiement
PLATFORM=$1

# Construire l'application
echo "Building the application..."
npm run build

# Fonction pour le déploiement VPS
deploy_vps() {
    echo "Deploying to VPS..."
    # Remplacez ces valeurs par vos propres informations
    VPS_USER="your_username"
    VPS_HOST="your_vps_ip_or_domain"
    VPS_PATH="/path/to/your/app/on/vps"

    # Transférer les fichiers
    scp -r build/* $VPS_USER@$VPS_HOST:$VPS_PATH

    echo "Deployment to VPS completed!"
}

# Fonction pour le déploiement GitHub Pages
deploy_github() {
    echo "Deploying to GitHub Pages..."
    # Assurez-vous que gh-pages est installé : npm install gh-pages --save-dev
    npx gh-pages -d build

    echo "Deployment to GitHub Pages completed!"
}

# Fonction pour le déploiement GitLab Pages
deploy_gitlab() {
    echo "Deploying to GitLab Pages..."
    # Assurez-vous que votre fichier .gitlab-ci.yml est configuré correctement
    git add build
    git commit -m "Build for GitLab Pages"
    git push origin master

    echo "Pushed build to GitLab. CI/CD will handle the deployment."
}

# Déployer en fonction de la plateforme choisie
case $PLATFORM in
    vps)
        deploy_vps
        ;;
    github)
        deploy_github
        ;;
    gitlab)
        deploy_gitlab
        ;;
    *)
        echo "Invalid platform. Use vps, github, or gitlab."
        exit 1
        ;;
esac

echo "Deployment process completed!"