#!/bin/bash

set -e  # Arrête le script si une commande échoue

echo "▶️  Build du frontend Vue..."
cd frontend
npm run build

echo "🔄 Retour à la racine Capacitor..."
cd ..

echo "🔗 Synchronisation Capacitor..."
npx cap sync

echo "🧹 Nettoyage & compilation Android..."
cd android
./gradlew clean assembleDebug

echo "✅ Terminé ! APK debug prête."
