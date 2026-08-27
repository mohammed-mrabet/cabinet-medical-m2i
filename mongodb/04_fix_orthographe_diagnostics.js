// --------------------------------------------------------------------------------
// 04_fix_orthographe_diagnostics.js
// Corrige une incohérence d'orthographe dans les diagnostics MongoDB qui
// fait que l'agrégation "pathologies les plus fréquentes" compte
// "Controle vaccinal de routine" et "Contrôle vaccinal de routine" comme
// deux diagnostics DIFFÉRENTS (alors que c'est le même), ce qui aplatit
// artificiellement les pourcentages dans le pie chart du dashboard.
//
// Ce script harmonise l'orthographe (avec accent : "Contrôle") sur tous
// les documents existants, sans rien dupliquer ni supprimer.
//
// À exécuter :
//   mongosh "mongodb://localhost:27017/cabinet_medical" --file 04_fix_orthographe_diagnostics.js
// --------------------------------------------------------------------------------

use("cabinet_medical");

print("=== Diagnostics distincts AVANT correction ===");
db.dossiers.aggregate([
  { $unwind: "$consultations" },
  { $group: { _id: "$consultations.diagnostic", occurrences: { $sum: 1 } } },
  { $sort: { occurrences: -1 } }
]).forEach(printjson);

// Liste des corrections à appliquer : [ancienne valeur, nouvelle valeur]
// Ajoutez ici toute autre variante orthographique que vous repérez dans
// votre propre base (différences d'accents, de majuscules, fautes de frappe).
const corrections = [
  ["Controle vaccinal de routine", "Contrôle vaccinal de routine"],
  ["Controle de croissance", "Contrôle de croissance"],
  ["Controle pediatrique", "Contrôle pédiatrique"],
];

let totalModifie = 0;
corrections.forEach(([ancien, nouveau]) => {
  const res = db.dossiers.updateMany(
    { "consultations.diagnostic": ancien },
    { $set: { "consultations.$[elem].diagnostic": nouveau } },
    { arrayFilters: [{ "elem.diagnostic": ancien }] }
  );
  if (res.modifiedCount > 0) {
    print(`Corrige : "${ancien}" -> "${nouveau}" (${res.modifiedCount} dossier(s) modifie(s))`);
    totalModifie += res.modifiedCount;
  }
});

if (totalModifie === 0) {
  print("Aucune correction necessaire : orthographe deja homogene.");
}

print("\n=== Diagnostics distincts APRES correction ===");
db.dossiers.aggregate([
  { $unwind: "$consultations" },
  { $group: { _id: "$consultations.diagnostic", occurrences: { $sum: 1 } } },
  { $sort: { occurrences: -1 } }
]).forEach(printjson);

print("\nCorrection terminee.");
