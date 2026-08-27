package ma.oujda.cabinetmedical.repository.oracle;

import ma.oujda.cabinetmedical.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByEmail(String email);
}
