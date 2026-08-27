import { api } from './client';

export function getHistoriquePatient(patientId) {
  return api.get(`/historique/patient/${patientId}`).then((r) => r.data);
}

export function getTableauDeBord() {
  return api.get('/dashboard').then((r) => r.data);
}
