package ma.oujda.cabinetmedical.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entité Oracle : MEDECIN.
 * Profil "Admin" de l'application : gère ses RDV et les dossiers patients.
 */
@Entity
@Table(name = "MEDECIN")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Medecin {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_medecin_gen")
    @SequenceGenerator(name = "seq_medecin_gen", sequenceName = "SEQ_MEDECIN", allocationSize = 1)
    @Column(name = "ID")
    private Long id;

    @Column(name = "NOM", nullable = false, length = 50)
    private String nom;

    @Column(name = "PRENOM", nullable = false, length = 50)
    private String prenom;

    @Column(name = "SPECIALITE", nullable = false, length = 80)
    private String specialite;

    @Column(name = "EMAIL", nullable = false, unique = true, length = 120)
    private String email;

    @Column(name = "DATE_CREATION")
    private LocalDateTime dateCreation;

    @PrePersist
    public void prePersist() {
        if (dateCreation == null) {
            dateCreation = LocalDateTime.now();
        }
    }
}
