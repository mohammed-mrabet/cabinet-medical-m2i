import { useAuth } from '../context/AuthContext';
import TodayPage from './TodayPage';
import RendezVousPage from './RendezVousPage';

export default function HomePage() {
  const { isMedecin } = useAuth();
  return isMedecin ? <TodayPage /> : <RendezVousPage />;
}
