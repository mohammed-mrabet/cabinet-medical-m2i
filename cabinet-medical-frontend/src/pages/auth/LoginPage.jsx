import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Stethoscope, Lock, User, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const { login, user, isMedecin } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ login: '', motDePasse: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  // Déjà connecté → redirection
  if (user) {
    navigate(isMedecin ? '/medecin' : '/patient', { replace: true })
    return null
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.login || !form.motDePasse) {
      toast.error('Veuillez remplir tous les champs')
      return
    }
    setLoading(true)
    try {
      const data = await login(form.login, form.motDePasse)
      toast.success(`Bienvenue, ${data.login} !`)
      navigate(data.role === 'MEDECIN' ? '/medecin' : '/patient', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.message || 'Identifiants incorrects'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-600 via-navy-700 to-teal-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-2xl mb-4 backdrop-blur">
            <Stethoscope className="text-white" size={40} />
          </div>
          <h1 className="text-3xl font-bold text-white">Cabinet Médical</h1>
          <p className="text-white/70 mt-1">Système de gestion médicale</p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-navy-600 mb-6">Connexion</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Identifiant</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  className="input pl-10"
                  placeholder="ex : sara.bennani"
                  value={form.login}
                  onChange={e => setForm(f => ({ ...f, login: e.target.value }))}
                  autoComplete="username"
                />
              </div>
            </div>
            <div>
              <label className="label">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  className="input pl-10 pr-10"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.motDePasse}
                  onChange={e => setForm(f => ({ ...f, motDePasse: e.target.value }))}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPwd(v => !v)}
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading ? (
                <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : 'Se connecter'}
            </button>
          </form>

          {/* Comptes de démo */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-3 font-semibold uppercase tracking-wide">Comptes de démonstration</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Médecin (Admin)', login: 'sara.bennani', color: 'bg-navy-600' },
                { label: 'Patient (User)', login: 'karim.idrissi', color: 'bg-teal-500' },
              ].map(c => (
                <button
                  key={c.login}
                  type="button"
                  onClick={() => setForm({ login: c.login, motDePasse: 'password123' })}
                  className={`${c.color} text-white text-xs rounded-lg p-2.5 text-left hover:opacity-90 transition`}
                >
                  <div className="font-semibold">{c.label}</div>
                  <div className="opacity-75 mt-0.5">{c.login}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-white/50 text-xs mt-6">
          Master Ingénierie Informatique — Faculté des Sciences d'Oujda
        </p>
      </div>
    </div>
  )
}
