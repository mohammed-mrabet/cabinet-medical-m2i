import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getHistoriquePatient } from '../api/historiqueDashboard';
import { extractErrorMessage } from '../api/client';
import { Card, Button, Spinner, ErrorBanner, EmptyState } from '../components/ui';
import StatutBadge from '../components/StatutBadge';
import ConsultationCard from '../components/ConsultationCard';
import ConsultationFormModal from '../components/ConsultationFormModal';
import { formatDateHeure, calculerAge } from '../utils/dateUtils';
import { useMedecinsMap } from '../hooks/useMedecinsMap';

export default function PatientDetailPage() {
  const { patientId } = useParams();
  const { session, isMedecin } = useAuth();
  const navigate = useNavigate();
  const [historique, setHistorique] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const nomMedecinParId = useMedecinsMap();

  const charger = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHistoriquePatient(patientId);
      setHistorique(data);
    } catch (err) {
      setError(extractErrorMessage(err, 'Impossible de charger l’historique du patient.'));
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    charger();
  }, [charger]);

  if (loading) return <Spinner label="Lecture croisée Oracle + MongoDB…" />;
  if (error) return <ErrorBanner message={error} />;
  if (!historique) return null;

  const { patient, rendezVous = [], dossierMedical } = historique;
  const consultations = dossierMedical?.consultations || [];
  const age = patient ? calculerAge(patient.dateNaissance) : null;
  const consultationsTriees = [...consultations].sort((a, b) => new Date(b.date) - new Date(a.date));
  const rdvTries = [...rendezVous].sort((a, b) => new Date(b.dateHeure) - new Date(a.dateHeure));

  return (
    <div className="animate-fade-up">
      {isMedecin && (
        <button onClick={() => navigate('/patients')} className="text-sm text-ink-soft hover:text-ink mb-5 inline-flex items-center gap-1.5">
          ← Retour aux patients
        </button>
      )}

      <header className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-sage-light text-sage-dark flex items-center justify-center font-display text-xl font-semibold shrink-0">
            {patient?.prenom?.[0]}{patient?.nom?.[0]}
          </div>
          <div>
            <p className="font-mono text-[11px] tracking-[0.2em] text-sage uppercase mb-1">Dossier patient</p>
            <h1 className="font-display text-3xl text-ink">{patient?.prenom} {patient?.nom}</h1>
            <p className="text-sm text-ink-soft mt-1">
              {age != null && `${age} ans`} {patient?.telephone && `· ${patient.telephone}`} {patient?.email && `· ${patient.email}`}
            </p>
          </div>
        </div>
        {isMedecin && (
          <Button variant="clay" onClick={() => setModalOpen(true)}>+ Ajouter une consultation</Button>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Colonne Oracle : rendez-vous */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="font-display text-lg text-ink">Rendez-vous</h2>
            <span className="text-[10px] font-mono uppercase tracking-wide text-sage bg-sage-light px-2 py-0.5 rounded-pill">Oracle</span>
          </div>
          <Card className="p-0">
            {rdvTries.length === 0 ? (
              <EmptyState icon="▭" title="Aucun rendez-vous enregistré" />
            ) : (
              <ul className="divide-y divide-line">
                {rdvTries.map((rdv) => (
                  <li key={rdv.id} className="px-5 py-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-ink capitalize">{formatDateHeure(rdv.dateHeure)}</p>
                      <StatutBadge statut={rdv.statut} />
                    </div>
                    <p className="text-sm text-ink-soft mt-1">{rdv.motif}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </section>

        {/* Colonne MongoDB : consultations */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="font-display text-lg text-ink">Consultations</h2>
            <span className="text-[10px] font-mono uppercase tracking-wide text-clay-dark bg-clay-light px-2 py-0.5 rounded-pill">MongoDB</span>
          </div>
          {consultationsTriees.length === 0 ? (
            <Card>
              <EmptyState icon="☐" title="Aucune consultation enregistrée" subtitle="Le dossier médical de ce patient est encore vide." />
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {consultationsTriees.map((c, i) => (
                <ConsultationCard key={c._id || i} consultation={c} nomMedecinParId={nomMedecinParId} />
              ))}
            </div>
          )}
        </section>
      </div>

      {isMedecin && (
        <ConsultationFormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            charger();
          }}
          patientId={patientId}
          medecinId={session.personneId}
        />
      )}
    </div>
  );
}
