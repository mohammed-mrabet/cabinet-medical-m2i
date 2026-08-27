package ma.oujda.cabinetmedical.service;

import lombok.RequiredArgsConstructor;
import ma.oujda.cabinetmedical.dto.DashboardDTO;
import ma.oujda.cabinetmedical.repository.oracle.StatistiquesDao;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service du tableau de bord (réservé aux médecins / Admin métier).
 * <p>
 * Illustre l'architecture hybride : on interroge d'abord Oracle pour
 * obtenir le classement des médecins les plus sollicités (données
 * transactionnelles fiables), puis on interroge MongoDB pour récupérer,
 * pour chacun de ces médecins, les pathologies qu'ils traitent
 * (données flexibles des consultations). Le croisement se fait en
 * mémoire côté service Java, car Oracle et MongoDB sont deux systèmes
 * indépendants sans jointure native possible entre eux.
 */
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final StatistiquesDao statistiquesDao;
    private final DossierMedicalService dossierMedicalService;

    public DashboardDTO getTableauDeBord() {
        // 1. Source Oracle : RDV par médecin ce mois
        List<Map<String, Object>> rdvParMedecinCeMois = statistiquesDao.rdvParMedecinCeMois();

        // 2. Source MongoDB : pathologies les plus fréquentes (global)
        List<Map> pathologiesLesPlusFrequentes = dossierMedicalService.pathologiesLesPlusFrequentes(10);

        // 3. Croisement Oracle + MongoDB : top médecins sollicités
        //    + pathologies qu'ils traitent
        List<Map<String, Object>> topMedecins = statistiquesDao.medecinsLesPlusSollicites(5);

        List<DashboardDTO.MedecinSollicitéDTO> medecinsCroises = topMedecins.stream()
                .map(row -> {
                    Long medecinId = ((Number) row.get("MEDECIN_ID")).longValue();
                    List<Map> pathologies = dossierMedicalService.pathologiesParMedecin(medecinId);

                    return DashboardDTO.MedecinSollicitéDTO.builder()
                            .medecinId(medecinId)
                            .nom((String) row.get("NOM"))
                            .prenom((String) row.get("PRENOM"))
                            .specialite((String) row.get("SPECIALITE"))
                            .nbRdvTotal(((Number) row.get("NB_RDV_TOTAL")).longValue())
                            .pathologiesTraitees(pathologies)
                            .build();
                })
                .collect(Collectors.toList());

        return DashboardDTO.builder()
                .rdvParMedecinCeMois(rdvParMedecinCeMois)
                .pathologiesLesPlusFrequentes(pathologiesLesPlusFrequentes)
                .medecinsLesPlusSollicites(medecinsCroises)
                .build();
    }
}
