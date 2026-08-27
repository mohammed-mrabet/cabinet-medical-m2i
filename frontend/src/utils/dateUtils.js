import { format, parseISO, isToday, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';

function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  const d = typeof value === 'string' ? parseISO(value) : new Date(value);
  return isValid(d) ? d : null;
}

export function formatDateHeure(value) {
  const d = toDate(value);
  if (!d) return '—';
  return format(d, "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr });
}

export function formatDateCourte(value) {
  const d = toDate(value);
  if (!d) return '—';
  return format(d, 'd MMM yyyy', { locale: fr });
}

export function formatHeure(value) {
  const d = toDate(value);
  if (!d) return '—';
  return format(d, 'HH:mm');
}

export function formatDateInputValue(value) {
  // Pour <input type="datetime-local">
  const d = toDate(value);
  if (!d) return '';
  return format(d, "yyyy-MM-dd'T'HH:mm");
}

export function estAujourdHui(value) {
  const d = toDate(value);
  return d ? isToday(d) : false;
}

export function calculerAge(dateNaissance) {
  const d = toDate(dateNaissance);
  if (!d) return null;
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}
