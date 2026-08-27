# Cabinet Médical — Application Hybride Oracle + MongoDB

Projet Master Génie Informatique — Faculté des Sciences d'Oujda
Module : Administration des Bases de Données (Oracle) & NoSQL

## Architecture

```
cabinet-medical/
├── oracle/                          # Scripts SQL Oracle (à exécuter dans l'ordre)
│   ├── 01_create_user.sql           # Création utilisateur/tablespace (SYSDBA)
│   ├── 02_schema.sql                # Tables, séquences, contraintes, index
│   ├── 03_trigger_anti_doublon.sql  # Trigger anti-collision de créneau
│   ├── 04_procedure_rdv_du_jour.sql # Procédure stockée (package PL/SQL)
│   ├── 05_donnees_test.sql          # Jeu de données de démonstration
│   └── 06_vues_statistiques.sql     # Vues pour le tableau de bord
│
├── mongodb/                         # Scripts MongoDB (mongosh)
│   ├── 01_init_dossiers.js          # Collection, validation, index, données
│   └── 02_aggregations_statistiques.js
│
└── backend/cabinet-medical-backend/ # Application Spring Boot
    └── src/main/java/ma/oujda/cabinetmedical/
        ├── entity/        # Entités JPA -> Oracle (Medecin, Patient, RendezVous, Utilisateur)
        ├── mongo/          # Document MongoDB (DossierMedical)
        ├── repository/
        │   ├── oracle/     # JpaRepository + DAO procédure stockée + DAO vues stats
        │   └── mongo/      # MongoRepository + agrégations
        ├── service/        # Logique métier (RDV, Dossiers, Dashboard, Historique, Auth)
        ├── controller/     # API REST
        ├── security/       # JWT + Spring Security (rôles MEDECIN / PATIENT)
        ├── dto/            # Objets d'échange API
        ├── config/         # Configuration Spring Security
        └── exception/      # Gestion centralisée des erreurs
```

## Démarrage rapide

1. **Oracle** : exécuter les scripts `oracle/01_*.sql` à `06_*.sql` dans l'ordre,
   via SQL*Plus ou SQL Developer.
2. **MongoDB** : exécuter `mongodb/01_init_dossiers.js` puis `02_aggregations_statistiques.js`
   via `mongosh`.
3. **Backend** : adapter `application.yml` (identifiants Oracle/MongoDB), puis :
   ```bash
   cd backend/cabinet-medical-backend
   mvn spring-boot:run
   ```
4. L'API est disponible sur `http://localhost:8080/api`.

Voir le rapport complet (Word) pour le détail de l'installation, l'explication
de chaque composant, et le guide de test pas à pas.

## Comptes de test

| Login           | Rôle    | Mot de passe (à re-hasher en BCrypt) |
|-----------------|---------|----------------------------------------|
| sara.bennani    | MEDECIN | password123                            |
| karim.idrissi   | PATIENT | password123                            |

> Important : les hash BCrypt dans `05_donnees_test.sql` sont des exemples.
> Génère les vrais hash via le endpoint `/api/auth` ou un script utilitaire
> (voir section dédiée dans le rapport).
