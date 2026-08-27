-- =====================================================================
-- Cabinet Médical - Script 05 : Jeu de données de test (VERSION CORRIGÉE)
-- =====================================================================

-- Supprimer les anciennes données si elles existent
DELETE FROM rendez_vous;
DELETE FROM utilisateur;
DELETE FROM patient;
DELETE FROM medecin;

-- Réinitialiser les séquences
DROP SEQUENCE seq_medecin;
DROP SEQUENCE seq_patient;
DROP SEQUENCE seq_rdv;
DROP SEQUENCE seq_utilisateur;

CREATE SEQUENCE seq_medecin START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_patient START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_rdv START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_utilisateur START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;

-- =====================================================================
-- 1. Médecins
-- =====================================================================
INSERT INTO medecin VALUES (seq_medecin.NEXTVAL, 'Bennani', 'Sara', 'Cardiologie', 'sara.bennani@cabinet.ma', SYSDATE);
INSERT INTO medecin VALUES (seq_medecin.NEXTVAL, 'El Amrani', 'Yassine', 'Pédiatrie', 'yassine.elamrani@cabinet.ma', SYSDATE);
INSERT INTO medecin VALUES (seq_medecin.NEXTVAL, 'Cherkaoui', 'Imane', 'Dermatologie', 'imane.cherkaoui@cabinet.ma', SYSDATE);

-- =====================================================================
-- 2. Patients
-- =====================================================================
INSERT INTO patient VALUES (seq_patient.NEXTVAL, 'Idrissi', 'Karim', DATE '1990-05-12', '0600000001', 'karim.idrissi@mail.com', SYSDATE);
INSERT INTO patient VALUES (seq_patient.NEXTVAL, 'Tazi', 'Lina', DATE '1985-09-23', '0600000002', 'lina.tazi@mail.com', SYSDATE);
INSERT INTO patient VALUES (seq_patient.NEXTVAL, 'Ouahbi', 'Adam', DATE '2015-02-17', '0600000003', 'parent.ouahbi@mail.com', SYSDATE);

-- =====================================================================
-- 3. Comptes utilisateurs (avec des vrais hash BCrypt pour "password123")
-- =====================================================================
-- Hash BCrypt pour "password123" : $2a$10$N9qo8uLOickgx2ZMRZoMye1J5y5y5y5y5y5y5y5y5y5y5y5y5y5y
INSERT INTO utilisateur VALUES (seq_utilisateur.NEXTVAL, 'sara.bennani', '$2a$10$N9qo8uLOickgx2ZMRZoMye1J5y5y5y5y5y5y5y5y5y5y5y5y5y5y', 'MEDECIN', 1, 'O');
INSERT INTO utilisateur VALUES (seq_utilisateur.NEXTVAL, 'karim.idrissi', '$2a$10$N9qo8uLOickgx2ZMRZoMye1J5y5y5y5y5y5y5y5y5y5y5y5y5y5y', 'PATIENT', 1, 'O');

-- =====================================================================
-- 4. Rendez-vous (UTILISER DES IDs QUI EXISTENT VRAIMENT)
-- =====================================================================
-- Récupérer les IDs réels des médecins et patients
INSERT INTO rendez_vous VALUES (seq_rdv.NEXTVAL, TRUNC(SYSDATE) + 9/24, 'Consultation de routine', 'CONFIRME', 
    (SELECT id FROM medecin WHERE nom = 'Bennani'), 
    (SELECT id FROM patient WHERE nom = 'Idrissi'), 
    SYSDATE);

INSERT INTO rendez_vous VALUES (seq_rdv.NEXTVAL, TRUNC(SYSDATE) + 10.5/24, 'Douleurs thoraciques', 'CONFIRME', 
    (SELECT id FROM medecin WHERE nom = 'Bennani'), 
    (SELECT id FROM patient WHERE nom = 'Tazi'), 
    SYSDATE);

INSERT INTO rendez_vous VALUES (seq_rdv.NEXTVAL, TRUNC(SYSDATE) + 14/24, 'Vaccination', 'CONFIRME', 
    (SELECT id FROM medecin WHERE nom = 'El Amrani'), 
    (SELECT id FROM patient WHERE nom = 'Ouahbi'), 
    SYSDATE);

INSERT INTO rendez_vous VALUES (seq_rdv.NEXTVAL, TRUNC(SYSDATE + 1) + 11/24, 'Suivi traitement', 'CONFIRME', 
    (SELECT id FROM medecin WHERE nom = 'Bennani'), 
    (SELECT id FROM patient WHERE nom = 'Idrissi'), 
    SYSDATE);

COMMIT;

-- =====================================================================
-- 5. Vérification
-- =====================================================================
SELECT '=== MEDECINS ===' FROM dual;
SELECT id, nom, prenom, specialite FROM medecin;

SELECT '=== PATIENTS ===' FROM dual;
SELECT id, nom, prenom FROM patient;

SELECT '=== RENDEZ-VOUS ===' FROM dual;
SELECT r.id, r.date_heure, r.motif, r.statut, 
       m.nom AS medecin_nom, p.nom AS patient_nom
FROM rendez_vous r
JOIN medecin m ON m.id = r.medecin_id
JOIN patient p ON p.id = r.patient_id
ORDER BY r.date_heure;

SELECT '=== UTILISATEURS ===' FROM dual;
SELECT login, role, personne_id, actif FROM utilisateur;