import { useState } from 'react';
import Modal from './Modal';
import { Button, Input, Textarea, FieldLabel, ErrorBanner } from './ui';
import { ajouterConsultation } from '../api/dossiers';
import { extractErrorMessage } from '../api/client';

export default function ConsultationFormModal({ open, onClose, onSaved, patientId, medecinId }) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 16));
  const [diagnostic, setDiagnostic] = useState('');
  const [ordonnance, setOrdonnance] = useState('');
  const [analysesText, setAnalysesText] = useState('');
  const [champsLibres, setChampsLibres] = useState([]); // [{cle, valeur}] - démontre le schéma flexible
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  function ajouterChampLibre() {
    setChampsLibres((prev) => [...prev, { cle: '', valeur: '' }]);
  }
  function modifierChampLibre(index, partiel) {
    setChampsLibres((prev) => prev.map((c, i) => (i === index ? { ...c, ...partiel } : c)));
  }
  function supprimerChampLibre(index) {
    setChampsLibres((prev) => prev.filter((_, i) => i !== index));
  }

  function reinitialiser() {
    setDate(new Date().toISOString().slice(0, 16));
    setDiagnostic('');
    setOrdonnance('');
    setAnalysesText('');
    setChampsLibres([]);
    setError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const analyses = analysesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    // Construit la map champsLibres attendue par ConsultationRequest
    // (champs additionnels propres au schéma flexible MongoDB).
    const champsLibresMap = {};
    for (const { cle, valeur } of champsLibres) {
      if (cle.trim()) champsLibresMap[cle.trim()] = valeur;
    }

    const payload = {
      date, // yyyy-MM-ddTHH:mm -> LocalDateTime côté Spring
      medecinId,
      diagnostic,
      ordonnance,
      analyses,
      champsLibres: champsLibresMap,
    };

    try {
      await ajouterConsultation(patientId, payload);
      reinitialiser();
      onSaved();
    } catch (err) {
      setError(extractErrorMessage(err, 'Impossible d’enregistrer la consultation.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Ajouter une consultation" width="max-w-xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <FieldLabel>Date et heure de la consultation</FieldLabel>
          <Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>

        <div>
          <FieldLabel>Diagnostic</FieldLabel>
          <Textarea
            rows={2}
            value={diagnostic}
            onChange={(e) => setDiagnostic(e.target.value)}
            placeholder="Ex : Hypertension artérielle légère"
            required
          />
        </div>

        <div>
          <FieldLabel>Ordonnance</FieldLabel>
          <Textarea
            rows={3}
            value={ordonnance}
            onChange={(e) => setOrdonnance(e.target.value)}
            placeholder="Ex : Amlodipine 5mg, 1/jour pendant 30 jours"
          />
        </div>

        <div>
          <FieldLabel>Analyses (séparées par des virgules)</FieldLabel>
          <Input
            value={analysesText}
            onChange={(e) => setAnalysesText(e.target.value)}
            placeholder="Ex : NFS, Glycémie à jeun, Bilan lipidique"
          />
        </div>

        <div className="pt-2 border-t border-line">
          <div className="flex items-center justify-between mb-2">
            <FieldLabel>Champs additionnels (schéma flexible MongoDB)</FieldLabel>
          </div>
          <p className="text-xs text-ink-soft mb-3">
            Ajoutez des champs spécifiques à cette consultation (résultats radio, compte-rendu
            opératoire…). Ils seront enregistrés dans la map <code className="font-mono">champsLibres</code> du document MongoDB.
          </p>
          {champsLibres.map((champ, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <Input
                placeholder="Nom du champ (ex: resultatRadio)"
                value={champ.cle}
                onChange={(e) => modifierChampLibre(i, { cle: e.target.value })}
                className="flex-1"
              />
              <Input
                placeholder="Valeur"
                value={champ.valeur}
                onChange={(e) => modifierChampLibre(i, { valeur: e.target.value })}
                className="flex-1"
              />
              <Button type="button" variant="ghost" size="sm" onClick={() => supprimerChampLibre(i)}>✕</Button>
            </div>
          ))}
          <Button type="button" variant="subtle" size="sm" onClick={ajouterChampLibre}>+ Ajouter un champ</Button>
        </div>

        <ErrorBanner message={error} />

        <div className="flex justify-end gap-3 mt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Annuler</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer la consultation'}</Button>
        </div>
      </form>
    </Modal>
  );
}
