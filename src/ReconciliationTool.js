import React, { useState, useCallback, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Sun, Moon, Upload, RefreshCw } from 'lucide-react';
import Tooltip from './Tooltip';


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
  const [darkMode, setDarkMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const resetAll = () => {
    setFile1(null);
    setFile2(null);
    setResults(null);
    setProgress(0);
    setError(null);
    setFields([]);
    setSelectedFields({
      key: '',
      compare: []
    });
    setDisplayLimit(100);
    setCurrentStep(1);
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { label: "Fichier 1", complete: !!file1 },
      { label: "Fichier 2", complete: !!file2 },
      { label: "Champs", complete: selectedFields.key && selectedFields.compare.length > 0 },
      { label: "Comparer", complete: !!results }
    ];

    return (
      <div className="flex justify-between items-center mb-6">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step.complete ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'
            } ${currentStep === index + 1 ? 'ring-2 ring-blue-500' : ''}`}>
              {step.complete ? '✓' : index + 1}
            </div>
            <span className="text-xs mt-1">{step.label}</span>
          </div>
        ))}
      </div>
    );
  };

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
    <div className={`min-h-screen p-4 ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Comparaison de fichiers</h1>
          <div className="flex items-center space-x-4">
            <Tooltip content="Réinitialiser tout">
              <button
                onClick={resetAll}
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                <RefreshCw className="w-6 h-6" />
              </button>
            </Tooltip>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>
          </div>
        </div>
        {renderStepIndicator()}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {[1, 2].map((fileNum) => (
            <div key={fileNum} className="mb-4">
              <label className="block mb-2 font-semibold">
                Fichier {fileNum} {fileNum === 1 ? '(Référence)' : '(À comparer)'}
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
                    onChange={(e) => handleFileChange(e, fileNum)}
                    accept=".csv,.xlsx,.xls"
                  />
                </label>
              </div>
              {(fileNum === 1 ? file1 : file2) && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {(fileNum === 1 ? file1 : file2).name}
                </p>
              )}
            </div>
          ))}
        </div>

        {fields.length > 0 && (
          <div className="mb-6">
            <label className="block mb-2 font-semibold">Champ clé pour la comparaison</label>
            <select
              value={selectedFields.key}
              onChange={(e) => setSelectedFields(prev => ({ ...prev, key: e.target.value }))}
              className="block w-full mt-1 rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Sélectionnez un champ</option>
              {fields.map(field => (
                <option key={field} value={field}>{field}</option>
              ))}
            </select>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              La clé de comparaison est utilisée pour identifier les enregistrements correspondants entre les deux fichiers.
            </p>
          </div>
        )}

        {fields.length > 0 && (
          <div className="mb-6">
            <label className="block mb-2 font-semibold">Champs à comparer</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {fields.map(field => (
                <label key={field} className="inline-flex items-center">
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
                    className="form-checkbox h-5 w-5 text-blue-600 dark:text-blue-400"
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">{field}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <button
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-6 disabled:bg-gray-400 disabled:cursor-not-allowed"
          onClick={() => {
            compareFiles();
            setCurrentStep(4);
          }}
          disabled={!file1 || !file2 || !selectedFields.key || selectedFields.compare.length === 0}
        >
          Comparer les fichiers
        </button>

        {progress > 0 && progress < 100 && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6 dark:bg-gray-700">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{width: `${progress}%`}}></div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 dark:bg-red-900 dark:text-red-200" role="alert">
            <strong className="font-bold">Erreur : </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {results && (
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">Résultats de la comparaison</h2>
            <p className="mb-4">Nombre total de différences : {results.length}</p>
            <div className="space-y-4">
              {results.slice(0, displayLimit).map((result, index) => (
                <div key={index} className="border rounded p-4 bg-white dark:bg-gray-800">
                  <h3 className="font-bold">{result.key}</h3>
                  {result.type === 'missing' ? (
                    <p className="text-red-600 dark:text-red-400">Manquant dans {result.source}</p>
                  ) : (
                    <div>
                      <p className="text-orange-600 dark:text-orange-400">Différences détectées dans les champs suivants : {result.fields.join(', ')}</p>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        {Object.entries(result.details).map(([filename, data]) => (
                          <div key={filename} className="bg-gray-100 p-2 rounded dark:bg-gray-700">
                            <h4 className="font-semibold">{filename}</h4>
                            {Object.entries(data).map(([field, value]) => (
                              <p key={field} className={result.fields.includes(field) ? 'text-red-600 dark:text-red-400' : ''}>
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
                className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Afficher plus de résultats
              </button>
            )}
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-2">Guide d'utilisation</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Uploadez le premier fichier (CSV ou XLSX) - fichier de référence.</li>
            <li>Sélectionnez le champ clé pour la comparaison.</li>
            <li>Choisissez les champs à comparer.</li>
            <li>Uploadez le deuxième fichier (CSV ou XLSX) - fichier à comparer.</li>
            <li>Cliquez sur "Comparer les fichiers" pour voir les résultats.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default FileComparisonUI;