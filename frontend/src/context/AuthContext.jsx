import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { setApiToken, setOnUnauthorized } from '../api/client';
import { login as loginRequest } from '../api/auth';

const AuthContext = createContext(null);

const STORAGE_KEY = 'cabinet_medical_session';

function loadSession() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(session) {
  if (session) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } else {
    sessionStorage.removeItem(STORAGE_KEY);
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => loadSession());
  const [authError, setAuthError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Synchronise le token courant avec le client axios à chaque changement.
  useEffect(() => {
    setApiToken(session?.token || null);
  }, [session]);

  const logout = useCallback(() => {
    setSession(null);
    saveSession(null);
  }, []);

  // Si le backend renvoie 401 (token expiré/invalide), on déconnecte.
  useEffect(() => {
    setOnUnauthorized(() => {
      setSession(null);
      saveSession(null);
    });
  }, []);

  const login = useCallback(async (identifiant, motDePasse) => {
    setLoading(true);
    setAuthError(null);
    try {
      const data = await loginRequest(identifiant, motDePasse);
      const newSession = {
        token: data.token,
        login: data.login,
        role: data.role, // 'MEDECIN' | 'PATIENT'
        personneId: data.personneId,
      };
      setSession(newSession);
      saveSession(newSession);
      return newSession;
    } catch (err) {
      const message =
        err?.response?.status === 401 || err?.response?.status === 403
          ? 'Identifiant ou mot de passe incorrect.'
          : err?.response?.data?.message || 'Connexion au serveur impossible. Vérifiez que le backend est démarré.';
      setAuthError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      session,
      isAuthenticated: !!session,
      isMedecin: session?.role === 'MEDECIN',
      isPatient: session?.role === 'PATIENT',
      login,
      logout,
      authError,
      loading,
    }),
    [session, login, logout, authError, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé à l’intérieur de <AuthProvider>');
  return ctx;
}
