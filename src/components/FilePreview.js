import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

const FilePreview = ({ preview1, preview2, file1, file2, showPreview, setShowPreview }) => {
  const renderPreview = (preview, fileName) => {
    if (!preview) return null;
    return (
      <div className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="font-bold mb-2">Aperçu de {fileName}</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                {preview[0].map((header, index) => (
                  <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {preview.slice(1).map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <>
      {(preview1 || preview2) && (
        <div className="mb-6">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center justify-center w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {showPreview ? <EyeOff className="mr-2" /> : <Eye className="mr-2" />}
            {showPreview ? "Masquer l'aperçu" : "Afficher l'aperçu"}
          </button>
        </div>
      )}
      {showPreview && (
        <div className="mb-6">
          {preview1 && file1 && renderPreview(preview1, file1.name)}
          {preview2 && file2 && renderPreview(preview2, file2.name)}
        </div>
      )}
    </>
  );
};

export default FilePreview;