--------------------------------------------------------------------------------
-- 05_fix_trigger_anti_doublon.sql
--
-- PROBLEME : TRG_RDV_ANTI_DOUBLON est un trigger FOR EACH ROW qui fait un
-- SELECT COUNT(*) FROM rendez_vous (la meme table qu'il protege). Quand
-- Hibernate genere un UPDATE qui touche TOUTES les colonnes de la ligne
-- (comportement par defaut de save() sur une entite JPA), le trigger se
-- declenche sur UPDATE OF date_heure, medecin_id, statut et essaie de lire
-- RENDEZ_VOUS alors que cette meme table est "en mutation" (en cours de
-- modification) -> ORA-04091.
--
-- SOLUTION : on transforme le trigger en COMPOUND TRIGGER (supporte depuis
-- Oracle 11g). La verification anti-doublon est deplacee dans la section
-- AFTER STATEMENT, executee une seule fois apres que TOUTES les lignes de
-- l'instruction SQL aient fini d'etre modifiees. A ce moment, la table
-- n'est plus en mutation et peut etre interrogee normalement.
--
-- On garde une logique identique : un meme medecin ne peut pas avoir deux
-- RDV actifs (statut <> 'ANNULE') au meme creneau (meme date_heure).
--
-- A executer connecte en tant que cabinet_medical :
--   sqlplus cabinet_medical/CabMed_2026!@//localhost:1521/oradb
--   SQL> @05_fix_trigger_anti_doublon.sql
--------------------------------------------------------------------------------

CREATE OR REPLACE TRIGGER trg_rdv_anti_doublon
FOR INSERT OR UPDATE OF date_heure, medecin_id, statut ON rendez_vous
COMPOUND TRIGGER

    -- Collection en memoire : on y empile les (medecin_id, date_heure) des
    -- lignes affectees par l'instruction en cours, pour les revérifier une
    -- fois que la table n'est plus en mutation.
    TYPE t_creneau IS RECORD (
        medecin_id NUMBER,
        date_heure DATE,
        id         NUMBER
    );
    TYPE t_creneaux IS TABLE OF t_creneau;
    v_creneaux t_creneaux := t_creneaux();

    AFTER EACH ROW IS
        v_idx PLS_INTEGER;
    BEGIN
        -- On ne retient que les lignes qui restent "actives" (pas annulees) :
        -- ce sont les seules concernees par la regle anti-doublon.
        IF :NEW.statut <> 'ANNULE' THEN
            v_creneaux.EXTEND;
            v_idx := v_creneaux.COUNT;
            -- Un RECORD PL/SQL n'a pas de constructeur positionnel comme un
            -- type OBJECT (pas de "t_creneau(a, b, c)") : on assigne donc
            -- chaque champ individuellement avec la notation pointee.
            v_creneaux(v_idx).medecin_id := :NEW.medecin_id;
            v_creneaux(v_idx).date_heure := :NEW.date_heure;
            v_creneaux(v_idx).id         := :NEW.id;
        END IF;
    END AFTER EACH ROW;

    AFTER STATEMENT IS
        v_nb NUMBER;
    BEGIN
        -- A ce stade, l'instruction SQL est terminee : la table n'est plus
        -- en mutation, on peut donc l'interroger sans declencher ORA-04091.
        FOR i IN 1 .. v_creneaux.COUNT LOOP
            SELECT COUNT(*)
            INTO v_nb
            FROM rendez_vous
            WHERE medecin_id = v_creneaux(i).medecin_id
              AND date_heure = v_creneaux(i).date_heure
              AND statut <> 'ANNULE'
              AND id <> v_creneaux(i).id;

            IF v_nb > 0 THEN
                RAISE_APPLICATION_ERROR(
                    -20001,
                    'Créneau déjà pris : ce médecin a déjà un rendez-vous actif à cette date/heure.'
                );
            END IF;
        END LOOP;
    END AFTER STATEMENT;

END trg_rdv_anti_doublon;
/

--------------------------------------------------------------------------------
-- VERIFICATIONS
--------------------------------------------------------------------------------
PROMPT === Statut du trigger apres recreation ===
SELECT trigger_name, status FROM user_triggers WHERE trigger_name = 'TRG_RDV_ANTI_DOUBLON';

PROMPT === Test 1 : marquer un RDV existant comme EFFECTUE (doit reussir) ===
PROMPT -- Remplacez 1 par l'id reel d'un RDV au statut CONFIRME chez vous.
-- UPDATE rendez_vous SET statut = 'EFFECTUE' WHERE id = 1;
-- COMMIT;
-- SELECT id, statut FROM rendez_vous WHERE id = 1;

PROMPT === Test 2 : le trigger doit toujours bloquer un vrai doublon ===
PROMPT -- Adaptez les ids medecin_id/patient_id a vos donnees reelles.
-- INSERT INTO rendez_vous (id, date_heure, motif, statut, medecin_id, patient_id, date_creation)
-- VALUES (seq_rdv.NEXTVAL, TO_DATE('25/06/2026 10:00','DD/MM/YYYY HH24:MI'), 'Test doublon 1', 'CONFIRME', 1, 1, SYSDATE);
-- INSERT INTO rendez_vous (id, date_heure, motif, statut, medecin_id, patient_id, date_creation)
-- VALUES (seq_rdv.NEXTVAL, TO_DATE('25/06/2026 10:00','DD/MM/YYYY HH24:MI'), 'Test doublon 2', 'CONFIRME', 1, 2, SYSDATE);
-- => la 2e ligne doit lever ORA-20001
