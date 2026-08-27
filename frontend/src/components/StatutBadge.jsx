const STYLES = {
  CONFIRME: { bg: 'bg-sage-light', text: 'text-sage-dark', label: 'Confirmé' },
  ANNULE: { bg: 'bg-brick-light', text: 'text-brick', label: 'Annulé' },
  EFFECTUE: { bg: 'bg-clay-light', text: 'text-clay-dark', label: 'Effectué' },
};

export default function StatutBadge({ statut }) {
  const s = STYLES[statut] || { bg: 'bg-paper-dim', text: 'text-ink-soft', label: statut || '—' };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-xs font-semibold tracking-wide ${s.bg} ${s.text}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {s.label}
    </span>
  );
}
