import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_MEDECIN = [
  { to: '/', label: 'Aujourd’hui', icon: '☉' },
  { to: '/rendez-vous', label: 'Rendez-vous', icon: '▭' },
  { to: '/patients', label: 'Patients', icon: '☐' },
  { to: '/dashboard', label: 'Tableau de bord', icon: '▤' },
];

const NAV_PATIENT = [
  { to: '/', label: 'Mes rendez-vous', icon: '▭' },
  { to: '/dossier', label: 'Mon dossier', icon: '☐' },
];

export default function AppLayout() {
  const { session, logout, isMedecin } = useAuth();
  const navigate = useNavigate();
  const navItems = isMedecin ? NAV_MEDECIN : NAV_PATIENT;

  const initiales = (session?.login || '?')
    .split(/[.\s]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

  function handleLogout() {
    logout();
    navigate('/connexion', { replace: true });
  }

  return (
    <div className="min-h-screen flex bg-paper paper-texture">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-ink text-paper flex flex-col border-r border-ink-soft/20">
        <div className="px-6 py-6 border-b border-paper/10">
          <p className="font-mono text-[11px] tracking-[0.2em] text-paper/50 uppercase">Registre N° 03</p>
          <h1 className="font-display text-2xl leading-tight mt-1">Cabinet<br />Médical</h1>
        </div>

        <nav className="flex-1 px-3 py-5 flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-sage text-paper' : 'text-paper/70 hover:bg-paper/10 hover:text-paper'
                }`
              }
            >
              <span aria-hidden="true" className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-paper/10">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-9 h-9 rounded-full bg-clay flex items-center justify-center font-display font-semibold text-sm">
              {initiales}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{session?.login}</p>
              <p className="text-[11px] text-paper/50 uppercase tracking-wide">
                {isMedecin ? 'Médecin · Admin' : 'Patient'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left text-sm text-paper/60 hover:text-paper px-3 py-2 rounded-lg hover:bg-paper/10 transition-colors"
          >
            ↩ Se déconnecter
          </button>
        </div>
      </aside>

      {/* Contenu */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
