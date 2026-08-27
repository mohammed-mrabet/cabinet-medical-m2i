import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Calendar, Users, CalendarCheck,
  LogOut, Stethoscope, Menu, X
} from 'lucide-react'
import { useState } from 'react'

const nav = [
  { to: '/medecin',              label: 'Tableau de bord',  icon: LayoutDashboard, end: true },
  { to: '/medecin/rdv-du-jour',  label: 'RDV du jour',      icon: CalendarCheck },
  { to: '/medecin/rendez-vous',  label: 'Rendez-vous',      icon: Calendar },
  { to: '/medecin/patients',     label: 'Patients',         icon: Users },
]

export default function MedecinLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  const Sidebar = () => (
    <aside className="flex flex-col w-64 bg-navy-600 text-white min-h-screen">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
          <Stethoscope size={22} />
        </div>
        <div>
          <div className="font-bold text-sm leading-tight">Cabinet Médical</div>
          <div className="text-xs text-white/60">Espace Médecin</div>
        </div>
      </div>

      {/* Profil */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="bg-white/10 rounded-xl px-4 py-3">
          <div className="text-xs text-white/60 uppercase tracking-wide font-medium">Connecté en tant que</div>
          <div className="font-semibold text-sm mt-1">{user?.login}</div>
          <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs bg-teal-500 font-medium">Admin</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
               ${isActive
                 ? 'bg-white text-navy-600 shadow'
                 : 'text-white/75 hover:bg-white/10 hover:text-white'
               }`
            }
          >
            <item.icon size={19} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Déconnexion */}
      <div className="px-3 pb-6">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/75
                     hover:bg-red-500/20 hover:text-red-300 transition-all w-full"
        >
          <LogOut size={19} />
          Déconnexion
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar desktop */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Sidebar mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10"><Sidebar /></div>
        </div>
      )}

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Topbar mobile */}
        <header className="md:hidden sticky top-0 z-40 bg-navy-600 text-white px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)}><Menu size={24} /></button>
          <Stethoscope size={22} />
          <span className="font-bold">Cabinet Médical</span>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
