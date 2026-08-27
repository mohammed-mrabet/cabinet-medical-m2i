import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authService = {
  login: (login, motDePasse) =>
    api.post('/auth/login', { login, motDePasse }).then(r => r.data),
}

export const medecinService = {
  getAll:  ()   => api.get('/medecins').then(r => r.data),
  getById: (id) => api.get(`/medecins/${id}`).then(r => r.data),
}

export const patientService = {
  getAll:  ()     => api.get('/patients').then(r => r.data),
  getById: (id)   => api.get(`/patients/${id}`).then(r => r.data),
  creer:   (data) => api.post('/patients', data).then(r => r.data),
}

export const rdvService = {
  creer:         (data)      => api.post('/rendez-vous', data).then(r => r.data),
  modifier:      (id, data)  => api.put(`/rendez-vous/${id}`, data).then(r => r.data),
  annuler:       (id)        => api.patch(`/rendez-vous/${id}/annuler`).then(r => r.data),
  getParPatient: (patientId) => api.get(`/rendez-vous/patient/${patientId}`).then(r => r.data),
  getParMedecin: (medecinId) => api.get(`/rendez-vous/medecin/${medecinId}`).then(r => r.data),
  getDuJour:     (medecinId) => api.get(`/rendez-vous/medecin/${medecinId}/aujourdhui`).then(r => r.data),
}

export const dossierService = {
  get:                 (patientId)        => api.get(`/dossiers/patient/${patientId}`).then(r => r.data),
  creer:               (patientId)        => api.post(`/dossiers/patient/${patientId}`).then(r => r.data),
  ajouterConsultation: (patientId, data)  =>
    api.post(`/dossiers/patient/${patientId}/consultations`, data).then(r => r.data),
}

export const historiqueService = {
  get: (patientId) => api.get(`/historique/patient/${patientId}`).then(r => r.data),
}

export const dashboardService = {
  get: () => api.get('/dashboard').then(r => r.data),
}

export default api
