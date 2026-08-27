import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'

// Pages Auth
import LoginPage from './pages/auth/LoginPage'

// Pages Médecin
import MedecinLayout from './pages/medecin/MedecinLayout'
import MedecinDashboard from './pages/medecin/MedecinDashboard'
import MedecinRdvDuJour from './pages/medecin/MedecinRdvDuJour'
import MedecinPatients from './pages/medecin/MedecinPatients'
import MedecinPatientDetail from './pages/medecin/MedecinPatientDetail'
import MedecinRdvGestion from './pages/medecin/MedecinRdvGestion'

// Pages Patient
import PatientLayout from './pages/patient/PatientLayout'
import PatientAccueil from './pages/patient/PatientAccueil'
import PatientDossier from './pages/patient/PatientDossier'

// Guards
function RequireAuth({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}
function RequireMedecin({ children }) {
  const { user, isMedecin } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (!isMedecin) return <Navigate to="/patient" replace />
  return children
}
function RequirePatient({ children }) {
  const { user, isPatient } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (!isPatient) return <Navigate to="/medecin" replace />
  return children
}
function RootRedirect() {
  const { user, isMedecin } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return isMedecin ? <Navigate to="/medecin" replace /> : <Navigate to="/patient" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Espace Médecin */}
          <Route path="/medecin" element={<RequireMedecin><MedecinLayout /></RequireMedecin>}>
            <Route index element={<MedecinDashboard />} />
            <Route path="rdv-du-jour" element={<MedecinRdvDuJour />} />
            <Route path="rendez-vous" element={<MedecinRdvGestion />} />
            <Route path="patients" element={<MedecinPatients />} />
            <Route path="patients/:id" element={<MedecinPatientDetail />} />
          </Route>

          {/* Espace Patient */}
          <Route path="/patient" element={<RequirePatient><PatientLayout /></RequirePatient>}>
            <Route index element={<PatientAccueil />} />
            <Route path="dossier" element={<PatientDossier />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
