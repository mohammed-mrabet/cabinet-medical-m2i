package ma.oujda.cabinetmedical.mongo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Document MongoDB : collection "dossiers".
 * <p>
 * Un dossier = un patient (patientId, clé logique vers PATIENT.ID en Oracle)
 * + la liste de ses consultations. Chaque consultation a un noyau commun
 * (date, médecin, diagnostic, ordonnance, analyses) mais peut accueillir
 * des champs additionnels variables (résultats radio, compte-rendu
 * opératoire...) grâce à la map "champsLibres" -> c'est ce qui matérialise
 * le schéma flexible demandé par le sujet, sans sacrifier le typage fort
 * sur les champs structurants.
 */
@Document(collection = "dossiers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DossierMedical {

    @Id
    private String id;

    @Indexed(unique = true)
    @Field("patientId")
    private Long patientId;

    @Builder.Default
    private List<Consultation> consultations = new ArrayList<>();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Consultation {
        private LocalDateTime date;
        private Long medecinId;
        private String diagnostic;
        private String ordonnance;

        @Builder.Default
        private List<String> analyses = new ArrayList<>();

        /**
         * Champs additionnels libres, propres à certaines spécialités ou
         * certains actes (ex: "resultatsRadio", "compteRenduOperatoire",
         * "carnetVaccinationAJour"...). Permet d'étendre sans migration.
         */
        @Builder.Default
        private Map<String, Object> champsLibres = new java.util.HashMap<>();
    }
}
