package ma.oujda.cabinetmedical.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConsultationRequest {

    @NotNull(message = "La date de la consultation est obligatoire")
    private LocalDateTime date;

    @NotNull(message = "Le médecin est obligatoire")
    private Long medecinId;

    @NotBlank(message = "Le diagnostic est obligatoire")
    private String diagnostic;

    private String ordonnance;

    private List<String> analyses;

    // Champs additionnels libres (ex: resultatsRadio, compteRenduOperatoire...)
    private Map<String, Object> champsLibres;
}
