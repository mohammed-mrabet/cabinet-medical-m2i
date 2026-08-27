package ma.oujda.cabinetmedical.controller;

import lombok.RequiredArgsConstructor;
import ma.oujda.cabinetmedical.entity.Patient;
import ma.oujda.cabinetmedical.exception.ResourceNotFoundException;
import ma.oujda.cabinetmedical.repository.oracle.PatientRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientRepository patientRepository;

    @GetMapping
    @PreAuthorize("hasRole('MEDECIN')")
    public ResponseEntity<List<Patient>> getAll() {
        return ResponseEntity.ok(patientRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Patient> getById(@PathVariable Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient introuvable : id=" + id));
        return ResponseEntity.ok(patient);
    }

    @PostMapping
    @PreAuthorize("hasRole('MEDECIN')")
    public ResponseEntity<Patient> creer(@RequestBody Patient patient) {
        return ResponseEntity.ok(patientRepository.save(patient));
    }
}
