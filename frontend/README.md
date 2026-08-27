# Cabinet Médical — Frontend (React)

Interface graphique du projet **Sujet 3 — Cabinet Médical** (Master Ingénierie Informatique,
Faculté des Sciences d'Oujda). Ce frontend consomme l'API Spring Boot déjà développée
(Oracle pour Médecins/Patients/RDV, MongoDB pour les dossiers médicaux).

## Stack technique

- **React 19** + **Vite** (build ultra-rapide, HMR)
- **React Router v7** (navigation, routes protégées par rôle)
- **Tailwind CSS v4** (design système avec tokens personnalisés)
- **Axios** (client HTTP + intercepteur JWT)
- **Recharts** (graphiques du tableau de bord)
- **date-fns** (formatage des dates en français)

## Design

Direction visuelle « registre de cabinet » : papier chaud (`#F7F5F1`), encre verte profonde
(`#1B2A2F`), vert sauge clinique (`#3E6B5C`) et terracotta (`#C77B4A`). Typographie Fraunces
(titres, façon registre éditorial) + Inter (interface) + JetBrains Mono (libellés techniques
Oracle/MongoDB). Chaque section affiche un badge discret indiquant sa source de données
(`ORACLE`, `MONGODB`, ou `ORACLE + MONGODB · CROISÉ`) pour rendre visible l'architecture
double-base exigée par le sujet.

## Installation

```bash
cd frontend
npm install
```

## Configuration de l'URL du backend

Par défaut, le frontend appelle `http://localhost:8080/api`. Si votre backend Spring Boot
tourne sur un autre port/host, créez un fichier `.env` (copié depuis `.env.example`) :

```bash
cp .env.example .env
```

```
VITE_API_BASE_URL=http://localhost:8080/api
```

## Lancement en développement

```bash
npm run dev
```

L'application sera disponible sur **http://localhost:3000**.

IMPORTANT : le port est fixé à 3000 (et non le port par défaut 5173 de Vite) car le backend
(`SecurityConfig.corsConfigurationSource`) n'autorise que les origines `http://localhost:4200`
et `http://localhost:3000`. Si vous changez le port frontend, ajoutez la nouvelle origine dans
`SecurityConfig.java` côté backend, sinon le navigateur bloquera les requêtes (erreur CORS).

ATTENTION : le backend Spring Boot doit être démarré au préalable (voir `backend/README.md`),
avec Oracle et MongoDB tous deux accessibles, sinon les pages afficheront une erreur réseau
(gérée proprement par l'interface, mais aucune donnée ne s'affichera).

## Build de production

```bash
npm run build
```

Génère le dossier `dist/` prêt à être déployé sur n'importe quel serveur statique
(Nginx, Apache, GitHub Pages, etc.).

## Comptes de démonstration

Préremplis sur la page de connexion (cliquables) — supposent que vos scripts
`oracle/05_donnees_test.sql` ont été exécutés :

| Identifiant       | Mot de passe   | Rôle    |
|-------------------|----------------|---------|
| `sara.bennani`    | `password123`  | Médecin |
| `karim.idrissi`   | `password123`  | Patient |

## Architecture des fichiers

```
src/
├── api/                  # Appels HTTP vers le backend (1 fichier par domaine)
│   ├── client.js         # Instance Axios + intercepteur JWT + gestion 401
│   ├── auth.js
│   ├── rendezVous.js
│   ├── personnes.js      # Médecins / Patients
│   ├── dossiers.js       # Dossiers médicaux MongoDB
│   └── historiqueDashboard.js
├── context/
│   └── AuthContext.jsx   # Session JWT, rôle, login/logout
├── components/
│   ├── AppLayout.jsx     # Sidebar + navigation par rôle
│   ├── ProtectedRoute.jsx
│   ├── Modal.jsx
│   ├── RdvFormModal.jsx          # Créer/modifier un RDV
│   ├── ConsultationFormModal.jsx # Ajouter une consultation (champs flexibles)
│   ├── ConsultationCard.jsx      # Affiche une consultation MongoDB (schéma flexible)
│   ├── PatientDossierReadOnly.jsx
│   ├── StatutBadge.jsx
│   └── ui.jsx            # Button, Card, Input, Select, Spinner, etc.
├── pages/
│   ├── LoginPage.jsx
│   ├── HomePage.jsx       # Route "/" -> TodayPage (médecin) ou RendezVousPage (patient)
│   ├── TodayPage.jsx      # RDV du jour (procédure stockée PL/SQL)
│   ├── RendezVousPage.jsx
│   ├── PatientsPage.jsx
│   ├── PatientDetailPage.jsx  # Historique combiné Oracle + MongoDB
│   ├── DashboardPage.jsx      # Statistiques croisées (admin uniquement)
│   └── MyDossierPage.jsx      # Dossier du patient connecté (lecture seule)
└── utils/
    └── dateUtils.js
```

## Correspondance avec le cahier des charges

| Exigence                                          | Où dans le frontend                                  |
|----------------------------------------------------|-------------------------------------------------------|
| CRUD RDV (Oracle)                                  | `RendezVousPage`, `TodayPage`, `RdvFormModal`         |
| CRUD dossiers/consultations (MongoDB)              | `PatientDetailPage`, `ConsultationFormModal`          |
| Rôles Médecin/Patient                              | `AuthContext`, `ProtectedRoute`, `AppLayout`          |
| Trigger anti-doublon (erreur ORA-20001)            | Géré et affiché dans `RdvFormModal` (`ErrorBanner`)   |
| Procédure stockée RDV du jour (REF CURSOR)         | `TodayPage` (appelle `/rendez-vous/medecin/{id}/aujourdhui`) |
| Agrégations MongoDB                                | `DashboardPage` (pathologies les plus fréquentes)     |
| Tableau de bord croisé                             | `DashboardPage` (3 cartes : Oracle / MongoDB / croisé)|
| Historique complet patient (2 bases)               | `PatientDetailPage`, `MyDossierPage`                  |
| Schéma flexible MongoDB                            | `ConsultationFormModal` (champs additionnels libres), `ConsultationCard` (affichage dynamique) |
