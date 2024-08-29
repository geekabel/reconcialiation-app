import * as XLSX from 'xlsx';
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from './constants';

export const validateFile = (file) => {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`La taille du fichier ne doit pas dépasser ${MAX_FILE_SIZE / 1024 / 1024 / 1024} GB.`);
    }
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      throw new Error('Type de fichier non autorisé. Veuillez uploader un fichier XLSX ou CSV.');
    }
  };

  export const readWorkbook = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          resolve(workbook);
        } catch (err) {
          reject(new Error(`Erreur lors du traitement du fichier : ${err.message}`));
        }
      };
      reader.onerror = (e) => reject(new Error('Erreur de lecture du fichier'));
      reader.readAsArrayBuffer(file);
    });
  };

export const getFileHeaders = async (file) => {
  try {
    const workbook = await readWorkbook(file);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0];
    return headers;
  } catch (err) {
    throw new Error(`Erreur lors de la lecture des en-têtes : ${err.message}`);
  }
};

export const generatePreview = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    // Prendre les 5 premières lignes pour la prévisualisation
    return jsonData.slice(0, 5);
  } catch (error) {
    console.error('Erreur lors de la génération de la prévisualisation:', error);
    return null;
  }
};
