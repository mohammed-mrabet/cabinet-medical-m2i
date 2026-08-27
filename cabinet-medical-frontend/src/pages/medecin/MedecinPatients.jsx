import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { patientService } from '../../services/api'
import toast from 'react-hot-toast'
import {
  Users, Plus, Search, Eye, Loader2, Phone, Mail, RefreshCw
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const EMPTY_PATIENT = { nom: '', prenom: '', dateNaissance: '', telephone: '', email: '' }

export default function MedecinPatients() {
  const navigate = useNavigate()
  const [patients, setPatients] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]         = useState(EMPTY_PATIENT)
  const [saving, setSaving]     = useState(false)

  const charger = () => {
    setLoading(true)
    patientService.getAll()
      .then(setPatients)
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { charger() }, [])

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.nom || !form.prenom || !form.dateNaissance || !form.email) {
      toast.error('Nom, prénom, date de naissance et email sont obligatoires'); return
    }
    setSaving(true)
    try {
      await patientService.creer(form)
      toast.success('Patient ajouté avec succès !')
      setShowModal(false); setForm(EMPTY_PATIENT); charger()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur')
    } finally { setSaving(false) }
  }

  const filtered = patients.filter(p =>
    `${p.nom} ${p.prenom} ${p.email}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-600">Patients</h1>
          <p className="text-gray-500 mt-1">{patients.length} patient(s) enregistré(s)</p>
        </div>
        <div className="flex gap-2">
          <button onClick={charger} className="btn-secondary"><RefreshCw size={16} /></button>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus size={18} /> Nouveau patient
          </button>
        </div>
      </div>

      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          className="input pl-9"
          placeholder="Rechercher par nom, prénom ou email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading && <div className="flex justify-center h-40 items-center"><Loader2 className="animate-spin text-teal-500" size={36} /></div>}

      {!loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-16 text-gray-400">
              <Users size={48} className="mx-auto mb-4 opacity-30" />
              <p className="font-semibold">Aucun patient trouvé</p>
            </div>
          ) : filtered.map(p => (
            <div key={p.id} className="card hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => navigate(`/medecin/patients/${p.id}`)}
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600
                                flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                  {p.prenom?.[0]}{p.nom?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-navy-600 group-hover:text-teal-600 transition-colors">
                    {p.prenom} {p.nom}
                  </div>
                  {p.dateNaissance && (
                    <div className="text-xs text-gray-400 mt-0.5">
                      Né(e) le {format(new Date(p.dateNaissance), 'd MMM yyyy', { locale: fr })}
                    </div>
                  )}
                </div>
                <Eye size={18} className="text-gray-300 group-hover:text-teal-500 transition-colors mt-1" />
              </div>
              <div className="mt-4 space-y-1.5">
                {p.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Mail size={13} /> <span className="truncate">{p.email}</span>
                  </div>
                )}
                {p.telephone && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Phone size={13} /> {p.telephone}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal nouveau patient */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white">
              <h2 className="text-lg font-bold text-navy-600">Nouveau patient</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Nom *</label>
                  <input className="input" placeholder="Idrissi" value={form.nom}
                    onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">Prénom *</label>
                  <input className="input" placeholder="Karim" value={form.prenom}
                    onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))} required />
                </div>
              </div>
              <div>
                <label className="label">Date de naissance *</label>
                <input type="date" className="input" value={form.dateNaissance}
                  onChange={e => setForm(f => ({ ...f, dateNaissance: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Email *</label>
                <input type="email" className="input" placeholder="patient@mail.com" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Téléphone</label>
                <input className="input" placeholder="0600000000" value={form.telephone}
                  onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Annuler</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
