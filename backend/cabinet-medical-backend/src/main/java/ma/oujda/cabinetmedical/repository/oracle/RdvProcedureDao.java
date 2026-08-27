package ma.oujda.cabinetmedical.repository.oracle;

import ma.oujda.cabinetmedical.dto.RdvDuJourDTO;
import oracle.jdbc.OracleTypes;
import org.springframework.jdbc.core.SqlOutParameter;
import org.springframework.jdbc.core.SqlParameter;
import org.springframework.jdbc.core.simple.SimpleJdbcCall;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.Timestamp;
import java.sql.Types;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Repository
public class RdvProcedureDao {

    private final SimpleJdbcCall jdbcCall;

    public RdvProcedureDao(DataSource dataSource) {
        this.jdbcCall = new SimpleJdbcCall(dataSource)
                .withCatalogName("PKG_RDV")
                .withProcedureName("RDV_DU_JOUR")
                .declareParameters(
                        new SqlParameter("P_MEDECIN_ID", Types.NUMERIC),
                        new SqlParameter("P_DATE", Types.DATE),
                        new SqlOutParameter("P_RESULTAT", OracleTypes.CURSOR)
                )
                .withoutProcedureColumnMetaDataAccess();  // ← AJOUTER CETTE LIGNE !
    }

    @SuppressWarnings("unchecked")
    public List<RdvDuJourDTO> getRdvDuJour(Long medecinId, LocalDate date) {
        Map<String, Object> result = jdbcCall.execute(
                Map.of(
                        "P_MEDECIN_ID", medecinId,
                        "P_DATE", Timestamp.valueOf(date.atStartOfDay())
                )
        );

        List<Map<String, Object>> rows = (List<Map<String, Object>>) result.get("P_RESULTAT");

        return rows.stream()
                .map(row -> RdvDuJourDTO.builder()
                        .rdvId(((Number) row.get("RDV_ID")).longValue())
                        .dateHeure(((Timestamp) row.get("DATE_HEURE")).toLocalDateTime())
                        .motif((String) row.get("MOTIF"))
                        .statut((String) row.get("STATUT"))
                        .patientId(((Number) row.get("PATIENT_ID")).longValue())
                        .patientNom((String) row.get("PATIENT_NOM"))
                        .patientPrenom((String) row.get("PATIENT_PRENOM"))
                        .patientTelephone((String) row.get("PATIENT_TELEPHONE"))
                        .build())
                .collect(Collectors.toList());
    }
}