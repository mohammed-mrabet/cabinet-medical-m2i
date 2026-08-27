package ma.oujda.cabinetmedical.controller;

import lombok.RequiredArgsConstructor;
import ma.oujda.cabinetmedical.entity.Medecin;
import ma.oujda.cabinetmedical.exception.ResourceNotFoundException;
import ma.oujda.cabinetmedical.repository.oracle.MedecinRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medecins")
@RequiredArgsConstructor
public class MedecinController {

    private final MedecinRepository medecinRepository;

    @GetMapping
    public ResponseEntity<List<Medecin>> getAll() {
        return ResponseEntity.ok(medecinRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Medecin> getById(@PathVariable Long id) {
        Medecin medecin = medecinRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Médecin introuvable : id=" + id));
        return ResponseEntity.ok(medecin);
    }
}
