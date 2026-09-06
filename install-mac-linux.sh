#!/bin/bash
# ============================================================
#  VITECH SCHOOL MANAGEMENT SYSTEM - Installation (macOS/Linux)
# ============================================================

clear
echo "============================================================"
echo "  VITECH SCHOOL MANAGEMENT SYSTEM - Installation"
echo "============================================================"
echo ""

# --- 1. Check Node.js ---
if ! command -v node >/dev/null 2>&1; then
    echo "[ERREUR] Node.js n'est pas installe sur cet ordinateur."
    echo ""
    echo "  Telechargez-le ici : https://nodejs.org/ (version LTS)"
    echo "  macOS  : brew install node"
    echo "  Linux  : sudo apt install nodejs npm   (ou votre gestionnaire de paquets)"
    echo ""
    echo "Une fois installe, relancez : ./install-mac-linux.sh"
    echo ""
    exit 1
fi
echo "[OK] Node.js detecte : $(node -v)"
echo ""

# --- 2. Install dependencies ---
echo "[1/2] Installation des dependances (peut prendre 1-3 minutes)..."
echo ""
npm install --no-audit --no-fund
if [ $? -ne 0 ]; then
    echo ""
    echo "[ERREUR] npm install a echoue. Verifiez votre connexion internet."
    exit 1
fi
echo ""

# --- 3. Build ---
echo "[2/2] Compilation de l'application..."
echo ""
npm run build
if [ $? -ne 0 ]; then
    echo ""
    echo "[ERREUR] La compilation a echoue."
    exit 1
fi

echo ""
echo "============================================================"
echo "  INSTALLATION TERMINEE AVEC SUCCES"
echo "============================================================"
echo ""
echo "  Pour lancer l'application, executez :"
echo "       ./start-mac-linux.sh"
echo ""
echo "  Puis ouvrez votre navigateur a l'adresse affichee"
echo "  (par defaut : http://localhost:4173)"
echo ""
