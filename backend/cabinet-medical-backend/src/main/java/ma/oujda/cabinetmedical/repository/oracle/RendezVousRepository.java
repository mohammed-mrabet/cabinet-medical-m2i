package ma.oujda.cabinetmedical.repository.oracle;

import ma.oujda.cabinetmedical.entity.RendezVous;
import ma.oujda.cabinetmedical.entity.StatutRendezVous;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface RendezVousRepository extends JpaRepository<RendezVous, Long> {

    List<RendezVous> findByPatientIdOrderByDateHeureDesc(Long patientId);

    List<RendezVous> findByMedecinIdOrderByDateHeureDesc(Long medecinId);

    @Query("""
            SELECT r FROM RendezVous r
            WHERE r.medecin.id = :medecinId
              AND r.dateHeure >= :debutJournee
              AND r.dateHeure < :finJournee
              AND r.statut <> ma.oujda.cabinetmedical.entity.StatutRendezVous.ANNULE
            ORDER BY r.dateHeure ASC
            """)
    List<RendezVous> findRdvDuJourPourMedecin(
            @Param("medecinId") Long medecinId,
            @Param("debutJournee") LocalDateTime debutJournee,
            @Param("finJournee") LocalDateTime finJournee
    );

    @Query("""
            SELECT COUNT(r) FROM RendezVous r
            WHERE r.medecin.id = :medecinId
              AND r.statut <> :statutExclu
              AND r.dateHeure BETWEEN :debutMois AND :finMois
            """)
    long countRdvDuMoisPourMedecin(
            @Param("medecinId") Long medecinId,
            @Param("statutExclu") StatutRendezVous statutExclu,
            @Param("debutMois") LocalDateTime debutMois,
            @Param("finMois") LocalDateTime finMois
    );
}
