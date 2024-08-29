/* eslint-disable no-restricted-globals */
import * as XLSX from 'xlsx';

// Utiliser une IIFE (Immediately Invoked Function Expression) pour éviter l'utilisation directe de 'self'
(function() {
  self.onmessage = function(e) {
    const { workbook1, workbook2, selectedFields, file1Name, file2Name, batchSize } = e.data;

    try {
      const sheet1 = workbook1.Sheets[workbook1.SheetNames[0]];
      const sheet2 = workbook2.Sheets[workbook2.SheetNames[0]];

      const data1 = XLSX.utils.sheet_to_json(sheet1, { raw: false });
      const data2 = XLSX.utils.sheet_to_json(sheet2, { raw: false });

      const totalRows = Math.max(data1.length, data2.length);
      const differences = [];
      const processedKeys = new Set();

      for (let i = 0; i < totalRows; i += batchSize) {
        const batchEnd = Math.min(i + batchSize, totalRows);
        
        for (let j = i; j < batchEnd; j++) {
          const row1 = data1[j];
          const row2 = data2.find(r => r[selectedFields.key] === row1?.[selectedFields.key]);
          
          if (row1) processedKeys.add(row1[selectedFields.key]);

          if (row1 && !row2) {
            differences.push({ 
              key: row1[selectedFields.key], 
              type: 'missing', 
              source: file2Name, 
              details: row1 
            });
          } else if (row1 && row2) {
            const mismatchedFields = selectedFields.compare.filter(field => row1[field] !== row2[field]);
            if (mismatchedFields.length > 0) {
              differences.push({
                key: row1[selectedFields.key],
                type: 'mismatch',
                fields: mismatchedFields,
                details: { [file1Name]: row1, [file2Name]: row2 }
              });
            }
          }
        }

        postMessage({ type: 'progress', progress: Math.floor((batchEnd / totalRows) * 90) });
      }

      // Check for rows in data2 that are not in data1
      for (const row2 of data2) {
        if (!processedKeys.has(row2[selectedFields.key])) {
          differences.push({ 
            key: row2[selectedFields.key], 
            type: 'missing', 
            source: file1Name, 
            details: row2 
          });
        }
      }

      postMessage({ type: 'result', differences });
    } catch (error) {
      postMessage({ type: 'error', message: error.message });
    }
  };
})();