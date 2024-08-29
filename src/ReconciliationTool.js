import React, { useState, useCallback, useRef } from 'react';
import * as XLSX from 'xlsx';

const MAX_FILE_SIZE = 1.5 * 1024 * 1024 * 1024; // 1.5 GB
const BATCH_SIZE = 10000; // Nombre de lignes à traiter par lot
const ALLOWED_FILE_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv'
];

const FileComparisonUI = () => {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [results, setResults] = useState(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [fields, setFields] = useState([]);
  const [selectedFields, setSelectedFields] = useState({
    key: '',
    compare: []
  });
  const [displayLimit, setDisplayLimit] = useState(100);
  const workerRef = useRef(null);

  const validateFile = (file) => {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`La taille du fichier ne doit pas dépasser ${MAX_FILE_SIZE / 1024 / 1024 / 1024} GB.`);
    }
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      throw new Error('Type de fichier non autorisé. Veuillez uploader un fichier XLSX ou CSV.');
    }
  };

  const handleFileChange = async (event, fileNumber) => {
    const file = event.target.files[0];
    setError(null);
    try {
      validateFile(file);
      if (fileNumber === 1) {
        setFile1(file);
        const headers = await getFileHeaders(file);
        setFields(headers);
      } else {
        setFile2(file);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const getFileHeaders = async (file) => {
    try {
      const workbook = await readWorkbook(file);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0];
      return headers;
    } catch (err) {
      throw new Error(`Erreur lors de la lecture des en-têtes : ${err.message}`);
    }
  };

  const readWorkbook = (file) => {
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

  const compareFiles = useCallback(async () => {
    if (!file1 || !file2 || !selectedFields.key || selectedFields.compare.length === 0) {
      setError("Veuillez charger les deux fichiers et sélectionner les champs de comparaison.");
      return;
    }

    setError(null);
    setProgress(0);
    setResults(null);

    try {
      const workbook1 = await readWorkbook(file1);
      const workbook2 = await readWorkbook(file2);

      if (workerRef.current) {
        workerRef.current.terminate();
      }

      workerRef.current = new Worker(new URL('./comparisonWorker.js', import.meta.url));

      workerRef.current.onmessage = (e) => {
        if (e.data.type === 'progress') {
          setProgress(e.data.progress);
        } else if (e.data.type === 'result') {
          setResults(e.data.differences);
          setProgress(100);
        } else if (e.data.type === 'error') {
          setError(e.data.message);
        }
      };

      workerRef.current.postMessage({
        workbook1,
        workbook2,
        selectedFields,
        file1Name: file1.name,
        file2Name: file2.name,
        batchSize: BATCH_SIZE
      });

    } catch (err) {
      setError("Une erreur est survenue lors de la comparaison des fichiers : " + err.message);
    }
  }, [file1, file2, selectedFields]);

  const loadMore = () => {
    setDisplayLimit(prevLimit => prevLimit + 100);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Comparaison configurable de fichiers</h1>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        {[1, 2].map((fileNum) => (
          <div key={fileNum} className="mb-4">
            <label className="block mb-2">
              Fichier {fileNum} {fileNum === 1 ? '(Référence)' : '(À comparer)'}
            </label>
            <input
              type="file"
              onChange={(e) => handleFileChange(e, fileNum)}
              accept=".csv,.xlsx,.xls"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {(fileNum === 1 ? file1 : file2) && <p className="mt-2 text-sm text-gray-500">{(fileNum === 1 ? file1 : file2).name}</p>}
          </div>
        ))}
      </div>

      {fields.length > 0 && (
        <div className="mb-4">
          <label className="block mb-2">Champ clé pour la comparaison</label>
          <select
            value={selectedFields.key}
            onChange={(e) => setSelectedFields(prev => ({ ...prev, key: e.target.value }))}
            className="block w-full mt-1 rounded-md border-gray-300 shadow-sm"
          >
            <option value="">Sélectionnez un champ</option>
            {fields.map(field => (
              <option key={field} value={field}>{field}</option>
            ))}
          </select>
          <p className="mt-2 text-sm text-gray-600">
            La clé de comparaison est utilisée pour identifier les enregistrements correspondants entre les deux fichiers. 
            Choisissez un champ qui contient des valeurs uniques pour chaque enregistrement, comme un ID ou un numéro de transaction.
          </p>
        </div>
      )}

      {fields.length > 0 && (
        <div className="mb-4">
          <label className="block mb-2">Champs à comparer</label>
          {fields.map(field => (
            <label key={field} className="inline-flex items-center mr-4">
              <input
                type="checkbox"
                checked={selectedFields.compare.includes(field)}
                onChange={(e) => {
                  setSelectedFields(prev => ({
                    ...prev,
                    compare: e.target.checked
                      ? [...prev.compare, field]
                      : prev.compare.filter(f => f !== field)
                  }));
                }}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2">{field}</span>
            </label>
          ))}
        </div>
      )}

      <button
        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
        onClick={compareFiles}
        disabled={!file1 || !file2 || !selectedFields.key || selectedFields.compare.length === 0}
      >
        Comparer les fichiers
      </button>

      {progress > 0 && progress < 100 && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{width: `${progress}%`}}></div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Erreur : </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {results && (
        <div>
          <h2 className="text-xl font-bold mb-2">Résultats de la comparaison</h2>
          <p className="mb-4">Nombre total de différences : {results.length}</p>
          <div className="space-y-4">
            {results.slice(0, displayLimit).map((result, index) => (
              <div key={index} className="border rounded p-4">
                <h3 className="font-bold">{result.key}</h3>
                {result.type === 'missing' ? (
                  <p className="text-red-600">Manquant dans {result.source}</p>
                ) : (
                  <div>
                    <p className="text-orange-600">Différences détectées dans les champs suivants : {result.fields.join(', ')}</p>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      {Object.entries(result.details).map(([filename, data]) => (
                        <div key={filename} className="bg-gray-100 p-2 rounded">
                          <h4 className="font-semibold">{filename}</h4>
                          {Object.entries(data).map(([field, value]) => (
                            <p key={field} className={result.fields.includes(field) ? 'text-red-600' : ''}>
                              {field}: {value}
                            </p>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          {results.length > displayLimit && (
            <button
              onClick={loadMore}
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Afficher plus de résultats
            </button>
          )}
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Guide d'utilisation</h2>
        <ol className="list-decimal pl-5">
          <li>Uploadez le premier fichier (CSV ou XLSX) - fichier de référence.</li>
          <li>Sélectionnez le champ clé pour la comparaison.</li>
          <li>Choisissez les champs à comparer.</li>
          <li>Uploadez le deuxième fichier (CSV ou XLSX) - fichier à comparer.</li>
          <li>Cliquez sur "Comparer les fichiers" pour voir les résultats.</li>
        </ol>
      </div>
    </div>
  );
};

export default FileComparisonUI;