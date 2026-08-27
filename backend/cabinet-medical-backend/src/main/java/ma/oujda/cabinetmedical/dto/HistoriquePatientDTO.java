package ma.oujda.cabinetmedical.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.oujda.cabinetmedical.entity.Patient;
import ma.oujda.cabinetmedical.entity.RendezVous;
import ma.oujda.cabinetmedical.mongo.DossierMedical;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HistoriquePatientDTO {
    
    // Utiliser des DTOs ou des types simples au lieu des entités JPA directes
    private Long patientId;
    private String patientNom;
    private String patientPrenom;
    private String patientEmail;
    private String patientTelephone;
    
    private List<RendezVousDTO> rendezVous;
    private DossierMedical dossierMedical;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RendezVousDTO {
        private Long id;
        private String dateHeure;
        private String motif;
        private String statut;
        private Long medecinId;
        private String medecinNom;
        private String medecinPrenom;
        private Long patientId;
    }
}