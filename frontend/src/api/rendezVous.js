import { api } from './client';

export function creerRendezVous(payload) {
  return api.post('/rendez-vous', payload).then((r) => r.data);
}

export function modifierRendezVous(id, payload) {
  return api.put(`/rendez-vous/${id}`, payload).then((r) => r.data);
}

export function annulerRendezVous(id) {
  return api.patch(`/rendez-vous/${id}/annuler`).then((r) => r.data);
}

export function marquerRendezVousEffectue(id) {
  return api.patch(`/rendez-vous/${id}/effectuer`).then((r) => r.data);
}

export function getRdvParPatient(patientId) {
  return api.get(`/rendez-vous/patient/${patientId}`).then((r) => r.data);
}

export function getRdvParMedecin(medecinId) {
  return api.get(`/rendez-vous/medecin/${medecinId}`).then((r) => r.data);
}

export function getRdvDuJour(medecinId) {
  return api.get(`/rendez-vous/medecin/${medecinId}/aujourdhui`).then((r) => r.data);
}
