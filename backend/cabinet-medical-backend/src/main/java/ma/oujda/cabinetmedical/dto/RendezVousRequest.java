package ma.oujda.cabinetmedical.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RendezVousRequest {

    @NotNull(message = "La date et l'heure sont obligatoires")
    @Future(message = "La date du rendez-vous doit être dans le futur")
    private LocalDateTime dateHeure;

    @NotBlank(message = "Le motif est obligatoire")
    private String motif;

    @NotNull(message = "Le médecin est obligatoire")
    private Long medecinId;

    @NotNull(message = "Le patient est obligatoire")
    private Long patientId;
}
