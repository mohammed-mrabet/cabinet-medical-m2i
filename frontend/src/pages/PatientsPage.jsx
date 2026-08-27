import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPatients } from '../api/personnes';
import { extractErrorMessage } from '../api/client';
import { Card, Spinner, ErrorBanner, EmptyState, Input } from '../components/ui';
import { calculerAge } from '../utils/dateUtils';

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recherche, setRecherche] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getPatients()
      .then(setPatients)
      .catch((err) => setError(extractErrorMessage(err, 'Impossible de charger les patients.')))
      .finally(() => setLoading(false));
  }, []);

  const filtres = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter(
      (p) => `${p.nom} ${p.prenom}`.toLowerCase().includes(q) || (p.telephone || '').includes(q)
    );
  }, [patients, recherche]);

  return (
    <div className="animate-fade-up">
      <header className="mb-8">
        <p className="font-mono text-[11px] tracking-[0.2em] text-sage uppercase mb-1">Oracle · PATIENT</p>
        <h1 className="font-display text-3xl text-ink">Patients</h1>
        <p className="text-sm text-ink-soft mt-1">Accédez au dossier et à l’historique complet de chaque patient.</p>
      </header>

      <div className="mb-5 max-w-sm">
        <Input
          placeholder="Rechercher un patient ou un téléphone…"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
        />
      </div>

      {error && <div className="mb-4"><ErrorBanner message={error} /></div>}

      <Card>
        {loading ? (
          <Spinner />
        ) : filtres.length === 0 ? (
          <EmptyState icon="☐" title="Aucun patient trouvé" subtitle="Essayez une autre recherche." />
        ) : (
          <ul className="divide-y divide-line">
            {filtres.map((p) => {
              const age = calculerAge(p.dateNaissance);
              return (
                <li key={p.id}>
                  <button
                    onClick={() => navigate(`/patients/${p.id}`)}
                    className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-paper-dim transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-sage-light text-sage-dark flex items-center justify-center font-display font-semibold shrink-0">
                      {p.prenom?.[0]}{p.nom?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-ink">{p.prenom} {p.nom}</p>
                      <p className="text-xs text-ink-soft mt-0.5">
                        {age != null ? `${age} ans` : ''} {p.telephone ? `· ${p.telephone}` : ''} {p.email ? `· ${p.email}` : ''}
                      </p>
                    </div>
                    <span aria-hidden="true" className="text-ink-soft">→</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
