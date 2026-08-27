# 🏥 Cabinet Médical — Master M2I

Application full-stack de gestion d'un cabinet médical.

## Stack technique
- **Backend** : Spring Boot 3 + JPA/Hibernate
- **Frontend** : React + Vite + Tailwind CSS
- **Base 1** : Oracle 11g (rendez-vous, médecins, patients)
- **Base 2** : MongoDB (dossiers médicaux, consultations)

## Fonctionnalités
- Authentification JWT avec rôles (Médecin / Patient)
- CRUD rendez-vous avec trigger anti-doublon Oracle
- Procédure stockée PL/SQL (PKG_RDV.RDV_DU_JOUR)
- Dossiers médicaux avec schéma flexible (MongoDB)
- Agrégations : pathologies fréquentes, consultations par mois
- Dashboard croisé Oracle + MongoDB

## Installation

### Prérequis
- Oracle 11g ou XE
- MongoDB 6+
- Java 17+
- Node.js 18+

### Backend
```bash
cp src/main/resources/application.example.properties \
   src/main/resources/application.properties
# Remplissez vos identifiants dans application.properties
mvn spring-boot:run
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Comptes de test (après scripts d'initialisation)

| Login | Rôle |
|---|---|
| sara.bennani | Médecin |
| karim.idrissi | Patient |