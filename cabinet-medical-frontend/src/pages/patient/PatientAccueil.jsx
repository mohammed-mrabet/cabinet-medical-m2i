import { useEffect, useState } from 'react'
import { rdvService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { Calendar, Clock, User, Info, Loader2, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

function StatutBadge({ statut }) {
  const map = {
    CONFIRME: { cls: 'badge-confirme', label: 'Confirmé' },
    ANNULE:   { cls: 'badge-annule',   label: 'Annulé'   },
    EFFECTUE: { cls: 'badge-effectue', label: 'Effectué' },
  }
  const { cls, label } = map[statut] ?? { cls: 'badge-confirme', label: statut }
  return <span className={cls}>{label}</span>
}

export default function PatientAccueil() {
  const { user } = useAuth()
  const [rdvs, setRdvs]     = useState([])
  const [loading, setLoading] = useState(true)

  const charger = () => {
    setLoading(true)
    rdvService.getParPatient(user.personneId)
      .then(data => setRdvs(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }
  useEffect(() => { charger() }, [])

  const aVenir   = rdvs.filter(r => r.statut === 'CONFIRME')
  const passes   = rdvs.filter(r => r.statut === 'EFFECTUE')
  const annules  = rdvs.filter(r => r.statut === 'ANNULE')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-teal-600">Mes rendez-vous</h1>
          <p className="text-gray-500 mt-1">Lecture seule — données issues d'Oracle</p>
        </div>
        <button onClick={charger} className="btn-secondary"><RefreshCw size={16} /> Actualiser</button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'À venir',  count: aVenir.length,  color: 'bg-green-50 border-green-200 text-green-700'  },
          { label: 'Effectués', count: passes.length,  color: 'bg-blue-50  border-blue-200  text-blue-700'  },
          { label: 'Annulés',  count: annules.length, color: 'bg-red-50   border-red-200   text-red-700'   },
        ].map(k => (
          <div key={k.label} className={`border rounded-xl p-4 text-center ${k.color}`}>
            <div className="text-2xl font-bold">{k.count}</div>
            <div className="text-xs font-semibold mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700 flex items-center gap-2">
        <Info size={16} />
        En tant que patient, vous pouvez uniquement consulter vos rendez-vous. Pour toute modification, contactez le cabinet.
      </div>

      {loading && <div className="flex justify-center h-40 items-center"><Loader2 className="animate-spin text-teal-500" size={36} /></div>}

      {!loading && rdvs.length === 0 && (
        <div className="card text-center py-16 text-gray-400">
          <Calendar size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-semibold text-lg">Aucun rendez-vous enregistré</p>
        </div>
      )}

      {!loading && rdvs.length > 0 && (
        <div className="space-y-3">
          {rdvs.map(rdv => (
            <div key={rdv.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 text-center bg-teal-500 text-white rounded-xl px-3 py-2.5 min-w-[64px]">
                  <div className="text-lg font-bold leading-tight">
                    {rdv.dateHeure ? format(new Date(rdv.dateHeure), 'dd', { locale: fr }) : '—'}
                  </div>
                  <div className="text-xs opacity-80">
                    {rdv.dateHeure ? format(new Date(rdv.dateHeure), 'MMM', { locale: fr }) : ''}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="font-bold text-navy-600">{rdv.motif}</span>
                    <StatutBadge statut={rdv.statut} />
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} />
                      {rdv.dateHeure ? format(new Date(rdv.dateHeure), 'HH:mm') : '—'}
                    </span>
                    {rdv.medecin && (
                      <span className="flex items-center gap-1.5">
                        <User size={14} />
                        Dr {rdv.medecin.prenom} {rdv.medecin.nom}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
