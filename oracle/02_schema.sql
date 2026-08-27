-- =====================================================================
-- Cabinet Médical - Script 02 : Modèle de données (DDL) - VERSION CORRIGÉE
-- =====================================================================

-- Nettoyage préalable (si besoin)
-- DROP TABLE rendez_vous CASCADE CONSTRAINTS PURGE;
-- DROP TABLE patient CASCADE CONSTRAINTS PURGE;
-- DROP TABLE medecin CASCADE CONSTRAINTS PURGE;
-- DROP TABLE utilisateur CASCADE CONSTRAINTS PURGE;
-- DROP SEQUENCE seq_medecin;
-- DROP SEQUENCE seq_patient;
-- DROP SEQUENCE seq_rdv;
-- DROP SEQUENCE seq_utilisateur;

-- =====================================================================
-- 1. TABLE MEDECIN
-- =====================================================================
CREATE TABLE medecin (
    id              NUMBER(10)      NOT NULL,
    nom             VARCHAR2(50)    NOT NULL,
    prenom          VARCHAR2(50)    NOT NULL,
    specialite      VARCHAR2(80)    NOT NULL,
    email           VARCHAR2(120)   NOT NULL,
    date_creation   DATE            DEFAULT SYSDATE NOT NULL,
    CONSTRAINT pk_medecin PRIMARY KEY (id),
    CONSTRAINT uq_medecin_email UNIQUE (email)
);

COMMENT ON TABLE medecin IS 'Médecins du cabinet (profil Admin de l''application)';

CREATE SEQUENCE seq_medecin
    START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;

-- =====================================================================
-- 2. TABLE PATIENT (CORRIGÉ - sans SYSDATE dans CHECK)
-- =====================================================================
CREATE TABLE patient (
    id              NUMBER(10)      NOT NULL,
    nom             VARCHAR2(50)    NOT NULL,
    prenom          VARCHAR2(50)    NOT NULL,
    date_naissance  DATE            NOT NULL,
    telephone       VARCHAR2(20),
    email           VARCHAR2(120)   NOT NULL,
    date_creation   DATE            DEFAULT SYSDATE NOT NULL,
    CONSTRAINT pk_patient PRIMARY KEY (id),
    CONSTRAINT uq_patient_email UNIQUE (email)
    -- La contrainte CHECK avec SYSDATE est supprimée
    -- La vérification sera faite côté application
);

COMMENT ON TABLE patient IS 'Patients du cabinet (profil User de l''application)';

CREATE SEQUENCE seq_patient
    START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;

-- =====================================================================
-- 3. TABLE UTILISATEUR
-- =====================================================================
CREATE TABLE utilisateur (
    id              NUMBER(10)      NOT NULL,
    login           VARCHAR2(60)    NOT NULL,
    mot_de_passe    VARCHAR2(255)   NOT NULL,
    role            VARCHAR2(20)    NOT NULL,
    personne_id     NUMBER(10)      NOT NULL,
    actif           CHAR(1)         DEFAULT 'O' NOT NULL,
    CONSTRAINT pk_utilisateur PRIMARY KEY (id),
    CONSTRAINT uq_utilisateur_login UNIQUE (login),
    CONSTRAINT ck_utilisateur_role CHECK (role IN ('MEDECIN', 'PATIENT')),
    CONSTRAINT ck_utilisateur_actif CHECK (actif IN ('O', 'N'))
);

CREATE SEQUENCE seq_utilisateur
    START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;

-- =====================================================================
-- 4. TABLE RENDEZ_VOUS
-- =====================================================================
CREATE TABLE rendez_vous (
    id              NUMBER(10)      NOT NULL,
    date_heure      DATE            NOT NULL,
    motif           VARCHAR2(200)   NOT NULL,
    statut          VARCHAR2(20)    DEFAULT 'CONFIRME' NOT NULL,
    medecin_id      NUMBER(10)      NOT NULL,
    patient_id      NUMBER(10)      NOT NULL,
    date_creation   DATE            DEFAULT SYSDATE NOT NULL,
    CONSTRAINT pk_rdv PRIMARY KEY (id),
    CONSTRAINT fk_rdv_medecin FOREIGN KEY (medecin_id) REFERENCES medecin(id),
    CONSTRAINT fk_rdv_patient FOREIGN KEY (patient_id) REFERENCES patient(id),
    CONSTRAINT ck_rdv_statut CHECK (statut IN ('CONFIRME', 'ANNULE', 'EFFECTUE'))
);

COMMENT ON TABLE rendez_vous IS 'Rendez-vous reliant un médecin et un patient';

CREATE SEQUENCE seq_rdv
    START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;

-- =====================================================================
-- 5. INDEX
-- =====================================================================
CREATE INDEX idx_rdv_medecin_date ON rendez_vous (medecin_id, date_heure);
CREATE INDEX idx_rdv_patient ON rendez_vous (patient_id);
CREATE INDEX idx_utilisateur_personne ON utilisateur (role, personne_id);

-- =====================================================================
-- Vérification
-- =====================================================================
SELECT table_name FROM user_tables ORDER BY table_name;