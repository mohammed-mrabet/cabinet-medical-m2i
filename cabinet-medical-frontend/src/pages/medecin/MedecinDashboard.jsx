import { useEffect, useState } from 'react'
import { dashboardService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import {
  BarChart2, Users, Activity, Database,
  TrendingUp, Award, Loader2, AlertCircle
} from 'lucide-react'

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="stat-card">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="text-white" size={22} />
      </div>
      <div>
        <div className="text-2xl font-bold text-navy-600">{value}</div>
        <div className="text-sm font-semibold text-gray-700">{label}</div>
        {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  )
}

export default function MedecinDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    dashboardService.get()
      .then(setData)
      .catch(e => setError(e.response?.data?.message || 'Erreur lors du chargement'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-teal-500" size={40} />
    </div>
  )
  if (error) return (
    <div className="flex items-center gap-3 bg-red-50 text-red-700 rounded-xl p-5">
      <AlertCircle size={22} /> {error}
    </div>
  )

  const totalRdv = data?.rdvParMedecinCeMois?.reduce((s, m) => s + (m.NB_RDV_MOIS || 0), 0) ?? 0
  const nbMedecins = data?.rdvParMedecinCeMois?.length ?? 0
  const topPathologie = data?.pathologiesLesPlusFrequentes?.[0]?._id ?? '—'

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-navy-600">Tableau de bord</h1>
        <p className="text-gray-500 mt-1">Vue d'ensemble du cabinet — données en temps réel</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BarChart2}  label="RDV ce mois"       value={totalRdv}      color="bg-teal-500"   sub="Source Oracle" />
        <StatCard icon={Users}      label="Médecins actifs"   value={nbMedecins}    color="bg-navy-600"   sub="Toutes spécialités" />
        <StatCard icon={Activity}   label="Pathologies uniques" value={data?.pathologiesLesPlusFrequentes?.length ?? 0} color="bg-violet-500" sub="Source MongoDB" />
        <StatCard icon={TrendingUp} label="Top pathologie"    value=""              color="bg-amber-500"  sub={topPathologie} />
      </div>

      {/* Section croisée */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* RDV par médecin ce mois (Oracle) */}
        <div className="card">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
              <Database size={16} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-navy-600">RDV par médecin — ce mois</h2>
              <p className="text-xs text-gray-400">Source Oracle</p>
            </div>
          </div>
          <div className="space-y-3">
            {data?.rdvParMedecinCeMois?.map(m => {
              const pct = totalRdv > 0 ? Math.round((m.NB_RDV_MOIS / totalRdv) * 100) : 0
              return (
                <div key={m.MEDECIN_ID}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-800">{m.NOM} {m.PRENOM}</span>
                    <span className="text-gray-500">{m.NB_RDV_MOIS} RDV · {pct}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-teal-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{m.SPECIALITE}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Pathologies les + fréquentes (MongoDB) */}
        <div className="card">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center">
              <Activity size={16} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-navy-600">Pathologies fréquentes</h2>
              <p className="text-xs text-gray-400">Source MongoDB</p>
            </div>
          </div>
          <div className="space-y-2">
            {data?.pathologiesLesPlusFrequentes?.map((p, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="w-7 h-7 flex items-center justify-center bg-violet-100 text-violet-700 rounded-full text-sm font-bold flex-shrink-0">
                  {i + 1}
                </span>
                <span className="text-sm font-medium text-gray-800 flex-1">{p._id}</span>
                <span className="text-xs font-semibold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
                  {p.occurrences} cas
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Médecins les plus sollicités + pathologies (croisement Oracle + MongoDB) */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
            <Award size={16} className="text-white" />
          </div>
          <div>
            <h2 className="font-bold text-navy-600">Médecins les plus sollicités + pathologies traitées</h2>
            <p className="text-xs text-gray-400">Croisement Oracle + MongoDB</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {data?.medecinsLesPlusSollicites?.map(m => (
            <div key={m.medecinId} className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-bold text-navy-600">{m.nom} {m.prenom}</div>
                  <div className="text-sm text-teal-600">{m.specialite}</div>
                </div>
                <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full">
                  {m.nbRdvTotal} RDV
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {m.pathologiesTraitees?.slice(0, 4).map((p, i) => (
                  <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {p._id}
                  </span>
                ))}
                {(m.pathologiesTraitees?.length ?? 0) > 4 && (
                  <span className="text-xs text-gray-400">+{m.pathologiesTraitees.length - 4} autres</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
