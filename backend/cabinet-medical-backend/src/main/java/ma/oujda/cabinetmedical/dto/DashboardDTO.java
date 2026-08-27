package ma.oujda.cabinetmedical.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardDTO {

    // Source Oracle : nombre de RDV par médecin ce mois
    private List<Map<String, Object>> rdvParMedecinCeMois;

    // Source MongoDB : pathologies les plus fréquentes
    private List<Map> pathologiesLesPlusFrequentes;

    // Croisement Oracle + MongoDB : médecins les plus sollicités
    // accompagnés des pathologies qu'ils traitent
    private List<MedecinSollicitéDTO> medecinsLesPlusSollicites;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MedecinSollicitéDTO {
        private Long medecinId;
        private String nom;
        private String prenom;
        private String specialite;
        private long nbRdvTotal;
        private List<Map> pathologiesTraitees;
    }
}
