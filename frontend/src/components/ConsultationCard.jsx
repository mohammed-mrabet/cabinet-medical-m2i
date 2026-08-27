import { formatDateCourte } from '../utils/dateUtils';

function humaniserCle(cle) {
  return cle
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/^./, (c) => c.toUpperCase());
}

function ValeurChamp({ valeur }) {
  if (Array.isArray(valeur)) {
    return (
      <ul className="list-disc list-inside text-sm text-ink-soft space-y-0.5">
        {valeur.map((v, i) => (
          <li key={i}>{typeof v === 'object' ? JSON.stringify(v) : String(v)}</li>
        ))}
      </ul>
    );
  }
  if (typeof valeur === 'object' && valeur !== null) {
    return <span className="text-sm text-ink-soft font-mono">{JSON.stringify(valeur)}</span>;
  }
  return <span className="text-sm text-ink-soft">{String(valeur)}</span>;
}

// Une consultation MongoDB a un noyau structuré (date, medecinId, diagnostic,
// ordonnance, analyses) et une map "champsLibres" pour les champs variables
// (résultats radio, compte-rendu opératoire...) — c'est ce qui matérialise
// le schéma flexible demandé par le sujet. On reste aussi tolérant aux
// documents insérés directement en mongosh (avant l'existence de l'API), où
// ces champs variables apparaissent à plat sur le document plutôt que dans
// une sous-map (ex: "remarques", "resultatsRadio", "carnetVaccinationAJour").
const CHAMPS_NOYAU = new Set(['date', 'medecinId', 'diagnostic', 'ordonnance', 'analyses', 'champsLibres', '_id']);

export default function ConsultationCard({ consultation, nomMedecinParId }) {
  const champsLibres = consultation?.champsLibres || {};
  const champsAPlat = Object.fromEntries(
    Object.entries(consultation || {}).filter(([cle]) => !CHAMPS_NOYAU.has(cle))
  );
  const champsSupplementaires = Object.entries({ ...champsAPlat, ...champsLibres }).filter(
    ([, val]) => val != null && val !== ''
  );
  const nomMedecin = nomMedecinParId?.(consultation?.medecinId);

  return (
    <div className="border border-line rounded-card p-5 bg-card">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <p className="font-display text-lg text-ink">{formatDateCourte(consultation.date)}</p>
        {(nomMedecin || consultation?.medecinId) && (
          <span className="text-xs font-medium text-sage-dark bg-sage-light px-2.5 py-1 rounded-pill">
            {nomMedecin ? `Dr. ${nomMedecin}` : `Médecin n°${consultation.medecinId}`}
          </span>
        )}
      </div>

      {consultation.diagnostic && (
        <div className="mb-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft mb-1">Diagnostic</p>
          <p className="text-sm text-ink">{consultation.diagnostic}</p>
        </div>
      )}

      {consultation.ordonnance && (
        <div className="mb-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft mb-1">Ordonnance</p>
          <p className="text-sm text-ink whitespace-pre-line">{consultation.ordonnance}</p>
        </div>
      )}

      {Array.isArray(consultation.analyses) && consultation.analyses.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft mb-1">Analyses</p>
          <div className="flex flex-wrap gap-1.5">
            {consultation.analyses.map((a, i) => (
              <span key={i} className="text-xs bg-clay-light text-clay-dark px-2.5 py-1 rounded-pill">
                {typeof a === 'object' ? JSON.stringify(a) : a}
              </span>
            ))}
          </div>
        </div>
      )}

      {champsSupplementaires.length > 0 && (
        <div className="mt-3 pt-3 border-t border-line space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft/70">
            Champs additionnels (schéma flexible)
          </p>
          {champsSupplementaires.map(([cle, val]) => (
            <div key={cle}>
              <p className="text-xs text-ink-soft/80 font-medium">{humaniserCle(cle)}</p>
              <ValeurChamp valeur={val} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
