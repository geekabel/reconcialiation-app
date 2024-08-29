// src/constants.js
export const MAX_FILE_SIZE = 1.5 * 1024 * 1024 * 1024; // 1.5 GB
export const BATCH_SIZE = 10000; // Nombre de lignes à traiter par lot
export const ALLOWED_FILE_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv'
];