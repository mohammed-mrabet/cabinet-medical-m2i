package ma.oujda.cabinetmedical.service;

import lombok.RequiredArgsConstructor;
import ma.oujda.cabinetmedical.dto.ConsultationRequest;
import ma.oujda.cabinetmedical.exception.ResourceNotFoundException;
import ma.oujda.cabinetmedical.mongo.DossierMedical;
import ma.oujda.cabinetmedical.repository.mongo.DossierMedicalRepository;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.springframework.data.mongodb.core.aggregation.Aggregation.*;

/**
 * Service de gestion des dossiers médicaux (MongoDB).
 * La recherche par patientId s'appuie sur l'index unique idx_patientId
 * (voir mongodb/01_init_dossiers.js) pour une récupération quasi
 * instantanée même avec un grand volume de dossiers.
 */
@Service
@RequiredArgsConstructor
public class DossierMedicalService {

    private final DossierMedicalRepository dossierMedicalRepository;
    private final MongoTemplate mongoTemplate;

    public DossierMedical getDossierParPatient(Long patientId) {
        return dossierMedicalRepository.findByPatientId(patientId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Aucun dossier médical trouvé pour le patient id=" + patientId));
    }

    @Transactional
    public DossierMedical creerDossierSiAbsent(Long patientId) {
        return dossierMedicalRepository.findByPatientId(patientId)
                .orElseGet(() -> dossierMedicalRepository.save(
                        DossierMedical.builder()
                                .patientId(patientId)
                                .consultations(new ArrayList<>())
                                .build()
                ));
    }

    @Transactional
    public DossierMedical ajouterConsultation(Long patientId, ConsultationRequest request) {
        DossierMedical dossier = dossierMedicalRepository.findByPatientId(patientId)
                .orElseGet(() -> DossierMedical.builder()
                        .patientId(patientId)
                        .consultations(new ArrayList<>())
                        .build());

        DossierMedical.Consultation consultation = DossierMedical.Consultation.builder()
                .date(request.getDate())
                .medecinId(request.getMedecinId())
                .diagnostic(request.getDiagnostic())
                .ordonnance(request.getOrdonnance())
                .analyses(request.getAnalyses() != null ? request.getAnalyses() : new ArrayList<>())
                .champsLibres(request.getChampsLibres() != null ? request.getChampsLibres() : Map.of())
                .build();

        dossier.getConsultations().add(consultation);
        return dossierMedicalRepository.save(dossier);
    }

    /**
     * Agrégation : nombre de consultations par mois et par médecin.
     * Utilisée par le tableau de bord (statistiques MongoDB).
     */
    public List<Map> nombreConsultationsParMoisEtMedecin() {
        Aggregation aggregation = newAggregation(
                unwind("consultations"),
                project()
                        .and("consultations.medecinId").as("medecinId")
                        .andExpression("year(consultations.date)").as("annee")
                        .andExpression("month(consultations.date)").as("mois"),
                group("medecinId", "annee", "mois").count().as("nombreConsultations"),
                sort(org.springframework.data.domain.Sort.Direction.DESC, "annee", "mois", "nombreConsultations")
        );

        AggregationResults<Map> results = mongoTemplate.aggregate(aggregation, "dossiers", Map.class);
        return results.getMappedResults();
    }

    /**
     * Agrégation : pathologies (diagnostics) les plus fréquentes (top N).
     */
    public List<Map> pathologiesLesPlusFrequentes(int limite) {
        Aggregation aggregation = newAggregation(
                unwind("consultations"),
                group("consultations.diagnostic").count().as("occurrences"),
                sort(org.springframework.data.domain.Sort.Direction.DESC, "occurrences"),
                limit(limite)
        );

        AggregationResults<Map> results = mongoTemplate.aggregate(aggregation, "dossiers", Map.class);
        return results.getMappedResults();
    }

    /**
     * Pathologies traitées par un médecin donné — utilisée pour le
     * croisement Oracle + MongoDB du tableau de bord
     * ("Médecins les plus sollicités + pathologies qu'ils traitent").
     */
    public List<Map> pathologiesParMedecin(Long medecinId) {
        Aggregation aggregation = newAggregation(
                unwind("consultations"),
                match(org.springframework.data.mongodb.core.query.Criteria
                        .where("consultations.medecinId").is(medecinId)),
                group("consultations.diagnostic").count().as("occurrences"),
                sort(org.springframework.data.domain.Sort.Direction.DESC, "occurrences")
        );

        AggregationResults<Map> results = mongoTemplate.aggregate(aggregation, "dossiers", Map.class);
        return results.getMappedResults();
    }
}
