package ma.oujda.cabinetmedical.repository.oracle;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

/**
 * Accès en lecture aux vues statistiques Oracle créées dans
 * oracle/06_vues_statistiques.sql (V_RDV_PAR_MEDECIN_MOIS,
 * V_MEDECINS_PLUS_SOLICITES) pour alimenter le tableau de bord.
 */
@Repository
public class StatistiquesDao {

    private final JdbcTemplate jdbcTemplate;

    public StatistiquesDao(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Map<String, Object>> rdvParMedecinCeMois() {
        return jdbcTemplate.queryForList(
                "SELECT medecin_id, nom, prenom, specialite, nb_rdv_mois " +
                "FROM v_rdv_par_medecin_mois ORDER BY nb_rdv_mois DESC"
        );
    }

    public List<Map<String, Object>> medecinsLesPlusSollicites(int limite) {
        return jdbcTemplate.queryForList(
                "SELECT * FROM (" +
                "  SELECT medecin_id, nom, prenom, specialite, nb_rdv_total " +
                "  FROM v_medecins_plus_solicites ORDER BY nb_rdv_total DESC" +
                ") WHERE ROWNUM <= ?",
                limite
        );
    }
}
