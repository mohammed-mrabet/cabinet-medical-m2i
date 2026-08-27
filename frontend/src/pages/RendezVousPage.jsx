import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getRdvParMedecin, getRdvParPatient, annulerRendezVous, marquerRendezVousEffectue } from '../api/rendezVous';
import { extractErrorMessage } from '../api/client';
import { Card, Button, Spinner, ErrorBanner, EmptyState, Select } from '../components/ui';
import StatutBadge from '../components/StatutBadge';
import RdvFormModal from '../components/RdvFormModal';
import { formatDateHeure } from '../utils/dateUtils';

export default function RendezVousPage() {
  const { session, isMedecin } = useAuth();
  const [rdvs, setRdvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [rdvEnEdition, setRdvEnEdition] = useState(null);
  const [filtreStatut, setFiltreStatut] = useState('TOUS');

  const charger = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = isMedecin
        ? await getRdvParMedecin(session.personneId)
        : await getRdvParPatient(session.personneId);
      const tries = [...data].sort((a, b) => new Date(b.dateHeure) - new Date(a.dateHeure));
      setRdvs(tries);
    } catch (err) {
      setError(extractErrorMessage(err, 'Impossible de charger les rendez-vous.'));
    } finally {
      setLoading(false);
    }
  }, [isMedecin, session.personneId]);

  useEffect(() => {
    charger();
  }, [charger]);

  const rdvsFiltres = useMemo(() => {
    if (filtreStatut === 'TOUS') return rdvs;
    return rdvs.filter((r) => r.statut === filtreStatut);
  }, [rdvs, filtreStatut]);

  async function handleAnnuler(rdvId) {
    if (!window.confirm('Confirmer l’annulation de ce rendez-vous ?')) return;
    try {
      await annulerRendezVous(rdvId);
      charger();
    } catch (err) {
      alert(extractErrorMessage(err, 'Annulation impossible.'));
    }
  }

  async function handleMarquerEffectue(rdvId) {
    if (!window.confirm('Marquer ce rendez-vous comme effectué ?')) return;
    try {
      await marquerRendezVousEffectue(rdvId);
      charger();
    } catch (err) {
      alert(extractErrorMessage(err, 'Impossible de marquer ce rendez-vous comme effectué.'));
    }
  }

  function ouvrirCreation() {
    setRdvEnEdition(null);
    setModalOpen(true);
  }

  function ouvrirModification(rdv) {
    setRdvEnEdition(rdv);
    setModalOpen(true);
  }

  return (
    <div className="animate-fade-up">
      <header className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <p className="font-mono text-[11px] tracking-[0.2em] text-sage uppercase mb-1">Oracle · RENDEZ_VOUS</p>
          <h1 className="font-display text-3xl text-ink">
            {isMedecin ? 'Tous les rendez-vous' : 'Mes rendez-vous'}
          </h1>
          <p className="text-sm text-ink-soft mt-1">
            {isMedecin ? 'Gérez la planification de vos consultations.' : 'Consultez l’historique et le détail de vos visites.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filtreStatut} onChange={(e) => setFiltreStatut(e.target.value)} className="w-auto">
            <option value="TOUS">Tous les statuts</option>
            <option value="CONFIRME">Confirmés</option>
            <option value="EFFECTUE">Effectués</option>
            <option value="ANNULE">Annulés</option>
          </Select>
          {isMedecin && <Button variant="clay" onClick={ouvrirCreation}>+ Nouveau rendez-vous</Button>}
        </div>
      </header>

      {error && <div className="mb-4"><ErrorBanner message={error} /></div>}

      <Card>
        {loading ? (
          <Spinner />
        ) : rdvsFiltres.length === 0 ? (
          <EmptyState icon="▭" title="Aucun rendez-vous à afficher" subtitle="Modifiez le filtre ou créez un nouveau rendez-vous." />
        ) : (
          <ul className="divide-y divide-line">
            {rdvsFiltres.map((rdv) => (
              <li key={rdv.id} className="flex items-center gap-5 px-6 py-4 flex-wrap">
                <div className="min-w-[200px]">
                  <p className="text-sm font-medium text-ink capitalize">{formatDateHeure(rdv.dateHeure)}</p>
                </div>
                <div className="flex-1 min-w-[180px]">
                  <p className="text-sm text-ink">{rdv.motif}</p>
                  {isMedecin && rdv.patient && (
                    <p className="text-xs text-ink-soft mt-0.5">Patient : {rdv.patient.prenom} {rdv.patient.nom}</p>
                  )}
                  {!isMedecin && rdv.medecin && (
                    <p className="text-xs text-ink-soft mt-0.5">Dr. {rdv.medecin.prenom} {rdv.medecin.nom} — {rdv.medecin.specialite}</p>
                  )}
                </div>
                <StatutBadge statut={rdv.statut} />
                {isMedecin && rdv.statut === 'CONFIRME' && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => ouvrirModification(rdv)}>Modifier</Button>
                    <Button size="sm" variant="subtle" onClick={() => handleMarquerEffectue(rdv.id)}>Marquer effectué</Button>
                    <Button size="sm" variant="ghost" onClick={() => handleAnnuler(rdv.id)}>Annuler</Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      {isMedecin && (
        <RdvFormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            charger();
          }}
          rdvExistant={rdvEnEdition}
          medecinIdParDefaut={session.personneId}
        />
      )}
    </div>
  );
}
