-- =====================================================================
-- Cabinet Médical - Trigger anti-collision de créneau (Oracle 11g)
-- =====================================================================

CREATE OR REPLACE TRIGGER trg_rdv_anti_doublon
BEFORE INSERT OR UPDATE OF date_heure, medecin_id, statut ON rendez_vous
FOR EACH ROW
DECLARE
    v_nb NUMBER;
BEGIN
    -- On ne vérifie que les RDV qui restent "actifs" (pas les annulés)
    IF :NEW.statut <> 'ANNULE' THEN

        -- Version simplifiée pour Oracle 11g
        SELECT COUNT(*)
        INTO v_nb
        FROM rendez_vous
        WHERE medecin_id = :NEW.medecin_id
          AND date_heure = :NEW.date_heure
          AND statut <> 'ANNULE'
          AND (   :NEW.id IS NULL
               OR id <> :NEW.id );

        IF v_nb > 0 THEN
            RAISE_APPLICATION_ERROR(
                -20001,
                'Créneau déjà pris : '
            );
        END IF;
    END IF;
END;
/

-- Vérifier
SELECT trigger_name, status FROM user_triggers WHERE trigger_name = 'TRG_RDV_ANTI_DOUBLON';