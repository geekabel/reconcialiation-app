const XLSX = require('xlsx');

function generateTestFile(filename, data) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(wb, filename);
}

const bankData = [
  { id: 1, date: "2023-01-01", montant: 100, beneficiaire: "Alice" },
  { id: 2, date: "2023-01-02", montant: 200, beneficiaire: "Bob" },
  { id: 3, date: "2023-01-03", montant: 300, beneficiaire: "Charlie" },
  { id: 4, date: "2023-01-04", montant: 400, beneficiaire: "David" },
];

const dbData = [
  { id: 1, date: "2023-01-01", montant: 100, beneficiaire: "Alice" },
  { id: 2, date: "2023-01-02", montant: 250, beneficiaire: "Bob" }, // Montant différent
  { id: 3, date: "2023-01-03", montant: 300, beneficiaire: "Charlie" },
  { id: 5, date: "2023-01-05", montant: 500, beneficiaire: "Eve" }, // Nouvel enregistrement
];

generateTestFile("bank_data.xlsx", bankData);
generateTestFile("db_data.xlsx", dbData);

console.log("Fichiers de test générés avec succès !");