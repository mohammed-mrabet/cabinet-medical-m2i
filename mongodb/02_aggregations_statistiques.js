// =====================================================================
// Cabinet Médical - Script MongoDB : agrégations pour le Tableau de Bord
// =====================================================================

use cabinet_medical;

// ---------------------------------------------------------------------
// 1. Nombre de consultations par mois et par médecin
// ---------------------------------------------------------------------
db.dossiers.aggregate([
  { $unwind: "$consultations" },
  {
    $group: {
      _id: {
        medecinId: "$consultations.medecinId",
        annee: { $year: "$consultations.date" },
        mois: { $month: "$consultations.date" }
      },
      nombreConsultations: { $sum: 1 }
    }
  },
  { $sort: { "_id.annee": -1, "_id.mois": -1, "nombreConsultations": -1 } }
]);

// ---------------------------------------------------------------------
// 2. Pathologies (diagnostics) les plus fréquentes
//    Regroupe les diagnostics et compte leurs occurrences, du plus
//    fréquent au moins fréquent.
// ---------------------------------------------------------------------
db.dossiers.aggregate([
  { $unwind: "$consultations" },
  {
    $group: {
      _id: "$consultations.diagnostic",
      occurrences: { $sum: 1 }
    }
  },
  { $sort: { occurrences: -1 } },
  { $limit: 10 }
]);

// ---------------------------------------------------------------------
// 3. Pathologies traitées par médecin (utilisé pour le croisement
//    Oracle + MongoDB : "Médecins les plus sollicités + pathologies
//    qu'ils traitent"). Le service Java récupère d'abord le classement
//    des médecins depuis Oracle (v_medecins_plus_solicites), puis
//    interroge MongoDB avec cette agrégation filtrée par medecinId.
// ---------------------------------------------------------------------
db.dossiers.aggregate([
  { $unwind: "$consultations" },
  { $match: { "consultations.medecinId": 1 } }, // exemple : médecin id=1
  {
    $group: {
      _id: "$consultations.diagnostic",
      occurrences: { $sum: 1 }
    }
  },
  { $sort: { occurrences: -1 } }
]);
