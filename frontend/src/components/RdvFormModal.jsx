import { useEffect, useState } from 'react';
import Modal from './Modal';
import { Button, Input, Select, Textarea, FieldLabel, ErrorBanner } from './ui';
import { creerRendezVous, modifierRendezVous } from '../api/rendezVous';
import { extractErrorMessage } from '../api/client';
import { getMedecins, getPatients } from '../api/personnes';
import { formatDateInputValue } from '../utils/dateUtils';

export default function RdvFormModal({ open, onClose, onSaved, rdvExistant = null, medecinIdParDefaut, patientIdParDefaut }) {
  const [medecins, setMedecins] = useState([]);
  const [patients, setPatients] = useState([]);
  const [medecinId, setMedecinId] = useState('');
  const [patientId, setPatientId] = useState('');
  const [dateHeure, setDateHeure] = useState('');
  const [motif, setMotif] = useState('');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const estModification = !!rdvExistant;

  useEffect(() => {
    if (!open) return;
    setError(null);
    Promise.all([getMedecins(), getPatients()])
      .then(([m, p]) => {
        setMedecins(m);
        setPatients(p);
      })
      .catch((err) => setError(extractErrorMessage(err, 'Impossible de charger médecins/patients.')));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (rdvExistant) {
      setMedecinId(String(rdvExistant.medecin?.id ?? medecinIdParDefaut ?? ''));
      setPatientId(String(rdvExistant.patient?.id ?? patientIdParDefaut ?? ''));
      setDateHeure(formatDateInputValue(rdvExistant.dateHeure));
      setMotif(rdvExistant.motif ?? '');
    } else {
      setMedecinId(medecinIdParDefaut ? String(medecinIdParDefaut) : '');
      setPatientId(patientIdParDefaut ? String(patientIdParDefaut) : '');
      setDateHeure('');
      setMotif('');
    }
  }, [open, rdvExistant, medecinIdParDefaut, patientIdParDefaut]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const payload = {
      medecinId: Number(medecinId),
      patientId: Number(patientId),
      dateHeure, // format yyyy-MM-ddTHH:mm, accepté par LocalDateTime côté Spring (Jackson)
      motif,
    };
    try {
      if (estModification) {
        await modifierRendezVous(rdvExistant.id, payload);
      } else {
        await creerRendezVous(payload);
      }
      onSaved();
    } catch (err) {
      // Le trigger PL/SQL trg_rdv_anti_doublon renvoie ORA-20001 si le
      // créneau est déjà pris pour ce médecin -> message clair à l'utilisateur.
      setError(extractErrorMessage(err, 'Impossible d’enregistrer ce rendez-vous.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={estModification ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <FieldLabel>Médecin</FieldLabel>
          <Select value={medecinId} onChange={(e) => setMedecinId(e.target.value)} required>
            <option value="" disabled>Choisir un médecin</option>
            {medecins.map((m) => (
              <option key={m.id} value={m.id}>{m.prenom} {m.nom} — {m.specialite}</option>
            ))}
          </Select>
        </div>

        <div>
          <FieldLabel>Patient</FieldLabel>
          <Select value={patientId} onChange={(e) => setPatientId(e.target.value)} disabled={estModification} required>
            <option value="" disabled>Choisir un patient</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>
            ))}
          </Select>
          {estModification && (
            <p className="text-xs text-ink-soft mt-1.5">
              Le patient d’un rendez-vous existant ne peut pas être changé. Annulez ce rendez-vous
              et créez-en un nouveau si besoin.
            </p>
          )}
        </div>

        <div>
          <FieldLabel>Date et heure</FieldLabel>
          <Input
            type="datetime-local"
            value={dateHeure}
            onChange={(e) => setDateHeure(e.target.value)}
            min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
            required
          />
          <p className="text-xs text-ink-soft mt-1.5">
            La date doit être dans le futur (contrainte appliquée par le backend).
          </p>
        </div>

        <div>
          <FieldLabel>Motif de la consultation</FieldLabel>
          <Textarea
            rows={3}
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            placeholder="Ex : douleurs thoraciques, contrôle de routine…"
            required
          />
        </div>

        <ErrorBanner message={error} />

        <div className="flex justify-end gap-3 mt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Annuler</Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Enregistrement…' : estModification ? 'Enregistrer les modifications' : 'Créer le rendez-vous'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
