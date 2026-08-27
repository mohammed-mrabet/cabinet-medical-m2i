import { useEffect, useState } from 'react'
import { rdvService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { CalendarCheck, Clock, User, Phone, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

function StatutBadge({ statut }) {
  const classes = {
    CONFIRME:  'badge-confirme',
    ANNULE:    'badge-annule',
    EFFECTUE:  'badge-effectue',
  }
  const labels = { CONFIRME: 'Confirmé', ANNULE: 'Annulé', EFFECTUE: 'Effectué' }
  return <span className={classes[statut] ?? 'badge-confirme'}>{labels[statut] ?? statut}</span>
}

export default function MedecinRdvDuJour() {
  const { user } = useAuth()
  const [rdvs, setRdvs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const charger = () => {
    setLoading(true); setError(null)
    rdvService.getDuJour(user.personneId)
      .then(data => setRdvs(Array.isArray(data) ? data : []))
      .catch(e => setError(e.response?.data?.message || 'Erreur de chargement'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { charger() }, [])

  const today = format(new Date(), 'EEEE d MMMM yyyy', { locale: fr })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-600">Mes patients du jour</h1>
          <p className="text-gray-500 mt-1 capitalize">{today}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-teal-50 text-teal-700 px-4 py-2 rounded-xl font-bold text-lg">
            {rdvs.length} RDV
          </div>
          <button onClick={charger} className="btn-secondary">
            <RefreshCw size={16} /> Actualiser
          </button>
        </div>
      </div>

      {/* Provenance PL/SQL */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700 flex items-center gap-2">
        <CalendarCheck size={16} />
        Liste générée par la procédure stockée Oracle <strong>PKG_RDV.RDV_DU_JOUR</strong>
        , triée par heure croissante.
      </div>

      {loading && (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="animate-spin text-teal-500" size={36} />
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 text-red-700 rounded-xl p-4">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {!loading && !error && rdvs.length === 0 && (
        <div className="card text-center py-16 text-gray-400">
          <CalendarCheck size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-semibold text-lg">Aucun rendez-vous aujourd'hui</p>
          <p className="text-sm mt-1">Profitez de cette journée !</p>
        </div>
      )}

      <div className="grid gap-4">
        {rdvs.map((rdv, idx) => (
          <div key={rdv.rdvId} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              {/* Heure */}
              <div className="flex-shrink-0 text-center bg-navy-600 text-white rounded-xl px-4 py-3 min-w-[70px]">
                <Clock size={16} className="mx-auto mb-1 opacity-80" />
                <div className="font-bold text-lg leading-tight">
                  {rdv.dateHeure ? format(new Date(rdv.dateHeure), 'HH:mm') : '—'}
                </div>
              </div>

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <span className="font-bold text-navy-600 text-lg">
                    {rdv.patientNom} {rdv.patientPrenom}
                  </span>
                  <StatutBadge statut={rdv.statut} />
                </div>
                <p className="text-gray-700 font-medium mb-2">{rdv.motif}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <User size={14} /> Patient #{rdv.patientId}
                  </span>
                  {rdv.patientTelephone && (
                    <a href={`tel:${rdv.patientTelephone}`} className="flex items-center gap-1.5 text-teal-600 hover:underline">
                      <Phone size={14} /> {rdv.patientTelephone}
                    </a>
                  )}
                </div>
              </div>

              {/* Numéro */}
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-sm">
                {idx + 1}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
