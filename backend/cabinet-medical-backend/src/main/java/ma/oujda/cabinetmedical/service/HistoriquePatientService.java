package ma.oujda.cabinetmedical.service;

import lombok.RequiredArgsConstructor;
import ma.oujda.cabinetmedical.dto.HistoriquePatientDTO;
import ma.oujda.cabinetmedical.dto.HistoriquePatientDTO.RendezVousDTO;
import ma.oujda.cabinetmedical.entity.Patient;
import ma.oujda.cabinetmedical.entity.RendezVous;
import ma.oujda.cabinetmedical.exception.ResourceNotFoundException;
import ma.oujda.cabinetmedical.mongo.DossierMedical;
import ma.oujda.cabinetmedical.repository.mongo.DossierMedicalRepository;
import ma.oujda.cabinetmedical.repository.oracle.PatientRepository;
import ma.oujda.cabinetmedical.repository.oracle.RendezVousRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HistoriquePatientService {

    private final PatientRepository patientRepository;
    private final RendezVousRepository rendezVousRepository;
    private final DossierMedicalRepository dossierMedicalRepository;

    public HistoriquePatientDTO getHistoriqueComplet(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient introuvable : id=" + patientId));

        List<RendezVous> rendezVous = rendezVousRepository.findByPatientIdOrderByDateHeureDesc(patientId);

        DossierMedical dossier = dossierMedicalRepository.findByPatientId(patientId)
                .orElse(DossierMedical.builder()
                        .patientId(patientId)
                        .consultations(new ArrayList<>())
                        .build());

        // Convertir les RDV en DTOs pour éviter les proxies Hibernate
        List<RendezVousDTO> rdvDTOs = rendezVous.stream()
                .map(this::toRendezVousDTO)
                .collect(Collectors.toList());

        return HistoriquePatientDTO.builder()
                .patientId(patient.getId())
                .patientNom(patient.getNom())
                .patientPrenom(patient.getPrenom())
                .patientEmail(patient.getEmail())
                .patientTelephone(patient.getTelephone())
                .rendezVous(rdvDTOs)
                .dossierMedical(dossier)
                .build();
    }

    private RendezVousDTO toRendezVousDTO(RendezVous rdv) {
        return RendezVousDTO.builder()
                .id(rdv.getId())
                .dateHeure(rdv.getDateHeure() != null ? rdv.getDateHeure().toString() : null)
                .motif(rdv.getMotif())
                .statut(rdv.getStatut() != null ? rdv.getStatut().name() : null)
                .medecinId(rdv.getMedecin() != null ? rdv.getMedecin().getId() : null)
                .medecinNom(rdv.getMedecin() != null ? rdv.getMedecin().getNom() : null)
                .medecinPrenom(rdv.getMedecin() != null ? rdv.getMedecin().getPrenom() : null)
                .patientId(rdv.getPatient() != null ? rdv.getPatient().getId() : null)
                .build();
    }
}