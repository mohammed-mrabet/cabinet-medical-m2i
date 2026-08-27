// =====================================================================
// Cabinet Médical - Script MongoDB : collection "dossiers"
// A exécuter dans mongosh : mongosh "mongodb://localhost:27017/cabinet_medical"
// =====================================================================

// ---------------------------------------------------------------------
// 1. Création de la base et de la collection avec validation de schéma
// ---------------------------------------------------------------------

// Sélectionner la base (équivalent à "use cabinet_medical" dans une session interactive)
db = db.getSiblingDB("cabinet_medical");

db.createCollection("dossiers", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["patientId", "consultations"],
      properties: {
        patientId: {
          bsonType: ["int", "long"],
          description: "Identifiant du patient (clé étrangère logique vers Oracle PATIENT.ID)"
        },
        consultations: {
          bsonType: "array",
          description: "Historique des consultations du patient",
          items: {
            bsonType: "object",
            required: ["date", "medecinId", "diagnostic"],
            properties: {
              date: { bsonType: "date" },
              medecinId: { bsonType: ["int", "long"] },
              diagnostic: { bsonType: "string" },
              ordonnance: { bsonType: "string" },
              analyses: { bsonType: "array" }
            }
          }
        }
      }
    }
  },
  validationLevel: "moderate"
});

print("✅ Collection 'dossiers' créée avec succès !");

// ---------------------------------------------------------------------
// 2. Index sur patientId
// ---------------------------------------------------------------------
db.dossiers.createIndex({ patientId: 1 }, { unique: true, name: "idx_patientId" });
db.dossiers.createIndex({ "consultations.medecinId": 1, "consultations.date": 1 },
                         { name: "idx_consultations_medecin_date" });

print("✅ Index créés avec succès !");

// ---------------------------------------------------------------------
// 3. Documents de test
// ---------------------------------------------------------------------
db.dossiers.insertMany([
  {
    patientId: 1,
    consultations: [
      {
        date: new Date("2026-03-10T09:00:00Z"),
        medecinId: 1,
        diagnostic: "Hypertension artérielle légère",
        ordonnance: "Amlodipine 5mg - 1 cp/jour pendant 30 jours",
        analyses: ["ECG", "Bilan lipidique"]
      },
      {
        date: new Date("2026-06-20T09:00:00Z"),
        medecinId: 1,
        diagnostic: "Suivi tension artérielle - stabilisée",
        ordonnance: "Poursuite du traitement",
        analyses: [],
        remarques: "Patient observant, tension normalisée"
      }
    ]
  },
  {
    patientId: 2,
    consultations: [
      {
        date: new Date("2026-06-20T10:30:00Z"),
        medecinId: 1,
        diagnostic: "Douleurs thoraciques d'origine anxieuse",
        ordonnance: "Anxiolytique léger - avis cardiologique de contrôle dans 1 mois",
        analyses: ["ECG", "Radio thorax"],
        resultatsRadio: "RAS, pas d'anomalie pulmonaire visible"
      }
    ]
  },
  {
    patientId: 3,
    consultations: [
      {
        date: new Date("2026-06-20T14:00:00Z"),
        medecinId: 2,
        diagnostic: "Contrôle vaccinal de routine",
        ordonnance: "Vaccin DTC-Polio administré",
        analyses: [],
        carnetVaccinationAJour: true
      }
    ]
  }
]);

print("✅ 3 documents de test insérés avec succès !");

// ---------------------------------------------------------------------
// 4. Vérifications
// ---------------------------------------------------------------------
print("\n📋 Documents dans la collection :");
db.dossiers.find().forEach(printjson);

print("\n📋 Index :");
db.dossiers.getIndexes().forEach(printjson);