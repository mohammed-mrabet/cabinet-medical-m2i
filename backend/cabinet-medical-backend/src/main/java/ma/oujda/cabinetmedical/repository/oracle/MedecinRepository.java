package ma.oujda.cabinetmedical.repository.oracle;

import ma.oujda.cabinetmedical.entity.Medecin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MedecinRepository extends JpaRepository<Medecin, Long> {
    Optional<Medecin> findByEmail(String email);
}
