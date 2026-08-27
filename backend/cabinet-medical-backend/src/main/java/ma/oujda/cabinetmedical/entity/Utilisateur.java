package ma.oujda.cabinetmedical.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entité Oracle : UTILISATEUR.
 * Compte de connexion applicatif, séparé de l'identité métier
 * (Medecin / Patient) pour respecter le principe de responsabilité unique :
 * - "personneId" pointe vers MEDECIN.ID ou PATIENT.ID selon le "role".
 * - Le mot de passe est haché en BCrypt (jamais stocké en clair).
 */
@Entity
@Table(name = "UTILISATEUR")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Utilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_utilisateur_gen")
    @SequenceGenerator(name = "seq_utilisateur_gen", sequenceName = "SEQ_UTILISATEUR", allocationSize = 1)
    @Column(name = "ID")
    private Long id;

    @Column(name = "LOGIN", nullable = false, unique = true, length = 60)
    private String login;

    @Column(name = "MOT_DE_PASSE", nullable = false, length = 255)
    private String motDePasse;

    @Enumerated(EnumType.STRING)
    @Column(name = "ROLE", nullable = false, length = 20)
    private RoleUtilisateur role;

    @Column(name = "PERSONNE_ID", nullable = false)
    private Long personneId;

    @Column(name = "ACTIF", length = 1)
    private String actif;

    @PrePersist
    public void prePersist() {
        if (actif == null) {
            actif = "O";
        }
    }

    public boolean isActif() {
        return "O".equalsIgnoreCase(actif);
    }
}
