#!/bin/bash

set -e  # Arrête le script si une commande échoue

APP_ID=$(jq -r '.appId' capacitor.config.json)

echo "▶️  Build de l'app Vue..."
npm run build

echo "🔗 Synchronisation Capacitor..."
npx cap sync android

echo "📱 Installation sur l'appareil branché..."
cd android
./gradlew clean installDebug

echo "🚀 Lancement de l'app..."
adb shell monkey -p "$APP_ID" -c android.intent.category.LAUNCHER 1

echo "✅ Terminé ! App installée et lancée sur l'appareil."
