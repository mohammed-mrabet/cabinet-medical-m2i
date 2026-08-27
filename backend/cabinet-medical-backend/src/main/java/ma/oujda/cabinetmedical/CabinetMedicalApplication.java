package ma.oujda.cabinetmedical;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Point d'entrée de l'application Cabinet Médical.
 * <p>
 * Architecture hybride :
 * - Oracle (via Spring Data JPA) pour les données structurées et
 *   transactionnelles : Medecin, Patient, RendezVous, Utilisateur.
 * - MongoDB (via Spring Data MongoDB) pour les dossiers médicaux,
 *   dont la structure des consultations est volontairement flexible.
 */
@SpringBootApplication
public class CabinetMedicalApplication {

    public static void main(String[] args) {
        SpringApplication.run(CabinetMedicalApplication.class, args);
    }
}
