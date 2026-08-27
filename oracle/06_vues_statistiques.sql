-- =====================================================================
-- Cabinet Médical - Script 06 : Requêtes statistiques (Tableau de bord)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Nombre de RDV par médecin ce mois-ci (source Oracle)
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW v_rdv_par_medecin_mois AS
SELECT
    m.id            AS medecin_id,
    m.nom,
    m.prenom,
    m.specialite,
    COUNT(r.id)     AS nb_rdv_mois
FROM medecin m
LEFT JOIN rendez_vous r
       ON r.medecin_id = m.id
      AND r.statut <> 'ANNULE'
      AND TRUNC(r.date_heure, 'MM') = TRUNC(SYSDATE, 'MM')
GROUP BY m.id, m.nom, m.prenom, m.specialite
ORDER BY nb_rdv_mois DESC;

-- Test :
-- SELECT * FROM v_rdv_par_medecin_mois;

-- ---------------------------------------------------------------------
-- 2. Médecins les plus sollicités (top N, toutes périodes confondues)
--    Utilisée ensuite côté Java pour le croisement avec MongoDB
--    (pathologies traitées par ces médecins).
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW v_medecins_plus_solicites AS
SELECT
    m.id            AS medecin_id,
    m.nom,
    m.prenom,
    m.specialite,
    COUNT(r.id)     AS nb_rdv_total
FROM medecin m
JOIN rendez_vous r ON r.medecin_id = m.id AND r.statut <> 'ANNULE'
GROUP BY m.id, m.nom, m.prenom, m.specialite
ORDER BY nb_rdv_total DESC;

-- Test :
-- SELECT * FROM v_medecins_plus_solicites FETCH FIRST 5 ROWS ONLY;
