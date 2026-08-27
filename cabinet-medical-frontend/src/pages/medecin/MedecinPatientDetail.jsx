import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { historiqueService, dossierService, medecinService } from '../../services/api'
import toast from 'react-hot-toast'
import {
  ArrowLeft, User, Calendar, FileText, Pill, FlaskConical,
  Plus, Loader2, AlertCircle, ChevronDown, ChevronUp
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

function StatutBadge({ statut }) {
  const map = { CONFIRME: 'badge-confirme', ANNULE: 'badge-annule', EFFECTUE: 'badge-effectue' }
  const labels = { CONFIRME: 'Confirmé', ANNULE: 'Annulé', EFFECTUE: 'Effectué' }
  return <span className={map[statut] ?? 'badge-confirme'}>{labels[statut] ?? statut}</span>
}

const EMPTY_CONSULT = { date: '', medecinId: '', diagnostic: '', ordonnance: '', analyses: '' }

export default function MedecinPatientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [historique, setHistorique] = useState(null)
  const [medecins, setMedecins]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [showForm, setShowForm]     = useState(false)
  const [form, setForm]             = useState(EMPTY_CONSULT)
  const [saving, setSaving]         = useState(false)
  const [rdvExpanded, setRdvExpanded] = useState(true)

  const charger = async () => {
    setLoading(true); setError(null)
    try {
      const [h, m] = await Promise.all([
        historiqueService.get(id),
        medecinService.getAll()
      ])
      setHistorique(h); setMedecins(m)
    } catch (e) {
      setError(e.response?.data?.message || 'Erreur de chargement')
    } finally { setLoading(false) }
  }
  useEffect(() => { charger() }, [id])

  const handleAjouterConsultation = async e => {
    e.preventDefault()
    if (!form.date || !form.medecinId || !form.diagnostic) {
      toast.error('Date, médecin et diagnostic sont obligatoires'); return
    }
    setSaving(true)
    try {
      const payload = {
        date:       form.date,
        medecinId:  Number(form.medecinId),
        diagnostic: form.diagnostic,
        ordonnance: form.ordonnance || null,
        analyses:   form.analyses ? form.analyses.split(',').map(s => s.trim()).filter(Boolean) : [],
        champsLibres: {}
      }
      await dossierService.ajouterConsultation(id, payload)
      toast.success('Consultation ajoutée avec succès !')
      setShowForm(false); setForm(EMPTY_CONSULT); charger()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur')
    } finally { setSaving(false) }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-teal-500" size={40} />
    </div>
  )
  if (error) return (
    <div className="space-y-4">
      <button onClick={() => navigate(-1)} className="btn-secondary"><ArrowLeft size={16} /> Retour</button>
      <div className="flex items-center gap-3 bg-red-50 text-red-700 rounded-xl p-5">
        <AlertCircle size={22} /> {error}
      </div>
    </div>
  )

  const { dossierMedical, rendezVous } = historique ?? {}
  const consultations = dossierMedical?.consultations ?? []

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-4 flex-wrap">
        <button onClick={() => navigate(-1)} className="btn-secondary">
          <ArrowLeft size={16} /> Retour
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-navy-600">
            {historique?.patientPrenom} {historique?.patientNom}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Dossier patient complet · Oracle + MongoDB
          </p>
        </div>
      </div>

      {/* Infos patient */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-xl font-bold">
            {historique?.patientPrenom?.[0]}{historique?.patientNom?.[0]}
          </div>
          <div>
            <div className="text-xl font-bold text-navy-600">
              {historique?.patientPrenom} {historique?.patientNom}
            </div>
            <div className="text-sm text-gray-400">#{id}</div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {historique?.patientEmail && (
            <div className="flex items-center gap-2 text-gray-600">
              <span className="font-semibold text-gray-400 w-20">Email</span>
              {historique.patientEmail}
            </div>
          )}
          {historique?.patientTelephone && (
            <div className="flex items-center gap-2 text-gray-600">
              <span className="font-semibold text-gray-400 w-20">Téléphone</span>
              {historique.patientTelephone}
            </div>
          )}
        </div>
      </div>

      {/* Rendez-vous (Oracle) */}
      <div className="card">
        <button
          className="flex items-center justify-between w-full"
          onClick={() => setRdvExpanded(v => !v)}
        >
          <div className="flex items-center gap-2">
            <Calendar className="text-teal-500" size={20} />
            <h2 className="font-bold text-navy-600">Rendez-vous</h2>
            <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-semibold">
              {rendezVous?.length ?? 0}
            </span>
            <span className="text-xs text-gray-400">Source Oracle</span>
          </div>
          {rdvExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {rdvExpanded && (
          <div className="mt-4 space-y-2">
            {(rendezVous ?? []).length === 0 ? (
              <p className="text-gray-400 text-sm">Aucun rendez-vous</p>
            ) : (rendezVous ?? []).map(r => (
              <div key={r.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl text-sm">
                <div className="text-center bg-white rounded-lg px-3 py-2 shadow-sm min-w-[60px]">
                  <div className="font-bold text-navy-600 text-base leading-tight">
                    {r.dateHeure ? format(new Date(r.dateHeure), 'dd', { locale: fr }) : '—'}
                  </div>
                  <div className="text-xs text-gray-400">
                    {r.dateHeure ? format(new Date(r.dateHeure), 'MMM', { locale: fr }) : ''}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{r.motif}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    Dr {r.medecinPrenom} {r.medecinNom} ·{' '}
                    {r.dateHeure ? format(new Date(r.dateHeure), 'HH:mm') : ''}
                  </div>
                </div>
                <StatutBadge statut={r.statut} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dossier médical (MongoDB) */}
      <div className="card">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <FileText className="text-violet-500" size={20} />
            <h2 className="font-bold text-navy-600">Dossier médical</h2>
            <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-semibold">
              {consultations.length}
            </span>
            <span className="text-xs text-gray-400">Source MongoDB</span>
          </div>
          <button onClick={() => setShowForm(v => !v)} className="btn-primary text-sm py-1.5">
            <Plus size={16} /> Ajouter une consultation
          </button>
        </div>

        {/* Formulaire ajout consultation */}
        {showForm && (
          <form onSubmit={handleAjouterConsultation} className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-5 space-y-3">
            <h3 className="font-bold text-navy-600 text-sm">Nouvelle consultation</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label text-xs">Date & heure *</label>
                <input type="datetime-local" className="input text-sm" value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
              </div>
              <div>
                <label className="label text-xs">Médecin *</label>
                <select className="input text-sm" value={form.medecinId}
                  onChange={e => setForm(f => ({ ...f, medecinId: e.target.value }))} required>
                  <option value="">-- Sélectionner --</option>
                  {medecins.map(m => (
                    <option key={m.id} value={m.id}>{m.prenom} {m.nom} — {m.specialite}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="label text-xs">Diagnostic *</label>
              <input className="input text-sm" placeholder="Hypertension artérielle légère..." value={form.diagnostic}
                onChange={e => setForm(f => ({ ...f, diagnostic: e.target.value }))} required />
            </div>
            <div>
              <label className="label text-xs">Ordonnance</label>
              <textarea className="input text-sm resize-none" rows={2} placeholder="Médicaments prescrits..."
                value={form.ordonnance} onChange={e => setForm(f => ({ ...f, ordonnance: e.target.value }))} />
            </div>
            <div>
              <label className="label text-xs">Analyses (séparées par virgule)</label>
              <input className="input text-sm" placeholder="ECG, Bilan lipidique, NFS..." value={form.analyses}
                onChange={e => setForm(f => ({ ...f, analyses: e.target.value }))} />
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm py-1.5">Annuler</button>
              <button type="submit" disabled={saving} className="btn-primary text-sm py-1.5">
                {saving ? <Loader2 size={14} className="animate-spin" /> : 'Enregistrer'}
              </button>
            </div>
          </form>
        )}

        {/* Liste des consultations */}
        {consultations.length === 0 ? (
          <p className="text-gray-400 text-sm">Aucune consultation enregistrée</p>
        ) : (
          <div className="space-y-4">
            {consultations.map((c, i) => (
              <div key={i} className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
                  <div>
                    <div className="font-bold text-navy-600">
                      {c.date ? format(new Date(c.date), "d MMMM yyyy à HH'h'mm", { locale: fr }) : '—'}
                    </div>
                    <div className="text-xs text-gray-400">Dr (id:{c.medecinId})</div>
                  </div>
                  <span className="text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded-full font-medium">
                    Consultation #{consultations.length - i}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <FileText size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <div><span className="font-semibold text-gray-600">Diagnostic : </span>{c.diagnostic}</div>
                  </div>
                  {c.ordonnance && (
                    <div className="flex items-start gap-2">
                      <Pill size={15} className="text-teal-500 mt-0.5 flex-shrink-0" />
                      <div><span className="font-semibold text-gray-600">Ordonnance : </span>{c.ordonnance}</div>
                    </div>
                  )}
                  {c.analyses?.length > 0 && (
                    <div className="flex items-start gap-2">
                      <FlaskConical size={15} className="text-amber-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-semibold text-gray-600">Analyses : </span>
                        {c.analyses.map((a, j) => (
                          <span key={j} className="inline-block bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full mr-1 mt-0.5">{a}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Champs libres MongoDB */}
                  {c.champsLibres && Object.keys(c.champsLibres).length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <div className="text-xs font-semibold text-gray-500 mb-1">Informations complémentaires :</div>
                      {Object.entries(c.champsLibres).map(([k, v]) => (
                        <div key={k} className="text-xs text-gray-600">
                          <span className="font-medium">{k} : </span>{String(v)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
