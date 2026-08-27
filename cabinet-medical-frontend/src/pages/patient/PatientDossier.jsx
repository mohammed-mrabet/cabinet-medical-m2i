import { useEffect, useState } from 'react'
import { dossierService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import {
  FileText, Pill, FlaskConical, Lock, Loader2, Info, RefreshCw
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function PatientDossier() {
  const { user } = useAuth()
  const [dossier, setDossier] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const charger = () => {
    setLoading(true); setError(null)
    dossierService.get(user.personneId)
      .then(setDossier)
      .catch(e => {
        if (e.response?.status === 404) setError('Aucun dossier médical trouvé')
        else setError(e.response?.data?.message || 'Erreur de chargement')
      })
      .finally(() => setLoading(false))
  }
  useEffect(() => { charger() }, [])

  const consultations = dossier?.consultations ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-teal-600">Mon dossier médical</h1>
          <p className="text-gray-500 mt-1">Lecture seule — données issues de MongoDB</p>
        </div>
        <button onClick={charger} className="btn-secondary"><RefreshCw size={16} /> Actualiser</button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700 flex items-center gap-2">
        <Lock size={16} />
        Votre dossier est consultable en lecture seule. Seul votre médecin peut y ajouter des informations.
      </div>

      {loading && <div className="flex justify-center h-40 items-center"><Loader2 className="animate-spin text-teal-500" size={36} /></div>}

      {error && (
        <div className="card text-center py-16 text-gray-400">
          <FileText size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-semibold text-lg">{error}</p>
          <p className="text-sm mt-1">Contactez le cabinet pour créer votre dossier médical.</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Résumé */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card text-center">
              <div className="text-3xl font-bold text-teal-600">{consultations.length}</div>
              <div className="text-sm font-semibold text-gray-600 mt-1">Consultation(s)</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl font-bold text-violet-600">
                {new Set(consultations.map(c => c.diagnostic)).size}
              </div>
              <div className="text-sm font-semibold text-gray-600 mt-1">Pathologie(s)</div>
            </div>
          </div>

          {/* Chronologie des consultations */}
          {consultations.length === 0 ? (
            <div className="card text-center py-12 text-gray-400">
              <FileText size={40} className="mx-auto mb-3 opacity-30" />
              <p>Aucune consultation enregistrée</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="font-bold text-navy-600 text-lg">Historique des consultations</h2>
              {[...consultations].reverse().map((c, i) => (
                <div key={i} className="card border-l-4 border-l-teal-400">
                  <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                    <div>
                      <div className="font-bold text-navy-600">
                        {c.date
                          ? format(new Date(c.date), "EEEE d MMMM yyyy à HH'h'mm", { locale: fr })
                          : '—'}
                      </div>
                    </div>
                    <span className="text-xs bg-teal-100 text-teal-700 px-2.5 py-1 rounded-full font-medium">
                      Consultation #{consultations.length - i}
                    </span>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                      <FileText size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-semibold text-gray-600 block text-xs mb-0.5">Diagnostic</span>
                        <span className="text-gray-800">{c.diagnostic}</span>
                      </div>
                    </div>

                    {c.ordonnance && (
                      <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                        <Pill size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-semibold text-green-700 block text-xs mb-0.5">Ordonnance</span>
                          <span className="text-gray-800">{c.ordonnance}</span>
                        </div>
                      </div>
                    )}

                    {c.analyses?.length > 0 && (
                      <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
                        <FlaskConical size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-semibold text-amber-700 block text-xs mb-1.5">Analyses</span>
                          <div className="flex flex-wrap gap-1.5">
                            {c.analyses.map((a, j) => (
                              <span key={j} className="bg-amber-100 text-amber-700 text-xs px-2.5 py-1 rounded-full">{a}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {c.champsLibres && Object.keys(c.champsLibres).length > 0 && (
                      <div className="flex items-start gap-2 p-3 bg-violet-50 rounded-lg">
                        <Info size={16} className="text-violet-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-semibold text-violet-700 block text-xs mb-1.5">
                            Informations complémentaires
                          </span>
                          {Object.entries(c.champsLibres).map(([k, v]) => (
                            <div key={k} className="text-xs text-gray-700">
                              <span className="font-medium">{k} : </span>{String(v)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
