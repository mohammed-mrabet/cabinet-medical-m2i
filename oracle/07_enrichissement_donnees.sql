--------------------------------------------------------------------------------
-- 07_enrichissement_donnees.sql
-- Enrichit la base Oracle pour une démonstration plus complète :
--   1) Ajoute les comptes UTILISATEUR manquants (3 médecins + 3 patients
--      ont déjà des lignes dans MEDECIN/PATIENT, mais seuls 2 ont un compte
--      de connexion dans UTILISATEUR)
--   2) Ajoute des rendez-vous supplémentaires couvrant tous les statuts
--      (CONFIRME, ANNULE, EFFECTUE) et plusieurs dates (passé, aujourd'hui,
--      futur) pour que le tableau de bord et "RDV du jour" aient de la
--      matière à afficher
--
-- À exécuter connecté en tant que cabinet_medical :
--   sqlplus cabinet_medical/CabMed_2026!@//localhost:1521/oradb
--   SQL> @07_enrichissement_donnees.sql
--------------------------------------------------------------------------------

SET SERVEROUTPUT ON;

--------------------------------------------------------------------------------
-- 1) COMPTES UTILISATEUR MANQUANTS
--------------------------------------------------------------------------------
-- Mot de passe en clair pour TOUS les comptes ci-dessous : password123
-- (même hash BCrypt que sara.bennani / karim.idrissi déjà présents dans
-- votre table, donc garanti compatible avec votre BCryptPasswordEncoder)

-- Dr. El Amrani Yassine (medecin_id = 2) -> compte MEDECIN manquant
INSERT INTO utilisateur (id, login, mot_de_passe, role, personne_id, actif)
SELECT seq_utilisateur.NEXTVAL,
       'yassine.elamrani',
       '$2a$12$25FE47RGjmTK7AJqO9YJ5.o.KijGkUS09GLe1axixZB6rxXcKrF0y',
       'MEDECIN', 2, 'O'
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM utilisateur WHERE login = 'yassine.elamrani');

-- Dr. Cherkaoui Imane (medecin_id = 3) -> compte MEDECIN manquant
INSERT INTO utilisateur (id, login, mot_de_passe, role, personne_id, actif)
SELECT seq_utilisateur.NEXTVAL,
       'imane.cherkaoui',
       '$2a$12$25FE47RGjmTK7AJqO9YJ5.o.KijGkUS09GLe1axixZB6rxXcKrF0y',
       'MEDECIN', 3, 'O'
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM utilisateur WHERE login = 'imane.cherkaoui');

-- Patiente Tazi Lina (patient_id = 2) -> compte PATIENT manquant
INSERT INTO utilisateur (id, login, mot_de_passe, role, personne_id, actif)
SELECT seq_utilisateur.NEXTVAL,
       'lina.tazi',
       '$2a$12$25FE47RGjmTK7AJqO9YJ5.o.KijGkUS09GLe1axixZB6rxXcKrF0y',
       'PATIENT', 2, 'O'
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM utilisateur WHERE login = 'lina.tazi');

-- Patient Ouahbi Adam (patient_id = 3) -> compte PATIENT manquant
-- (Adam est un enfant né en 2015 : on crée le compte au nom du parent
--  ("parent.ouahbi"), mais lié au patient_id = 3 ; pratique courante en
--  cabinet pédiatrique. Adaptez le login si vous préférez autre chose.)
INSERT INTO utilisateur (id, login, mot_de_passe, role, personne_id, actif)
SELECT seq_utilisateur.NEXTVAL,
       'parent.ouahbi',
       '$2a$12$25FE47RGjmTK7AJqO9YJ5.o.KijGkUS09GLe1axixZB6rxXcKrF0y',
       'PATIENT', 3, 'O'
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM utilisateur WHERE login = 'parent.ouahbi');

COMMIT;

--------------------------------------------------------------------------------
-- 2) RENDEZ-VOUS SUPPLÉMENTAIRES
--------------------------------------------------------------------------------
-- Objectif : avoir des RDV
--   - AUJOURD'HUI pour Bennani (id=1) ET El Amrani (id=2), pour tester
--     "RDV du jour" (PKG_RDV.RDV_DU_JOUR) sur plusieurs médecins
--   - dans le FUTUR (respecte la contrainte @Future si vous modifiez via
--     l'API plus tard) pour peupler "Mes rendez-vous"
--   - au statut EFFECTUE et ANNULE (dans le passé, donc insérés
--     directement en SQL ; le trigger anti-doublon ne bloque que les
--     doublons CONFIRME au même créneau)
--   - répartis sur plusieurs mois pour que les agrégations "par mois"
--     aient plusieurs points de données
--
-- NOTE : si Oracle renvoie "ORA-20001: Créneau déjà pris" sur une des
-- lignes ci-dessous, c'est que TRG_RDV_ANTI_DOUBLON a détecté qu'un RDV
-- actif existe déjà exactement à ce médecin + cette date/heure (par
-- exemple si vous exécutez ce script un jour où SYSDATE tombe sur une
-- date déjà utilisée dans vos données). Il suffit de changer l'heure
-- choisie sur la ligne concernée (ex: 15/24 -> 15.25/24 pour 15h15) et
-- de relancer.

-- RDV aujourd'hui, 15h00, Dr Bennani (1) <-> Tazi Lina (2)
INSERT INTO rendez_vous (id, date_heure, motif, statut, medecin_id, patient_id, date_creation)
SELECT seq_rdv.NEXTVAL, TRUNC(SYSDATE) + 15/24, 'Renouvellement ordonnance', 'CONFIRME', 1, 2, SYSDATE
FROM dual
WHERE NOT EXISTS (
    SELECT 1 FROM rendez_vous
    WHERE motif = 'Renouvellement ordonnance' AND medecin_id = 1 AND patient_id = 2
);

-- RDV aujourd'hui, 16h30, Dr El Amrani (2) <-> Ouahbi Adam (3)
INSERT INTO rendez_vous (id, date_heure, motif, statut, medecin_id, patient_id, date_creation)
SELECT seq_rdv.NEXTVAL, TRUNC(SYSDATE) + 16.5/24, 'Controle de croissance', 'CONFIRME', 2, 3, SYSDATE
FROM dual
WHERE NOT EXISTS (
    SELECT 1 FROM rendez_vous
    WHERE motif = 'Controle de croissance' AND medecin_id = 2 AND patient_id = 3
);

-- RDV demain, Dr Bennani <-> Idrissi Karim
INSERT INTO rendez_vous (id, date_heure, motif, statut, medecin_id, patient_id, date_creation)
SELECT seq_rdv.NEXTVAL, TRUNC(SYSDATE) + 1 + 9/24, 'Bilan annuel', 'CONFIRME', 1, 1, SYSDATE
FROM dual
WHERE NOT EXISTS (
    SELECT 1 FROM rendez_vous
    WHERE motif = 'Bilan annuel' AND medecin_id = 1 AND patient_id = 1
);

-- RDV dans 3 jours, Dr Cherkaoui <-> Tazi Lina
INSERT INTO rendez_vous (id, date_heure, motif, statut, medecin_id, patient_id, date_creation)
SELECT seq_rdv.NEXTVAL, TRUNC(SYSDATE) + 3 + 14/24, 'Consultation dermatologique', 'CONFIRME', 3, 2, SYSDATE
FROM dual
WHERE NOT EXISTS (
    SELECT 1 FROM rendez_vous
    WHERE motif = 'Consultation dermatologique' AND medecin_id = 3 AND patient_id = 2
);

-- RDV dans 7 jours, Dr El Amrani <-> Ouahbi Adam
INSERT INTO rendez_vous (id, date_heure, motif, statut, medecin_id, patient_id, date_creation)
SELECT seq_rdv.NEXTVAL, TRUNC(SYSDATE) + 7 + 10/24, 'Vaccin rappel', 'CONFIRME', 2, 3, SYSDATE
FROM dual
WHERE NOT EXISTS (
    SELECT 1 FROM rendez_vous
    WHERE motif = 'Vaccin rappel' AND medecin_id = 2 AND patient_id = 3
);

-- Quelques RDV PASSÉS au statut EFFECTUE (mois précédent), pour peupler
-- l'historique et varier les mois dans les agrégations
INSERT INTO rendez_vous (id, date_heure, motif, statut, medecin_id, patient_id, date_creation)
SELECT seq_rdv.NEXTVAL, ADD_MONTHS(TRUNC(SYSDATE), -1) + 9/24, 'Consultation de suivi', 'EFFECTUE', 1, 1, ADD_MONTHS(SYSDATE, -1)
FROM dual
WHERE NOT EXISTS (
    SELECT 1 FROM rendez_vous
    WHERE motif = 'Consultation de suivi' AND medecin_id = 1 AND patient_id = 1 AND statut = 'EFFECTUE'
);

INSERT INTO rendez_vous (id, date_heure, motif, statut, medecin_id, patient_id, date_creation)
SELECT seq_rdv.NEXTVAL, ADD_MONTHS(TRUNC(SYSDATE), -1) + 11/24, 'Bilan sanguin', 'EFFECTUE', 1, 2, ADD_MONTHS(SYSDATE, -1)
FROM dual
WHERE NOT EXISTS (
    SELECT 1 FROM rendez_vous
    WHERE motif = 'Bilan sanguin' AND medecin_id = 1 AND patient_id = 2 AND statut = 'EFFECTUE'
);

INSERT INTO rendez_vous (id, date_heure, motif, statut, medecin_id, patient_id, date_creation)
SELECT seq_rdv.NEXTVAL, ADD_MONTHS(TRUNC(SYSDATE), -2) + 14/24, 'Controle pediatrique', 'EFFECTUE', 2, 3, ADD_MONTHS(SYSDATE, -2)
FROM dual
WHERE NOT EXISTS (
    SELECT 1 FROM rendez_vous
    WHERE motif = 'Controle pediatrique' AND medecin_id = 2 AND patient_id = 3 AND statut = 'EFFECTUE'
);

-- Un RDV ANNULE (passé), pour tester le badge "Annulé" et le filtre
INSERT INTO rendez_vous (id, date_heure, motif, statut, medecin_id, patient_id, date_creation)
SELECT seq_rdv.NEXTVAL, TRUNC(SYSDATE) - 2 + 10/24, 'Consultation reportee', 'ANNULE', 3, 2, SYSDATE - 5
FROM dual
WHERE NOT EXISTS (
    SELECT 1 FROM rendez_vous
    WHERE motif = 'Consultation reportee' AND medecin_id = 3 AND patient_id = 2 AND statut = 'ANNULE'
);

COMMIT;

--------------------------------------------------------------------------------
-- 3) VÉRIFICATIONS
--------------------------------------------------------------------------------
PROMPT === Comptes UTILISATEUR ===
SELECT login, role, personne_id, actif FROM utilisateur ORDER BY role, personne_id;

PROMPT === Rendez-vous par statut ===
SELECT statut, COUNT(*) AS nb FROM rendez_vous GROUP BY statut ORDER BY statut;

PROMPT === RDV du jour (tous medecins confondus) ===
SELECT id, date_heure, motif, statut, medecin_id, patient_id
FROM rendez_vous
WHERE TRUNC(date_heure) = TRUNC(SYSDATE)
ORDER BY medecin_id, date_heure;

PROMPT === Test procedure stockee PKG_RDV.RDV_DU_JOUR pour le medecin 1 ===
VARIABLE rc REFCURSOR;
EXEC PKG_RDV.RDV_DU_JOUR(1, TRUNC(SYSDATE), :rc);
PRINT rc;

PROMPT === Test procedure stockee PKG_RDV.RDV_DU_JOUR pour le medecin 2 ===
VARIABLE rc2 REFCURSOR;
EXEC PKG_RDV.RDV_DU_JOUR(2, TRUNC(SYSDATE), :rc2);
PRINT rc2;

PROMPT === Vue v_rdv_par_medecin_mois (apres enrichissement) ===
SELECT * FROM v_rdv_par_medecin_mois;

PROMPT === Vue v_medecins_plus_solicites (apres enrichissement) ===
SELECT * FROM v_medecins_plus_solicites ORDER BY nb_rdv_total DESC;

PROMPT === Test du trigger anti-doublon (doit echouer avec ORA-20001) ===
PROMPT -- Decommentez pour tester manuellement : un 2e RDV CONFIRME au meme
PROMPT -- creneau pour le meme medecin doit etre rejete par TRG_RDV_ANTI_DOUBLON.
-- INSERT INTO rendez_vous (id, date_heure, motif, statut, medecin_id, patient_id, date_creation)
-- VALUES (seq_rdv.NEXTVAL, TRUNC(SYSDATE) + 15/24, 'Doublon test', 'CONFIRME', 1, 1, SYSDATE);

PROMPT === Recapitulatif final ===
SELECT
    (SELECT COUNT(*) FROM medecin)     AS nb_medecins,
    (SELECT COUNT(*) FROM patient)     AS nb_patients,
    (SELECT COUNT(*) FROM rendez_vous) AS nb_rdv,
    (SELECT COUNT(*) FROM utilisateur) AS nb_utilisateurs
FROM dual;
