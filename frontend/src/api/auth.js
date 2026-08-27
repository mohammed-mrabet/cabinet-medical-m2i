import { api } from './client';

export function login(loginValue, motDePasse) {
  return api.post('/auth/login', { login: loginValue, motDePasse }).then((r) => r.data);
}
