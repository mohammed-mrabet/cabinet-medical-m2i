package ma.oujda.cabinetmedical.entity;

/**
 * Rôles applicatifs : déterminent les droits d'accès
 * (Médecin = Admin métier, Patient = User en lecture seule sur ses données).
 */
public enum RoleUtilisateur {
    MEDECIN,
    PATIENT
}
