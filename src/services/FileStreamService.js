// src/services/FileStreamService.js
import * as XLSX from 'xlsx';

export const FileStreamService = {
  async processFileInChunks(file, chunkSize = 1024 * 1024, onProgress) {
    const fileSize = file.size;
    let offset = 0;
    const workbook = XLSX.utils.book_new();
    let sheetData = [];

    while (offset < fileSize) {
      const chunk = await this.readChunk(file, offset, chunkSize);
      const partialWorkbook = XLSX.read(chunk, { type: 'array' });
      const sheetName = partialWorkbook.SheetNames[0];
      const partialSheet = partialWorkbook.Sheets[sheetName];
      const partialData = XLSX.utils.sheet_to_json(partialSheet, { header: 1, raw: false });

      sheetData = sheetData.concat(partialData.slice(offset === 0 ? 0 : 1));
      offset += chunkSize;

      // Call progress callback
      if (onProgress) {
        onProgress(Math.min(100, (offset / fileSize) * 100));
      }
    }

    const sheet = XLSX.utils.aoa_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(workbook, sheet, "Sheet1");

    return workbook;
  },

  readChunk(file, offset, length) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(new Uint8Array(e.target.result));
      reader.onerror = (e) => reject(e);
      reader.readAsArrayBuffer(file.slice(offset, offset + length));
    });
  },
};