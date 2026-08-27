import { useEffect, useState, useCallback } from 'react';
import { getHistoriquePatient } from '../api/historiqueDashboard';
import { extractErrorMessage } from '../api/client';
import { Card, Spinner, ErrorBanner, EmptyState } from './ui';
import StatutBadge from './StatutBadge';
import ConsultationCard from './ConsultationCard';
import { formatDateHeure, calculerAge } from '../utils/dateUtils';
import { useMedecinsMap } from '../hooks/useMedecinsMap';

export default function PatientDossierReadOnly({ patientId }) {
  const [historique, setHistorique] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const nomMedecinParId = useMedecinsMap();

  const charger = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHistoriquePatient(patientId);
      setHistorique(data);
    } catch (err) {
      setError(extractErrorMessage(err, 'Impossible de charger votre dossier.'));
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    charger();
  }, [charger]);

  if (loading) return <Spinner label="Lecture de votre dossier…" />;
  if (error) return <ErrorBanner message={error} />;
  if (!historique) return null;

  const { patient, rendezVous = [], dossierMedical } = historique;
  const consultations = dossierMedical?.consultations || [];
  const age = patient ? calculerAge(patient.dateNaissance) : null;
  const consultationsTriees = [...consultations].sort((a, b) => new Date(b.date) - new Date(a.date));
  const rdvTries = [...rendezVous].sort((a, b) => new Date(b.dateHeure) - new Date(a.dateHeure));

  return (
    <div className="animate-fade-up">
      <header className="mb-8">
        <p className="font-mono text-[11px] tracking-[0.2em] text-sage uppercase mb-1">Lecture seule</p>
        <h1 className="font-display text-3xl text-ink">Mon dossier médical</h1>
        <p className="text-sm text-ink-soft mt-1">
          {patient?.prenom} {patient?.nom}{age != null && ` · ${age} ans`}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="font-display text-lg text-ink">Mes rendez-vous</h2>
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

        <section>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="font-display text-lg text-ink">Mes consultations</h2>
            <span className="text-[10px] font-mono uppercase tracking-wide text-clay-dark bg-clay-light px-2 py-0.5 rounded-pill">MongoDB</span>
          </div>
          {consultationsTriees.length === 0 ? (
            <Card>
              <EmptyState icon="☐" title="Aucune consultation enregistrée" />
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
    </div>
  );
}
