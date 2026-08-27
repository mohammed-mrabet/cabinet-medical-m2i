import { useEffect, useState } from 'react';
import { getTableauDeBord } from '../api/historiqueDashboard';
import { extractErrorMessage } from '../api/client';
import { Card, Spinner, ErrorBanner, EmptyState } from '../components/ui';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

const PIE_COLORS = ['#3E6B5C', '#C77B4A', '#B3473D', '#44545A', '#A85F34', '#2E5246'];

function StatCard({ eyebrow, eyebrowColor, title, children, empty }) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="font-display text-lg text-ink">{title}</h2>
        <span className={`text-[10px] font-mono uppercase tracking-wide px-2 py-0.5 rounded-pill ${eyebrowColor}`}>
          {eyebrow}
        </span>
      </div>
      {empty ? <EmptyState icon="▤" title="Pas encore de données" /> : children}
    </Card>
  );
}

// La vue Oracle v_rdv_par_medecin_mois et le JdbcTemplate renvoient des
// Map<String,Object> dont les clés sont les noms de colonnes Oracle EN
// MAJUSCULES (MEDECIN_ID, NOM, PRENOM, SPECIALITE, NB_RDV_MOIS...).
function nomMedecin(row) {
  const nom = row.NOM ?? row.nom ?? '';
  const prenom = row.PRENOM ?? row.prenom ?? '';
  return `${prenom} ${nom}`.trim() || '—';
}

// Les agrégations MongoDB (group by diagnostic) renvoient des documents
// { _id: "<diagnostic>", occurrences: N } — _id porte la clé de regroupement.
function libellePathologie(row) {
  return row._id ?? row.diagnostic ?? 'Non renseigné';
}

// Prépare les données du pie chart : tri par occurrences décroissantes, puis
// regroupe les catégories les moins fréquentes sous "Autres" au-delà d'un
// certain nombre, pour que le graphique reste lisible même quand beaucoup
// de diagnostics distincts ont chacun très peu d'occurrences (cas attendu
// avec un petit jeu de données de test : chaque diagnostic à 1 occurrence
// donne mécaniquement des parts égales, ce n'est pas un bug du graphique).
const MAX_CATEGORIES_AFFICHEES = 6;
function preparerDonneesPie(pathologies) {
  const triees = [...pathologies].sort((a, b) => b.occurrences - a.occurrences);
  if (triees.length <= MAX_CATEGORIES_AFFICHEES) return triees;

  const principales = triees.slice(0, MAX_CATEGORIES_AFFICHEES - 1);
  const reste = triees.slice(MAX_CATEGORIES_AFFICHEES - 1);
  const totalReste = reste.reduce((sum, p) => sum + p.occurrences, 0);
  return [...principales, { diagnostic: `Autres (${reste.length} diagnostics)`, occurrences: totalReste }];
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getTableauDeBord()
      .then(setData)
      .catch((err) => setError(extractErrorMessage(err, 'Impossible de charger le tableau de bord.')))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Calcul des statistiques croisées…" />;
  if (error) return <ErrorBanner message={error} />;
  if (!data) return null;

  const rdvParMedecin = (data.rdvParMedecinCeMois || []).map((row) => ({
    nomComplet: nomMedecin(row),
    nbRdvMois: Number(row.NB_RDV_MOIS ?? row.nb_rdv_mois ?? 0),
  }));

  const pathologiesFrequentes = preparerDonneesPie(
    (data.pathologiesLesPlusFrequentes || []).map((row) => ({
      diagnostic: libellePathologie(row),
      occurrences: Number(row.occurrences ?? row.OCCURRENCES ?? 0),
    }))
  );

  const medecinsSollicites = data.medecinsLesPlusSollicites || [];

  return (
    <div className="animate-fade-up">
      <header className="mb-8">
        <p className="font-mono text-[11px] tracking-[0.2em] text-sage uppercase mb-1">Espace administrateur</p>
        <h1 className="font-display text-3xl text-ink">Tableau de bord</h1>
        <p className="text-sm text-ink-soft mt-1">
          Vue croisée du cabinet : planification (Oracle) et mémoire clinique (MongoDB).
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <StatCard
          title="Rendez-vous par médecin ce mois"
          eyebrow="Oracle"
          eyebrowColor="text-sage bg-sage-light"
          empty={rdvParMedecin.length === 0}
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={rdvParMedecin} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0DACB" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: '#44545A' }} />
              <YAxis
                type="category"
                dataKey="nomComplet"
                width={120}
                tick={{ fontSize: 12, fill: '#1B2A2F' }}
              />
              <Tooltip contentStyle={{ fontSize: 13, borderRadius: 8, border: '1px solid #E0DACB' }} />
              <Bar dataKey="nbRdvMois" name="RDV ce mois" fill="#3E6B5C" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </StatCard>

        <StatCard
          title="Pathologies les plus fréquentes"
          eyebrow="MongoDB"
          eyebrowColor="text-clay-dark bg-clay-light"
          empty={pathologiesFrequentes.length === 0}
        >
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full sm:w-[200px] shrink-0">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pathologiesFrequentes}
                    dataKey="occurrences"
                    nameKey="diagnostic"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={85}
                    paddingAngle={2}
                  >
                    {pathologiesFrequentes.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} consultation${value > 1 ? 's' : ''}`, name]}
                    contentStyle={{ fontSize: 13, borderRadius: 8, border: '1px solid #E0DACB' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Légende textuelle avec compte exact : plus lisible que des
                labels collés au cercle, surtout quand plusieurs diagnostics
                ont le même nombre d'occurrences (parts visuellement égales). */}
            <ul className="flex-1 w-full min-w-0 text-sm space-y-1.5">
              {(() => {
                const total = pathologiesFrequentes.reduce((s, p) => s + p.occurrences, 0);
                return pathologiesFrequentes.map((p, i) => (
                  <li key={i} className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                    />
                    <span className="text-ink truncate min-w-0 flex-1" title={p.diagnostic}>{p.diagnostic}</span>
                    <span className="text-ink-soft font-mono text-xs shrink-0 whitespace-nowrap">
                      {p.occurrences} · {total > 0 ? Math.round((p.occurrences / total) * 100) : 0}%
                    </span>
                  </li>
                ));
              })()}
            </ul>
          </div>
        </StatCard>
      </div>

      <StatCard
        title="Médecins les plus sollicités et pathologies traitées"
        eyebrow="Oracle + MongoDB · croisé"
        eyebrowColor="text-brick bg-brick-light"
        empty={medecinsSollicites.length === 0}
      >
        <div className="flex flex-col gap-4">
          {medecinsSollicites.map((m, i) => (
            <div key={m.medecinId ?? i} className="flex items-start gap-4 pb-4 border-b border-line last:border-0 last:pb-0">
              <div className="w-10 h-10 rounded-full bg-ink text-paper flex items-center justify-center font-display font-semibold shrink-0">
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="font-medium text-ink">
                    Dr. {m.prenom} {m.nom}{m.specialite ? ` — ${m.specialite}` : ''}
                  </p>
                  <span className="text-xs font-mono text-ink-soft">
                    {m.nbRdvTotal} RDV au total
                  </span>
                </div>
                {Array.isArray(m.pathologiesTraitees) && m.pathologiesTraitees.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {m.pathologiesTraitees.map((p, j) => (
                      <span key={j} className="text-xs bg-paper-dim text-ink-soft px-2.5 py-1 rounded-pill">
                        {libellePathologie(p)} ({p.occurrences ?? p.OCCURRENCES ?? 0})
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </StatCard>
    </div>
  );
}
