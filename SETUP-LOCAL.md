# VITECH School Management System — Installation locale

Ce guide vous permet d'installer et de lancer le système **directement sur votre ordinateur**, sans hébergement en ligne.

---

## Prérequis

Le seul logiciel requis est **Node.js** (version 18 ou plus récente, LTS recommandée).

- Téléchargement : <https://nodejs.org/>
- Vérifier l'installation : ouvrez un terminal et tapez `node -v`

---

## Sur Windows

1. Décompressez le projet dans un dossier (ex. `C:\vitech-school`).
2. Double-cliquez sur **`install-windows.bat`**
   - Le script vérifie Node.js, installe les dépendances et compile l'application.
3. Une fois l'installation terminée, double-cliquez sur **`start-windows.bat`**
4. Ouvrez votre navigateur à l'adresse affichée : **`http://localhost:4173`**

Pour arrêter le serveur : `Ctrl + C` dans la fenêtre noire.

---

## Sur macOS / Linux

1. Décompressez le projet dans un dossier.
2. Ouvrez un terminal dans ce dossier et rendez les scripts exécutables (une seule fois) :
   ```bash
   chmod +x install-mac-linux.sh start-mac-linux.sh
   ```
3. Lancez l'installation :
   ```bash
   ./install-mac-linux.sh
   ```
4. Puis démarrez l'application :
   ```bash
   ./start-mac-linux.sh
   ```
5. Ouvrez votre navigateur à l'adresse : **`http://localhost:4173`**

Pour arrêter le serveur : `Ctrl + C`.

---

## Comptes de démonstration

Une fois l'application ouverte, cliquez sur **Login** puis utilisez l'un des comptes démo :

| Rôle | E-mail | Mot de passe |
|------|--------|--------------|
| Administrateur | `admin@vitech.academy` | `demo1234` |
| Enseignant | `teacher@vitech.academy` | `demo1234` |
| Étudiant | `student@vitech.academy` | `demo1234` |
| Parent | `parent@vitech.academy` | `demo1234` |
| Comptable | `finance@vitech.academy` | `demo1234` |

---

## Où sont stockées les données ?

Toutes les données (étudiants, paiements, notes, etc.) sont stockées **localement dans votre navigateur** (localStorage). Elles persistent entre les sessions sur le même navigateur. Pour repartir des données de démonstration : Paramètres → Système → « Reset demo data ».

---

## Dépannage

| Problème | Solution |
|----------|----------|
| « node n'est pas reconnu » | Installez Node.js depuis <https://nodejs.org/> puis rouvrez le script |
| `npm install` échoue | Vérifiez votre connexion internet et relancez le script d'installation |
| Le port 4173 est occupé | Vite choisira automatiquement le port suivant (4174, …) — lisez l'adresse affichée |
| Page blanche après mise à jour | Videz le cache du navigateur (`Ctrl + Shift + R`) |
