# Scripts d'enrichissement des bases — Cabinet Médical

Ces deux scripts complètent vos bases existantes (Oracle 11g + MongoDB) pour
rendre la démonstration plus riche et plus représentative, **sans toucher**
aux données déjà présentes (tout est conçu pour être rejouable sans créer de
doublons).

## Pourquoi ces scripts ?

D'après l'inspection de vos bases réelles :
- Oracle a **3 médecins** et **3 patients**, mais seulement **2 comptes** dans
  `UTILISATEUR` (sara.bennani, karim.idrissi). Impossible donc de se connecter
  en tant que Dr. El Amrani, Dr. Cherkaoui, Lina Tazi ou Adam Ouahbi.
- Vous n'aviez que **4 rendez-vous**, tous au même statut `CONFIRME`, sur 2
  jours seulement. Le tableau de bord et les filtres par statut n'ont donc
  presque rien à montrer.
- MongoDB n'avait que **5 consultations** au total réparties sur 3 dossiers.
  Les agrégations (pathologies fréquentes, consultations par mois) restent
  peu parlantes avec si peu de données.

## Ordre d'exécution

### 1) Oracle — `07_enrichissement_donnees.sql`

```bash
sqlplus cabinet_medical/CabMed_2026!@//localhost:1521/oradb
SQL> @07_enrichissement_donnees.sql
```

Ce script :
- Ajoute 4 comptes `UTILISATEUR` manquants (`yassine.elamrani`,
  `imane.cherkaoui`, `lina.tazi`, `parent.ouahbi`), tous avec le mot de passe
  **`password123`** (même hash BCrypt que vos comptes existants — testé et
  confirmé compatible avec `BCryptPasswordEncoder`).
- Ajoute 9 rendez-vous supplémentaires : 2 aujourd'hui (pour tester
  `PKG_RDV.RDV_DU_JOUR` sur 2 médecins différents), des RDV futurs, 3 RDV
  passés au statut `EFFECTUE`, et 1 RDV `ANNULE`.
- Affiche des vérifications à la fin (comptes, RDV du jour, vues
  statistiques, récapitulatif).
- **Idempotent** : relancez-le autant de fois que vous voulez, il ne créera
  jamais de doublons (chaque `INSERT` est protégé par un `WHERE NOT EXISTS`).

### 2) MongoDB — `03_enrichissement_dossiers.js`

```bash
mongosh "mongodb://localhost:27017/cabinet_medical" --file 03_enrichissement_dossiers.js
```

Ce script :
- Ajoute 2 consultations à chacun des 3 dossiers existants (patientId 1, 2, 3),
  soit 6 consultations de plus, avec des diagnostics variés et des champs
  `champsLibres` différents à chaque fois (résultats IRM, tension, carnet de
  vaccination, etc.) pour bien illustrer le schéma flexible.
- Affiche les résultats des agrégations (pathologies les plus fréquentes,
  consultations par mois/médecin) pour que vous puissiez vérifier
  immédiatement l'effet sur votre tableau de bord.
- **Idempotent** : chaque ajout est protégé par un test d'existence préalable
  (`countDocuments` sur le diagnostic), donc relancer le script ne duplique
  rien.

## Récapitulatif après exécution des deux scripts

| | Avant | Après |
|---|---|---|
| Comptes `UTILISATEUR` | 2 | 6 |
| Rendez-vous Oracle | 4 (tous `CONFIRME`) | 13 (`CONFIRME`, `EFFECTUE`, `ANNULE`) |
| Consultations MongoDB | 5 | 11 |
| Mois distincts couverts (RDV) | 1 (juin 2026) | 3 (avril, mai, juin 2026) |

## Nouveaux comptes de connexion

| Login | Mot de passe | Rôle | Lié à |
|---|---|---|---|
| `sara.bennani` | `password123` | MEDECIN | Dr. Bennani Sara (Cardiologie) — déjà existant |
| `karim.idrissi` | `password123` | PATIENT | Idrissi Karim — déjà existant |
| `yassine.elamrani` | `password123` | MEDECIN | Dr. El Amrani Yassine (Pédiatrie) — nouveau |
| `imane.cherkaoui` | `password123` | MEDECIN | Dr. Cherkaoui Imane (Dermatologie) — nouveau |
| `lina.tazi` | `password123` | PATIENT | Tazi Lina — nouveau |
| `parent.ouahbi` | `password123` | PATIENT | Ouahbi Adam (patient mineur, compte au nom du parent) — nouveau |

Pensez à mettre à jour la page de connexion de votre frontend (`LoginPage.jsx`)
si vous voulez ajouter ces nouveaux comptes à la liste des comptes de
démonstration cliquables.

## En cas d'erreur

- **`ORA-20001: Créneau déjà pris`** sur le script Oracle : le trigger
  `TRG_RDV_ANTI_DOUBLON` a détecté une collision avec un RDV déjà existant
  exactement au même médecin + même date/heure (peut arriver si vous lancez
  le script un jour où `SYSDATE` correspond à une date déjà utilisée).
  Changez légèrement l'heure sur la ligne concernée (ex. `15/24` → `15.25/24`
  pour 15h15) et relancez.
- **`MongoBulkWriteError: duplicate key`** : n'arrive pas avec ce script
  (on utilise `updateOne` + `$push`, pas `insertOne`), mais si vous voyez
  cette erreur ailleurs, c'est que l'index unique `idx_patientId` empêche
  d'avoir deux dossiers pour le même patient — normal et voulu.
