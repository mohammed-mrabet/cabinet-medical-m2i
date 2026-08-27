import { useAuth } from '../context/AuthContext';
import PatientDossierReadOnly from '../components/PatientDossierReadOnly';

export default function MyDossierPage() {
  const { session } = useAuth();
  return <PatientDossierReadOnly patientId={session.personneId} />;
}
