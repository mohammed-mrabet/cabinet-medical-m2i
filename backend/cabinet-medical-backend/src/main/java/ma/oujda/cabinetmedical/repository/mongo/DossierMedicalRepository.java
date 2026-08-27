package ma.oujda.cabinetmedical.repository.mongo;

import ma.oujda.cabinetmedical.mongo.DossierMedical;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface DossierMedicalRepository extends MongoRepository<DossierMedical, String> {

    // Grâce à l'index unique sur patientId (voir mongodb/01_init_dossiers.js),
    // cette recherche est quasi instantanée même avec un grand volume de dossiers.
    Optional<DossierMedical> findByPatientId(Long patientId);

    boolean existsByPatientId(Long patientId);
}
