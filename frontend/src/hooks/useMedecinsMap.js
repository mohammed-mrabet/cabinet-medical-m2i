import { useEffect, useState, useCallback } from 'react';
import { getMedecins } from '../api/personnes';

// Charge la liste des médecins une fois et expose un résolveur id -> "Prénom Nom".
// Utilisé pour afficher le nom du médecin dans une consultation MongoDB, qui ne
// stocke que `medecinId` (clé logique vers Oracle, pas de jointure native possible).
export function useMedecinsMap() {
  const [medecinsParId, setMedecinsParId] = useState({});

  useEffect(() => {
    getMedecins()
      .then((liste) => {
        const map = {};
        for (const m of liste) {
          map[m.id] = `${m.prenom} ${m.nom}`.trim();
        }
        setMedecinsParId(map);
      })
      .catch(() => {
        // Si la requête échoue (ex: patient connecté sans droit sur /medecins),
        // on se contente d'afficher "Médecin n°X" — pas bloquant pour la page.
      });
  }, []);

  const nomMedecinParId = useCallback((id) => medecinsParId[id], [medecinsParId]);

  return nomMedecinParId;
}
