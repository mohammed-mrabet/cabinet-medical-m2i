-- =====================================================================
-- Cabinet Médical - Script 01 : Création de l'utilisateur / schéma Oracle
-- Auteur  : Projet Master GI - Faculté des Sciences d'Oujda
-- Module  : Administration des Bases de Données (Oracle)
-- =====================================================================
-- A exécuter connecté en SYSDBA (ex: sqlplus sys/motdepasse as sysdba)
-- =====================================================================

-- 1. Création d'un tablespace dédié à l'application (bonne pratique DBA)
CREATE TABLESPACE TBS_CABINET_MEDICAL
    DATAFILE 'cabinet_medical01.dbf'
    SIZE 200M
    AUTOEXTEND ON NEXT 50M MAXSIZE 2G
    EXTENT MANAGEMENT LOCAL
    SEGMENT SPACE MANAGEMENT AUTO;

-- 2. Création de l'utilisateur applicatif (schéma)
CREATE USER cabinet_medical IDENTIFIED BY "CabMed_2026!"
    DEFAULT TABLESPACE TBS_CABINET_MEDICAL
    TEMPORARY TABLESPACE TEMP
    QUOTA UNLIMITED ON TBS_CABINET_MEDICAL;

-- 3. Privilèges minimaux nécessaires (principe du moindre privilège)
GRANT CREATE SESSION TO cabinet_medical;
GRANT CREATE TABLE TO cabinet_medical;
GRANT CREATE SEQUENCE TO cabinet_medical;
GRANT CREATE VIEW TO cabinet_medical;
GRANT CREATE PROCEDURE TO cabinet_medical;
GRANT CREATE TRIGGER TO cabinet_medical;

-- 4. Vérification
SELECT username, account_status, default_tablespace
FROM dba_users
WHERE username = 'CABINET_MEDICAL';

-- A partir d'ici, se reconnecter avec :
-- sqlplus cabinet_medical/CabMed_2026!@//localhost:1521/XEPDB1
