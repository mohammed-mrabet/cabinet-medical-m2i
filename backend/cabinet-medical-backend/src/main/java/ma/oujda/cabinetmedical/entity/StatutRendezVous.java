package ma.oujda.cabinetmedical.entity;

/**
 * Statuts possibles d'un rendez-vous.
 * Correspond à la contrainte CHECK ck_rdv_statut côté Oracle.
 */
public enum StatutRendezVous {
    CONFIRME,
    ANNULE,
    EFFECTUE
}
