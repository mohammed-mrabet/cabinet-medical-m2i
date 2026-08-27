package ma.oujda.cabinetmedical.exception;

/**
 * Levée lorsque le trigger Oracle trg_rdv_anti_doublon (ORA-20001)
 * rejette la création/modification d'un rendez-vous, ou lorsqu'une
 * pré-vérification applicative détecte le même conflit avant d'aller
 * en base.
 */
public class CreneauIndisponibleException extends RuntimeException {
    public CreneauIndisponibleException(String message) {
        super(message);
    }
}
