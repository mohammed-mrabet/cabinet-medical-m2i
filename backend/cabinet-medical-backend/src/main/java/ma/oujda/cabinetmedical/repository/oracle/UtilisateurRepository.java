package ma.oujda.cabinetmedical.repository.oracle;

import ma.oujda.cabinetmedical.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {
    Optional<Utilisateur> findByLogin(String login);
}
