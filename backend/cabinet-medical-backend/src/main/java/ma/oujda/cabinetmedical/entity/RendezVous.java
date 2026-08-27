package ma.oujda.cabinetmedical.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entité Oracle : RENDEZ_VOUS.
 * Relie un Medecin et un Patient. Le trigger Oracle trg_rdv_anti_doublon
 * empêche deux RDV actifs au même créneau pour un même médecin
 * (vérification faite côté base, indépendamment de l'application).
 */
@Entity
@Table(name = "RENDEZ_VOUS")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RendezVous {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_rdv_gen")
    @SequenceGenerator(name = "seq_rdv_gen", sequenceName = "SEQ_RDV", allocationSize = 1)
    @Column(name = "ID")
    private Long id;

    @Column(name = "DATE_HEURE", nullable = false)
    private LocalDateTime dateHeure;

    @Column(name = "MOTIF", nullable = false, length = 200)
    private String motif;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUT", nullable = false, length = 20)
    private StatutRendezVous statut;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MEDECIN_ID", nullable = false)
    private Medecin medecin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PATIENT_ID", nullable = false)
    private Patient patient;

    @Column(name = "DATE_CREATION")
    private LocalDateTime dateCreation;

    @PrePersist
    public void prePersist() {
        if (dateCreation == null) {
            dateCreation = LocalDateTime.now();
        }
        if (statut == null) {
            statut = StatutRendezVous.CONFIRME;
        }
    }
}
