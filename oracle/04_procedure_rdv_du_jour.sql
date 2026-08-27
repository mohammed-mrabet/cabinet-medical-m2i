-- =====================================================================
-- Cabinet Médical - Script 04 : Procédure stockée
-- Objectif : retourner la liste des RDV du jour pour un médecin donné,
--            triée par heure (via un REF CURSOR pour pouvoir être
--            consommée facilement depuis Java/Spring Boot).
-- =====================================================================

CREATE OR REPLACE PACKAGE pkg_rdv AS

    -- Type curseur générique, réutilisable
    TYPE t_cursor IS REF CURSOR;

    PROCEDURE rdv_du_jour(
        p_medecin_id   IN  medecin.id%TYPE,
        p_date         IN  DATE DEFAULT TRUNC(SYSDATE),
        p_resultat     OUT t_cursor
    );

END pkg_rdv;
/

CREATE OR REPLACE PACKAGE BODY pkg_rdv AS

    PROCEDURE rdv_du_jour(
        p_medecin_id   IN  medecin.id%TYPE,
        p_date         IN  DATE DEFAULT TRUNC(SYSDATE),
        p_resultat     OUT t_cursor
    ) IS
    BEGIN
        OPEN p_resultat FOR
            SELECT
                r.id            AS rdv_id,
                r.date_heure,
                r.motif,
                r.statut,
                p.id            AS patient_id,
                p.nom           AS patient_nom,
                p.prenom        AS patient_prenom,
                p.telephone     AS patient_telephone
            FROM rendez_vous r
            JOIN patient p ON p.id = r.patient_id
            WHERE r.medecin_id = p_medecin_id
              AND TRUNC(r.date_heure) = TRUNC(p_date)
              AND r.statut <> 'ANNULE'
            ORDER BY r.date_heure ASC;
    END rdv_du_jour;

END pkg_rdv;
/

-- =====================================================================
-- Test en SQL*Plus / SQL Developer
-- =====================================================================
-- VARIABLE rc REFCURSOR;
-- EXEC pkg_rdv.rdv_du_jour(1, SYSDATE, :rc);
-- PRINT rc;
