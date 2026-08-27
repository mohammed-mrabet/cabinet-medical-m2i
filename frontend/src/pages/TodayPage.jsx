import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getRdvDuJour, annulerRendezVous, marquerRendezVousEffectue } from '../api/rendezVous';
import { extractErrorMessage } from '../api/client';
import { Card, Button, Spinner, ErrorBanner, EmptyState } from '../components/ui';
import StatutBadge from '../components/StatutBadge';
import { formatHeure } from '../utils/dateUtils';
import RdvFormModal from '../components/RdvFormModal';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function TodayPage() {
  const { session } = useAuth();
  const [rdvs, setRdvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const charger = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRdvDuJour(session.personneId);
      setRdvs(data);
    } catch (err) {
      setError(extractErrorMessage(err, 'Impossible de charger les rendez-vous du jour.'));
    } finally {
      setLoading(false);
    }
  }, [session.personneId]);

  useEffect(() => {
    charger();
  }, [charger]);

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

  const aujourdhui = format(new Date(), "EEEE d MMMM yyyy", { locale: fr });
  const enAttente = rdvs.filter((r) => r.statut !== 'ANNULE');

  return (
    <div className="animate-fade-up">
      <header className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <p className="font-mono text-[11px] tracking-[0.2em] text-sage uppercase mb-1">
            PKG_RDV.RDV_DU_JOUR · REF CURSOR
          </p>
          <h1 className="font-display text-3xl text-ink capitalize">{aujourdhui}</h1>
          <p className="text-sm text-ink-soft mt-1">
            {enAttente.length} rendez-vous actif{enAttente.length > 1 ? 's' : ''} aujourd’hui
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} variant="clay">
          + Nouveau rendez-vous
        </Button>
      </header>

      {error && <div className="mb-4"><ErrorBanner message={error} /></div>}

      <Card>
        {loading ? (
          <Spinner label="Appel de la procédure stockée…" />
        ) : rdvs.length === 0 ? (
          <EmptyState
            icon="☐"
            title="Aucun rendez-vous aujourd’hui"
            subtitle="Votre planning du jour est vide. Créez un rendez-vous pour l’y voir apparaître."
            action={<Button variant="primary" onClick={() => setModalOpen(true)}>+ Nouveau rendez-vous</Button>}
          />
        ) : (
          <ul className="divide-y divide-line">
            {rdvs.map((rdv) => (
              <li key={rdv.rdvId} className="flex items-center gap-5 px-6 py-4">
                <div className="w-16 text-center shrink-0">
                  <p className="font-display text-xl text-ink leading-none">{formatHeure(rdv.dateHeure)}</p>
                </div>
                <div className="w-px h-10 bg-line shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-ink">{rdv.patientNom} {rdv.patientPrenom}</p>
                  <p className="text-sm text-ink-soft truncate">{rdv.motif}</p>
                  {rdv.patientTelephone && (
                    <p className="text-xs text-ink-soft/70 font-mono mt-0.5">{rdv.patientTelephone}</p>
                  )}
                </div>
                <StatutBadge statut={rdv.statut} />
                {rdv.statut === 'CONFIRME' && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="subtle" onClick={() => handleMarquerEffectue(rdv.rdvId)}>
                      Marquer effectué
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleAnnuler(rdv.rdvId)}>
                      Annuler
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <RdvFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          setModalOpen(false);
          charger();
        }}
        medecinIdParDefaut={session.personneId}
      />
    </div>
  );
}
