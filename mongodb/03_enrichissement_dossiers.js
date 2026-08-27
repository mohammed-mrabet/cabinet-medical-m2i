// --------------------------------------------------------------------------------
// 03_enrichissement_dossiers.js
// Enrichit la collection 'dossiers' MongoDB pour une démonstration plus
// complète :
//   1) Ajoute des consultations supplémentaires aux 3 dossiers existants
//      (patientId 1, 2, 3), en respectant le format `champsLibres: {}`
//      attendu par l'API Spring Boot (ConsultationRequest)
//   2) Illustre le schéma flexible avec des champs différents par
//      consultation (résultats radio, compte-rendu opératoire, carnet de
//      vaccination...)
//   3) Étale les dates sur plusieurs mois pour que les agrégations
//      "consultations par mois" et "pathologies les plus fréquentes"
//      aient de la matière
//
// À exécuter :
//   mongosh "mongodb://localhost:27017/cabinet_medical" --file 03_enrichissement_dossiers.js
// --------------------------------------------------------------------------------

use("cabinet_medical");

print("=== Avant enrichissement ===");
print("Nombre de dossiers : " + db.dossiers.countDocuments());
db.dossiers.find().forEach(d => {
  print(" - patientId " + d.patientId + " : " + (d.consultations ? d.consultations.length : 0) + " consultation(s)");
});

// --------------------------------------------------------------------------------
// 1) DOSSIER PATIENT 1 (Idrissi Karim) — déjà 2 consultations, on en ajoute 2
//    (idempotent : ne s'exécute que si ces consultations n'existent pas déjà,
//    pour que vous puissiez relancer ce script sans dupliquer les données)
// --------------------------------------------------------------------------------
if (db.dossiers.countDocuments({ patientId: 1, "consultations.diagnostic": "Cephalees recurrentes" }) === 0) {
  db.dossiers.updateOne(
    { patientId: 1 },
    {
      $push: {
        consultations: {
          $each: [
            {
              date: new Date("2026-04-15T10:00:00Z"),
              medecinId: 1,
              diagnostic: "Cephalees recurrentes",
              ordonnance: "Paracetamol 1g si besoin, max 3/jour",
              analyses: ["Fond d'oeil", "IRM cerebrale"],
              champsLibres: {
                resultatIRM: "Sans anomalie structurelle visible",
                orientation: "Avis neurologique si persistance > 1 mois"
              }
            },
            {
              date: new Date("2026-06-21T09:00:00Z"),
              medecinId: 1,
              diagnostic: "Consultation de routine - bilan general",
              ordonnance: "",
              analyses: ["NFS", "Glycemie a jeun", "Bilan lipidique"],
              champsLibres: {
                poids: "78 kg",
                tension: "128/82 mmHg",
                recommandation: "Activite physique reguliere, controle dans 6 mois"
              }
            }
          ]
        }
      }
    }
  );
  print("Patient 1 : consultations ajoutees.");
} else {
  print("Patient 1 : consultations deja presentes, rien ajoute.");
}

// --------------------------------------------------------------------------------
// 2) DOSSIER PATIENT 2 (Tazi Lina) — déjà 2 consultations, on en ajoute 2
//    (idempotent)
// --------------------------------------------------------------------------------
if (db.dossiers.countDocuments({ patientId: 2, "consultations.diagnostic": "Eczema de contact" }) === 0) {
  db.dossiers.updateOne(
    { patientId: 2 },
    {
      $push: {
        consultations: {
          $each: [
            {
              date: new Date("2026-05-12T11:00:00Z"),
              medecinId: 3,
              diagnostic: "Eczema de contact",
              ordonnance: "Dermocorticoide leger pendant 7 jours",
              analyses: [],
              champsLibres: {
                localisation: "Avant-bras droit",
                causeProbable: "Nouveau produit cosmetique",
                photoLesion: "ref_photo_2026_05_12_lt.jpg"
              }
            },
            {
              date: new Date("2026-06-20T11:00:00Z"),
              medecinId: 1,
              diagnostic: "Renouvellement ordonnance - suivi cardiologique",
              ordonnance: "Anticoagulants - poursuite du traitement en cours",
              analyses: ["ECG de controle"],
              champsLibres: {
                tension: "118/76 mmHg",
                observance: "Bonne observance therapeutique declaree"
              }
            }
          ]
        }
      }
    }
  );
  print("Patient 2 : consultations ajoutees.");
} else {
  print("Patient 2 : consultations deja presentes, rien ajoute.");
}

// --------------------------------------------------------------------------------
// 3) DOSSIER PATIENT 3 (Ouahbi Adam, suivi pediatrique) — on ajoute 2 consultations
//    (idempotent)
// --------------------------------------------------------------------------------
if (db.dossiers.countDocuments({ patientId: 3, "consultations.diagnostic": "Otite moyenne aigue" }) === 0) {
  db.dossiers.updateOne(
    { patientId: 3 },
    {
      $push: {
        consultations: {
          $each: [
            {
              date: new Date("2026-04-02T14:30:00Z"),
              medecinId: 2,
              diagnostic: "Otite moyenne aigue",
              ordonnance: "Amoxicilline suspension pediatrique, 7 jours",
              analyses: [],
              champsLibres: {
                temperature: "38.4 C",
                poids: "16.2 kg",
                conseilParents: "Reconsulter si fievre persiste plus de 48h"
              }
            },
            {
              date: new Date("2026-06-20T14:00:00Z"),
              medecinId: 2,
              diagnostic: "Controle vaccinal de routine",
              ordonnance: "Vaccin DTC-Polio administre",
              analyses: [],
              champsLibres: {
                carnetVaccinationAJour: true,
                prochainRappel: "2027-06-20",
                courbeCroissance: "Normale pour l'age"
              }
            }
          ]
        }
      }
    }
  );
  print("Patient 3 : consultations ajoutees.");
} else {
  print("Patient 3 : consultations deja presentes, rien ajoute.");
}

// --------------------------------------------------------------------------------
// 4) NOUVEAU DOSSIER pour un 4e patient (si vous ajoutez un patient Oracle
//    supplementaire plus tard, dupliquez ce bloc avec le bon patientId).
//    Laisse commente par defaut : decommentez et adaptez patientId si besoin.
// --------------------------------------------------------------------------------
// db.dossiers.insertOne({
//   patientId: 4,
//   consultations: [
//     {
//       date: new Date("2026-06-10T09:00:00Z"),
//       medecinId: 1,
//       diagnostic: "Consultation initiale",
//       ordonnance: "",
//       analyses: ["Bilan complet"],
//       champsLibres: {}
//     }
//   ]
// });

// --------------------------------------------------------------------------------
// 5) VÉRIFICATIONS
// --------------------------------------------------------------------------------
print("\n=== Apres enrichissement ===");
print("Nombre de dossiers : " + db.dossiers.countDocuments());
db.dossiers.find().forEach(d => {
  print(" - patientId " + d.patientId + " : " + d.consultations.length + " consultation(s)");
});

print("\n=== Pathologies les plus frequentes (agregation) ===");
db.dossiers.aggregate([
  { $unwind: "$consultations" },
  { $group: { _id: "$consultations.diagnostic", occurrences: { $sum: 1 } } },
  { $sort: { occurrences: -1 } }
]).forEach(printjson);

print("\n=== Consultations par mois et par medecin ===");
db.dossiers.aggregate([
  { $unwind: "$consultations" },
  {
    $group: {
      _id: {
        medecinId: "$consultations.medecinId",
        annee: { $year: "$consultations.date" },
        mois: { $month: "$consultations.date" }
      },
      count: { $sum: 1 }
    }
  },
  { $sort: { "_id.medecinId": 1, "_id.annee": 1, "_id.mois": 1 } }
]).forEach(printjson);

print("\n=== Index existants sur 'dossiers' ===");
db.dossiers.getIndexes().forEach(printjson);

print("\nEnrichissement MongoDB termine avec succes.");
