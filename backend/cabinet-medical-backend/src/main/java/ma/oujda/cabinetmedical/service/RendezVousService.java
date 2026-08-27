package ma.oujda.cabinetmedical.service;

import lombok.RequiredArgsConstructor;
import ma.oujda.cabinetmedical.dto.RdvDuJourDTO;
import ma.oujda.cabinetmedical.dto.RendezVousRequest;
import ma.oujda.cabinetmedical.entity.Medecin;
import ma.oujda.cabinetmedical.entity.Patient;
import ma.oujda.cabinetmedical.entity.RendezVous;
import ma.oujda.cabinetmedical.entity.StatutRendezVous;
import ma.oujda.cabinetmedical.exception.CreneauIndisponibleException;
import ma.oujda.cabinetmedical.exception.ResourceNotFoundException;
import ma.oujda.cabinetmedical.repository.oracle.MedecinRepository;
import ma.oujda.cabinetmedical.repository.oracle.PatientRepository;
import ma.oujda.cabinetmedical.repository.oracle.RdvProcedureDao;
import ma.oujda.cabinetmedical.repository.oracle.RendezVousRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

/**
 * Service de gestion des rendez-vous (Oracle).
 * <p>
 * Important : même si une vérification de créneau est faite ici côté
 * application (retour utilisateur rapide et clair), la garantie réelle
 * d'intégrité est assurée par le TRIGGER Oracle trg_rdv_anti_doublon,
 * qui protège la base même contre des accès concurrents ou un appel
 * direct en SQL hors de l'application (défense en profondeur).
 */
@Service
@RequiredArgsConstructor
public class RendezVousService {

    private final RendezVousRepository rendezVousRepository;
    private final MedecinRepository medecinRepository;
    private final PatientRepository patientRepository;
    private final RdvProcedureDao rdvProcedureDao;

    @Transactional
    public RendezVous creerRendezVous(RendezVousRequest request) {
        Medecin medecin = medecinRepository.findById(request.getMedecinId())
                .orElseThrow(() -> new ResourceNotFoundException("Médecin introuvable : id=" + request.getMedecinId()));

        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient introuvable : id=" + request.getPatientId()));

        // Pré-vérification applicative (UX rapide) ; le trigger Oracle
        // reste le garde-fou définitif en cas de concurrence.
        boolean creneauPris = rendezVousRepository.findByMedecinIdOrderByDateHeureDesc(medecin.getId()).stream()
                .anyMatch(r -> r.getStatut() != StatutRendezVous.ANNULE
                        && r.getDateHeure().equals(request.getDateHeure()));
        if (creneauPris) {
            throw new CreneauIndisponibleException(
                    "Ce médecin a déjà un rendez-vous actif à ce créneau (" + request.getDateHeure() + ").");
        }

        RendezVous rdv = RendezVous.builder()
                .dateHeure(request.getDateHeure())
                .motif(request.getMotif())
                .statut(StatutRendezVous.CONFIRME)
                .medecin(medecin)
                .patient(patient)
                .build();

        return rendezVousRepository.save(rdv);
    }

    @Transactional
    public RendezVous modifierRendezVous(Long id, RendezVousRequest request) {
        RendezVous rdv = rendezVousRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rendez-vous introuvable : id=" + id));

        Medecin medecin = medecinRepository.findById(request.getMedecinId())
                .orElseThrow(() -> new ResourceNotFoundException("Médecin introuvable : id=" + request.getMedecinId()));

        rdv.setDateHeure(request.getDateHeure());
        rdv.setMotif(request.getMotif());
        rdv.setMedecin(medecin);

        return rendezVousRepository.save(rdv);
    }

    @Transactional
    public RendezVous annulerRendezVous(Long id) {
        RendezVous rdv = rendezVousRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rendez-vous introuvable : id=" + id));
        rdv.setStatut(StatutRendezVous.ANNULE);
        return rendezVousRepository.save(rdv);
    }
    
    @Transactional
    public RendezVous marquerEffectue(Long id) {
        RendezVous rdv = rendezVousRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rendez-vous introuvable : id=" + id));
        rdv.setStatut(StatutRendezVous.EFFECTUE);
        return rendezVousRepository.save(rdv);
    }
    
    public List<RendezVous> getRdvParPatient(Long patientId) {
        return rendezVousRepository.findByPatientIdOrderByDateHeureDesc(patientId);
    }

    public List<RendezVous> getRdvParMedecin(Long medecinId) {
        return rendezVousRepository.findByMedecinIdOrderByDateHeureDesc(medecinId);
    }

    /**
     * Liste des RDV du jour pour un médecin, via la procédure stockée
     * PL/SQL PKG_RDV.RDV_DU_JOUR (triée par heure côté base).
     * Utilisée pour la gestion de session : "médecin connecté voit
     * uniquement ses patients du jour".
     */
    public List<RdvDuJourDTO> getRdvDuJourPourMedecin(Long medecinId) {
        return rdvProcedureDao.getRdvDuJour(medecinId, LocalDate.now());
    }

    public long countRdvDuMoisPourMedecin(Long medecinId) {
        LocalDateTime debutMois = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime finMois = LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth())
                .atTime(LocalTime.MAX);
        return rendezVousRepository.countRdvDuMoisPourMedecin(
                medecinId, StatutRendezVous.ANNULE, debutMois, finMois);
    }
}
