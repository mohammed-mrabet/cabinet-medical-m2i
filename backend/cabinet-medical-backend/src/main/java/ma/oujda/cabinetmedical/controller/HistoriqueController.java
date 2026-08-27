package ma.oujda.cabinetmedical.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import ma.oujda.cabinetmedical.dto.HistoriquePatientDTO;
import ma.oujda.cabinetmedical.service.HistoriquePatientService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Historique complet d'un patient = Oracle (identité + RDV) + MongoDB (dossier).
 */
@RestController
@RequestMapping("/api/historique")
@RequiredArgsConstructor
public class HistoriqueController {

    private final HistoriquePatientService historiquePatientService;

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<HistoriquePatientDTO> getHistorique(@PathVariable Long patientId,
                                                                HttpServletRequest httpRequest) {
        boolean estMedecin = httpRequest.isUserInRole("ROLE_MEDECIN");
        if (!estMedecin) {
            Long personneId = (Long) httpRequest.getAttribute("personneId");
            if (personneId == null || !personneId.equals(patientId)) {
                throw new AccessDeniedException(
                        "Accès refusé : vous ne pouvez consulter que votre propre historique.");
            }
        }
        return ResponseEntity.ok(historiquePatientService.getHistoriqueComplet(patientId));
    }
}
