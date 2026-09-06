#!/bin/bash
# ============================================================
#  VITECH SCHOOL MANAGEMENT SYSTEM - Lancement (macOS/Linux)
# ============================================================

clear
echo "============================================================"
echo "  VITECH SCHOOL MANAGEMENT SYSTEM - Lancement"
echo "============================================================"
echo ""

# --- Check Node.js ---
if ! command -v node >/dev/null 2>&1; then
    echo "[ERREUR] Node.js n'est pas installe."
    echo "  Telechargez-le ici : https://nodejs.org/ (version LTS)"
    exit 1
fi

# --- Check the app was built ---
if [ ! -f "dist/index.html" ]; then
    echo "[INFO] L'application n'est pas encore compilee."
    echo "  Lancez d'abord : ./install-mac-linux.sh"
    exit 1
fi

echo "[OK] Demarrage du serveur local..."
echo ""
echo "  Ouvrez votre navigateur a l'adresse :"
echo "       http://localhost:4173"
echo ""
echo "  Pour arreter le serveur, appuyez sur : Ctrl + C"
echo "============================================================"
echo ""
npm run preview
