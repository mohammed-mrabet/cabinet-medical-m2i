import { api } from './client';

export function getDossier(patientId) {
  return api.get(`/dossiers/patient/${patientId}`).then((r) => r.data);
}

export function creerDossier(patientId) {
  return api.post(`/dossiers/patient/${patientId}`).then((r) => r.data);
}

export function ajouterConsultation(patientId, payload) {
  return api.post(`/dossiers/patient/${patientId}/consultations`, payload).then((r) => r.data);
}
