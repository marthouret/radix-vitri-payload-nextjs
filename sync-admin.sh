#!/bin/bash

# Script à lancer depuis la racine de votre projet verrerie-cms

# --- Configuration ---
# Le dossier de votre projet frontend (source)
SOURCE_PROJECT_DIR="." 
# Le dossier de votre nouveau projet backend (destination)
DEST_PROJECT_DIR="/home/arnaud/verrerie-cms-admin"

echo "Début de la synchronisation vers le backend standalone..."

# --- Liste des dossiers contenant la logique Payload à synchroniser ---
# Nous ne copions QUE ce qui est nécessaire au backend.
DIRS_TO_SYNC=(
    "collections"
    "globals"
    "fields"
    "endpoints"
    "hooks"
    "access"
    "blocks"
    "utils"
)

# --- Boucle de copie avec rsync ---
for dir in "${DIRS_TO_SYNC[@]}"; do
    # On vérifie si le dossier source existe
    if [ -d "$SOURCE_PROJECT_DIR/src/$dir" ]; then
        echo "Synchronisation de src/$dir/ ..."
        # rsync -av va copier le contenu du dossier de manière récursive et verbeuse
        rsync -av --progress "$SOURCE_PROJECT_DIR/src/$dir/" "$DEST_PROJECT_DIR/src/$dir/"
    else
        echo "Le dossier src/$dir/ n'existe pas, il est ignoré."
    fi
done

echo "✅ Synchronisation des fichiers terminée."
echo ""
echo "--- ÉTAPES SUIVANTES MANUELLES ---"
echo "1. Ouvrez le fichier '$DEST_PROJECT_DIR/src/payload.config.ts'."
echo "2. Importez et ajoutez toutes vos collections dans le tableau 'collections: []'."
echo "3. Allez dans le dossier '$DEST_PROJECT_DIR' et lancez 'pnpm install' pour ajouter les dépendances manquantes."
echo "4. Lancez 'pnpm run generate:types' pour mettre à jour les types."
echo "5. Lancez 'pnpm dev' pour tester le serveur backend."