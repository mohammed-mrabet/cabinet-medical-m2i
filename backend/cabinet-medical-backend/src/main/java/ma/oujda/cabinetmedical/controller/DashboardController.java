package ma.oujda.cabinetmedical.controller;

import lombok.RequiredArgsConstructor;
import ma.oujda.cabinetmedical.dto.DashboardDTO;
import ma.oujda.cabinetmedical.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Tableau de bord, accessible uniquement à l'administrateur (MEDECIN).
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    @PreAuthorize("hasRole('MEDECIN')")
    public ResponseEntity<DashboardDTO> getTableauDeBord() {
        return ResponseEntity.ok(dashboardService.getTableauDeBord());
    }
}
