import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import RendezVousPage from './pages/RendezVousPage';
import PatientsPage from './pages/PatientsPage';
import PatientDetailPage from './pages/PatientDetailPage';
import DashboardPage from './pages/DashboardPage';
import MyDossierPage from './pages/MyDossierPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/connexion" element={<LoginPage />} />

          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<HomePage />} />
            <Route path="/rendez-vous" element={<RendezVousPage />} />

            {/* Médecin uniquement */}
            <Route
              path="/patients"
              element={
                <ProtectedRoute rolesAutorises={['MEDECIN']}>
                  <PatientsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patients/:patientId"
              element={
                <ProtectedRoute rolesAutorises={['MEDECIN']}>
                  <PatientDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute rolesAutorises={['MEDECIN']}>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Patient uniquement */}
            <Route
              path="/dossier"
              element={
                <ProtectedRoute rolesAutorises={['PATIENT']}>
                  <MyDossierPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
