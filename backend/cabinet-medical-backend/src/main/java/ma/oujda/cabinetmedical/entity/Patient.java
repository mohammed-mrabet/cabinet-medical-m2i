package ma.oujda.cabinetmedical.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entité Oracle : PATIENT.
 * Profil "User" de l'application : consulte ses RDV et son dossier (lecture seule).
 */
@Entity
@Table(name = "PATIENT")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_patient_gen")
    @SequenceGenerator(name = "seq_patient_gen", sequenceName = "SEQ_PATIENT", allocationSize = 1)
    @Column(name = "ID")
    private Long id;

    @Column(name = "NOM", nullable = false, length = 50)
    private String nom;

    @Column(name = "PRENOM", nullable = false, length = 50)
    private String prenom;

    @Column(name = "DATE_NAISSANCE", nullable = false)
    private LocalDate dateNaissance;

    @Column(name = "TELEPHONE", length = 20)
    private String telephone;

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
