package ma.oujda.cabinetmedical.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.oujda.cabinetmedical.dto.ConsultationRequest;
import ma.oujda.cabinetmedical.mongo.DossierMedical;
import ma.oujda.cabinetmedical.service.DossierMedicalService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Gestion des dossiers médicaux (MongoDB).
 * <p>
 * - MEDECIN (Admin) : peut créer un dossier et ajouter des consultations.
 * - PATIENT (User) : peut UNIQUEMENT consulter son propre dossier en
 *   lecture seule (vérification via "personneId" du token JWT).
 */
@RestController
@RequestMapping("/api/dossiers")
@RequiredArgsConstructor
public class DossierMedicalController {

    private final DossierMedicalService dossierMedicalService;

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<DossierMedical> getDossier(@PathVariable Long patientId,
                                                       HttpServletRequest httpRequest) {
        verifierAccesPatient(patientId, httpRequest);
        return ResponseEntity.ok(dossierMedicalService.getDossierParPatient(patientId));
    }

    @PostMapping("/patient/{patientId}")
    @PreAuthorize("hasRole('MEDECIN')")
    public ResponseEntity<DossierMedical> creerDossier(@PathVariable Long patientId) {
        return ResponseEntity.ok(dossierMedicalService.creerDossierSiAbsent(patientId));
    }

    @PostMapping("/patient/{patientId}/consultations")
    @PreAuthorize("hasRole('MEDECIN')")
    public ResponseEntity<DossierMedical> ajouterConsultation(
            @PathVariable Long patientId,
            @Valid @RequestBody ConsultationRequest request) {
        return ResponseEntity.ok(dossierMedicalService.ajouterConsultation(patientId, request));
    }

    private void verifierAccesPatient(Long patientId, HttpServletRequest httpRequest) {
        boolean estMedecin = httpRequest.isUserInRole("ROLE_MEDECIN");
        if (estMedecin) {
            return;
        }
        Long personneId = (Long) httpRequest.getAttribute("personneId");
        if (personneId == null || !personneId.equals(patientId)) {
            throw new AccessDeniedException(
                    "Accès refusé : vous ne pouvez consulter que votre propre dossier médical.");
        }
    }
}
