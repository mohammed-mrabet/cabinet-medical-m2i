package ma.oujda.cabinetmedical.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.oujda.cabinetmedical.dto.RdvDuJourDTO;
import ma.oujda.cabinetmedical.dto.RendezVousRequest;
import ma.oujda.cabinetmedical.entity.RendezVous;
import ma.oujda.cabinetmedical.service.RendezVousService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Gestion des RDV (Oracle).
 * <p>
 * Règles d'accès (gestion de session, voir cahier des charges) :
 * - MEDECIN : peut créer/modifier/annuler des RDV, voir ses RDV du jour.
 * - PATIENT : peut consulter (lecture seule) UNIQUEMENT ses propres RDV.
 *   On compare systématiquement le patientId demandé au "personneId"
 *   injecté dans la requête par le JwtAuthenticationFilter, pour
 *   empêcher un patient d'accéder aux RDV d'un autre patient.
 */
@RestController
@RequestMapping("/api/rendez-vous")
@RequiredArgsConstructor
public class RendezVousController {

    private final RendezVousService rendezVousService;

    @PostMapping
    @PreAuthorize("hasRole('MEDECIN')")
    public ResponseEntity<RendezVous> creer(@Valid @RequestBody RendezVousRequest request) {
        return ResponseEntity.ok(rendezVousService.creerRendezVous(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('MEDECIN')")
    public ResponseEntity<RendezVous> modifier(@PathVariable Long id,
                                                @Valid @RequestBody RendezVousRequest request) {
        return ResponseEntity.ok(rendezVousService.modifierRendezVous(id, request));
    }

    @PatchMapping("/{id}/annuler")
    @PreAuthorize("hasRole('MEDECIN')")
    public ResponseEntity<RendezVous> annuler(@PathVariable Long id) {
        return ResponseEntity.ok(rendezVousService.annulerRendezVous(id));
    }
    
    @PatchMapping("/{id}/effectuer")
    @PreAuthorize("hasRole('MEDECIN')")
    public ResponseEntity<RendezVous> marquerEffectue(@PathVariable Long id) {
        return ResponseEntity.ok(rendezVousService.marquerEffectue(id));
    }
    
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<RendezVous>> getParPatient(@PathVariable Long patientId,
                                                            HttpServletRequest httpRequest) {
        verifierAccesPatient(patientId, httpRequest);
        return ResponseEntity.ok(rendezVousService.getRdvParPatient(patientId));
    }

    @GetMapping("/medecin/{medecinId}")
    @PreAuthorize("hasRole('MEDECIN')")
    public ResponseEntity<List<RendezVous>> getParMedecin(@PathVariable Long medecinId) {
        return ResponseEntity.ok(rendezVousService.getRdvParMedecin(medecinId));
    }

    /**
     * "Médecin connecté voit uniquement ses patients du jour" :
     * appelle la procédure stockée PL/SQL PKG_RDV.RDV_DU_JOUR.
     */
    @GetMapping("/medecin/{medecinId}/aujourdhui")
    @PreAuthorize("hasRole('MEDECIN')")
    public ResponseEntity<List<RdvDuJourDTO>> getRdvDuJour(@PathVariable Long medecinId) {
        return ResponseEntity.ok(rendezVousService.getRdvDuJourPourMedecin(medecinId));
    }

    /**
     * Vérifie qu'un PATIENT authentifié ne consulte que ses propres RDV.
     * Un MEDECIN authentifié peut consulter les RDV de n'importe quel patient.
     */
    private void verifierAccesPatient(Long patientId, HttpServletRequest httpRequest) {
        boolean estMedecin = httpRequest.isUserInRole("ROLE_MEDECIN");
        if (estMedecin) {
            return;
        }
        Long personneId = (Long) httpRequest.getAttribute("personneId");
        if (personneId == null || !personneId.equals(patientId)) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Accès refusé : vous ne pouvez consulter que vos propres rendez-vous.");
        }
    }
}
