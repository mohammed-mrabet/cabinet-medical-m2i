import { useEffect, useState } from 'react'
import { rdvService, patientService, medecinService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import {
  Calendar, Plus, Pencil, XCircle, Loader2,
  AlertCircle, Search, Filter, RefreshCw, User2
} from 'lucide-react'
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

const EMPTY = { dateHeure: '', motif: '', medecinId: '', patientId: '' }

export default function MedecinRdvGestion() {
  const { user } = useAuth()
  const [rdvs, setRdvs]         = useState([])
  const [patients, setPatients]  = useState([])
  const [medecins, setMedecins]  = useState([])
  const [loading, setLoading]    = useState(true)
  const [search, setSearch]      = useState('')
  const [filtreStatut, setFiltreStatut] = useState('TOUS')
  const [showModal, setShowModal] = useState(false)
  const [editRdv, setEditRdv]    = useState(null)
  const [form, setForm]          = useState(EMPTY)
  const [saving, setSaving]      = useState(false)

  const charger = async () => {
    setLoading(true)
    try {
      const [r, p, m] = await Promise.all([
        rdvService.getParMedecin(user.personneId),
        patientService.getAll(),
        medecinService.getAll(),
      ])
      setRdvs(r); setPatients(p); setMedecins(m)
    } catch { toast.error('Erreur de chargement') }
    finally { setLoading(false) }
  }

  useEffect(() => { charger() }, [])

  const ouvrirAjout = () => {
    setEditRdv(null)
    setForm({ ...EMPTY, medecinId: String(user.personneId) })
    setShowModal(true)
  }
  const ouvrirEdit = rdv => {
    setEditRdv(rdv)
    const dt = rdv.dateHeure ? rdv.dateHeure.slice(0, 16) : ''
    setForm({
      dateHeure:  dt,
      motif:      rdv.motif,
      medecinId:  String(rdv.medecin?.id ?? user.personneId),
      patientId:  String(rdv.patient?.id ?? ''),
    })
    setShowModal(true)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.dateHeure || !form.motif || !form.medecinId || !form.patientId) {
      toast.error('Tous les champs sont obligatoires'); return
    }
    setSaving(true)
    const payload = {
      dateHeure:  form.dateHeure,
      motif:      form.motif,
      medecinId:  Number(form.medecinId),
      patientId:  Number(form.patientId),
    }
    try {
      if (editRdv) {
        await rdvService.modifier(editRdv.id, payload)
        toast.success('Rendez-vous modifié !')
      } else {
        await rdvService.creer(payload)
        toast.success('Rendez-vous créé !')
      }
      setShowModal(false); charger()
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur lors de la sauvegarde'
      toast.error(msg)
    } finally { setSaving(false) }
  }

  const handleAnnuler = async rdv => {
    if (!confirm(`Annuler le RDV de ${rdv.patient?.nom} ${rdv.patient?.prenom} ?`)) return
    try {
      await rdvService.annuler(rdv.id)
      toast.success('RDV annulé')
      charger()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur')
    }
  }

  const rdvsFiltres = rdvs.filter(r => {
    const matchSearch =
      r.patient?.nom?.toLowerCase().includes(search.toLowerCase()) ||
      r.patient?.prenom?.toLowerCase().includes(search.toLowerCase()) ||
      r.motif?.toLowerCase().includes(search.toLowerCase())
    const matchStatut = filtreStatut === 'TOUS' || r.statut === filtreStatut
    return matchSearch && matchStatut
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-600">Gestion des rendez-vous</h1>
          <p className="text-gray-500 mt-1">{rdvs.length} rendez-vous au total</p>
        </div>
        <div className="flex gap-2">
          <button onClick={charger} className="btn-secondary"><RefreshCw size={16} /></button>
          <button onClick={ouvrirAjout} className="btn-primary"><Plus size={18} /> Nouveau RDV</button>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            className="input pl-9"
            placeholder="Rechercher patient ou motif..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input w-auto"
          value={filtreStatut}
          onChange={e => setFiltreStatut(e.target.value)}
        >
          <option value="TOUS">Tous les statuts</option>
          <option value="CONFIRME">Confirmé</option>
          <option value="ANNULE">Annulé</option>
          <option value="EFFECTUE">Effectué</option>
        </select>
      </div>

      {loading && <div className="flex justify-center h-40 items-center"><Loader2 className="animate-spin text-teal-500" size={36} /></div>}

      {!loading && (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Date & Heure', 'Patient', 'Motif', 'Statut', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rdvsFiltres.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-gray-400">
                    <Calendar size={36} className="mx-auto mb-3 opacity-30" />
                    Aucun résultat
                  </td></tr>
                ) : rdvsFiltres.map(rdv => (
                  <tr key={rdv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-navy-600">
                        {rdv.dateHeure ? format(new Date(rdv.dateHeure), 'dd/MM/yyyy', { locale: fr }) : '—'}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {rdv.dateHeure ? format(new Date(rdv.dateHeure), 'HH:mm') : ''}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold">
                          {rdv.patient?.prenom?.[0]}{rdv.patient?.nom?.[0]}
                        </div>
                        <div>
                          <div className="font-medium">{rdv.patient?.prenom} {rdv.patient?.nom}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-700 max-w-[220px] truncate">{rdv.motif}</td>
                    <td className="px-5 py-4"><StatutBadge statut={rdv.statut} /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {rdv.statut !== 'ANNULE' && (
                          <>
                            <button onClick={() => ouvrirEdit(rdv)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition" title="Modifier">
                              <Pencil size={16} />
                            </button>
                            <button onClick={() => handleAnnuler(rdv)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition" title="Annuler">
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Ajout / Modification */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-bold text-navy-600">
                {editRdv ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Date et heure *</label>
                <input
                  type="datetime-local"
                  className="input"
                  value={form.dateHeure}
                  onChange={e => setForm(f => ({ ...f, dateHeure: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="label">Médecin *</label>
                <select
                  className="input"
                  value={form.medecinId}
                  onChange={e => setForm(f => ({ ...f, medecinId: e.target.value }))}
                  required
                >
                  <option value="">-- Sélectionner --</option>
                  {medecins.map(m => (
                    <option key={m.id} value={m.id}>{m.prenom} {m.nom} — {m.specialite}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Patient *</label>
                <select
                  className="input"
                  value={form.patientId}
                  onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))}
                  required
                >
                  <option value="">-- Sélectionner --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Motif *</label>
                <textarea
                  className="input resize-none"
                  rows={3}
                  placeholder="Motif de la consultation..."
                  value={form.motif}
                  onChange={e => setForm(f => ({ ...f, motif: e.target.value }))}
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">
                  Annuler
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : editRdv ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
