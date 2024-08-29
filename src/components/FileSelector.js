import React from 'react';
import { Upload, HelpCircle } from 'lucide-react';
import Tooltip from './Tooltip';

const FileSelector = ({ fileNum, file, onFileChange }) => {
  return (
    <div className="mb-4">
      <label className="block mb-2 font-semibold">
        Fichier {fileNum} {fileNum === 1 ? '(Référence)' : '(À comparer)'}
        <Tooltip content={`Uploadez le fichier ${fileNum === 1 ? 'de référence' : 'à comparer'} (CSV ou XLSX)`}>
          <HelpCircle className="inline-block ml-1 w-4 h-4" />
        </Tooltip>
      </label>
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Cliquez pour uploader</span> ou glissez et déposez
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">XLSX, CSV</p>
          </div>
          <input
            type="file"
            className="hidden"
            onChange={(e) => onFileChange(e, fileNum)}
            accept=".csv,.xlsx,.xls"
          />
        </label>
      </div>
      {file && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {file.name}
        </p>
      )}
    </div>
  );
};

export default FileSelector;