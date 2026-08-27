import { api } from './client';

export function getMedecins() {
  return api.get('/medecins').then((r) => r.data);
}

export function getMedecinById(id) {
  return api.get(`/medecins/${id}`).then((r) => r.data);
}

export function getPatients() {
  return api.get('/patients').then((r) => r.data);
}

export function getPatientById(id) {
  return api.get(`/patients/${id}`).then((r) => r.data);
}

export function creerPatient(payload) {
  return api.post('/patients', payload).then((r) => r.data);
}
