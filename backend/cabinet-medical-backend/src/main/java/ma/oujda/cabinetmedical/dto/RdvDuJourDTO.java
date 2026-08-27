package ma.oujda.cabinetmedical.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Résultat de l'appel à la procédure stockée Oracle PKG_RDV.RDV_DU_JOUR.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RdvDuJourDTO {
    private Long rdvId;
    private LocalDateTime dateHeure;
    private String motif;
    private String statut;
    private Long patientId;
    private String patientNom;
    private String patientPrenom;
    private String patientTelephone;
}
