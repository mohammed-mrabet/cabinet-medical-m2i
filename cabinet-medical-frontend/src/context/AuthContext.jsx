import { createContext, useContext, useState, useCallback } from 'react'
import { authService } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })

  const login = useCallback(async (login, motDePasse) => {
    const data = await authService.login(login, motDePasse)
    // data = { token, login, role, personneId }
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data))
    setUser(data)
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.clear()
    setUser(null)
  }, [])

  const isMedecin = user?.role === 'MEDECIN'
  const isPatient = user?.role === 'PATIENT'

  return (
    <AuthContext.Provider value={{ user, login, logout, isMedecin, isPatient }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être dans AuthProvider')
  return ctx
}
