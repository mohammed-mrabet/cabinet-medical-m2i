import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input, FieldLabel, ErrorBanner } from '../components/ui';

// Comptes de test connus dans la base. Les 4 derniers (El Amrani, Cherkaoui,
// Tazi, Ouahbi) ne fonctionnent que si le script d'enrichissement
// 07_enrichissement_donnees.sql a été exécuté côté Oracle — sinon ils
// renverront "Identifiant ou mot de passe incorrect" (comportement normal,
// le compte n'existe simplement pas encore dans UTILISATEUR).
const COMPTES_DEMO = [
  { login: 'sara.bennani', role: 'Médecin', detail: 'Cardiologie' },
  { login: 'karim.idrissi', role: 'Patient' },
  { login: 'yassine.elamrani', role: 'Médecin', detail: 'Pédiatrie' },
  { login: 'imane.cherkaoui', role: 'Médecin', detail: 'Dermatologie' },
  { login: 'lina.tazi', role: 'Patient' },
  { login: 'parent.ouahbi', role: 'Patient', detail: 'Adam Ouahbi' },
];

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [identifiant, setIdentifiant] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      await login(identifiant, motDePasse);
      const dest = location.state?.from || '/';
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.message);
    }
  }

  function fillDemo(login, pass) {
    setIdentifiant(login);
    setMotDePasse(pass);
  }

  return (
    <div className="min-h-screen flex bg-paper paper-texture">
      {/* Panneau gauche — identité */}
      <div className="hidden lg:flex lg:w-[44%] bg-ink text-paper flex-col justify-between px-14 py-12 relative overflow-hidden">
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-sage/20 blur-3xl" />
        <div className="absolute -left-16 bottom-0 w-72 h-72 rounded-full bg-clay/10 blur-3xl" />

        <div className="relative z-10">
          <p className="font-mono text-xs tracking-[0.3em] text-paper/50 uppercase">Faculté des Sciences d’Oujda</p>
          <p className="font-mono text-xs tracking-[0.3em] text-paper/50 uppercase mt-0.5">Master Ingénierie Informatique</p>
        </div>

        <div className="relative z-10">
          <span className="inline-block px-3 py-1 rounded-pill bg-clay/20 text-clay text-xs font-semibold tracking-wide mb-5 stamp border border-clay/30">
            SUJET N° 03
          </span>
          <h1 className="font-display text-5xl leading-[1.05] mb-5">
            Cabinet<br />Médical
          </h1>
          <p className="text-paper/70 text-base leading-relaxed max-w-sm">
            Le dossier patient et le rendez-vous, réunis : Oracle pour le registre
            des consultations planifiées, MongoDB pour la mémoire clinique qui s’écrit
            au fil des consultations.
          </p>
        </div>

        <div className="relative z-10 flex gap-6 text-xs text-paper/50 font-mono">
          <span>ORACLE · PL/SQL</span>
          <span>MONGODB · AGRÉGATIONS</span>
          <span>JWT · RBAC</span>
        </div>
      </div>

      {/* Panneau droit — formulaire */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="lg:hidden mb-8 text-center">
            <h1 className="font-display text-3xl text-ink">Cabinet Médical</h1>
          </div>

          <p className="font-mono text-[11px] tracking-[0.2em] text-sage uppercase mb-2">Accès registre</p>
          <h2 className="font-display text-2xl text-ink mb-1">Se connecter</h2>
          <p className="text-sm text-ink-soft mb-7">Entrez vos identifiants pour accéder à votre espace.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <FieldLabel>Identifiant</FieldLabel>
              <Input
                autoFocus
                value={identifiant}
                onChange={(e) => setIdentifiant(e.target.value)}
                placeholder="sara.bennani"
                required
              />
            </div>
            <div>
              <FieldLabel>Mot de passe</FieldLabel>
              <Input
                type="password"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <ErrorBanner message={error} />

            <Button type="submit" disabled={loading} className="mt-1 w-full" size="lg">
              {loading ? 'Connexion en cours…' : 'Entrer dans le cabinet'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-line">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft mb-3">Comptes de démonstration</p>
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
              {COMPTES_DEMO.map((compte) => (
                <button
                  key={compte.login}
                  onClick={() => fillDemo(compte.login, 'password123')}
                  className={`text-left text-sm px-3.5 py-2.5 rounded-lg border border-line transition-colors flex items-center justify-between ${
                    compte.role === 'Médecin'
                      ? 'hover:border-sage hover:bg-sage-light/40'
                      : 'hover:border-clay hover:bg-clay-light/40'
                  }`}
                >
                  <span><strong>{compte.login}</strong> · {compte.role}{compte.detail ? ` (${compte.detail})` : ''}</span>
                  <span className="text-ink-soft">password123</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
