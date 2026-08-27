package ma.oujda.cabinetmedical.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    @NotBlank(message = "Le login est obligatoire")
    private String login;

    @NotBlank(message = "Le mot de passe est obligatoire")
    private String motDePasse;
}
