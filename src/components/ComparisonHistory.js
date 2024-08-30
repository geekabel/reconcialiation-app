import React from 'react';
import { Clock } from 'lucide-react';

const ComparisonHistory = ({ history, onSelectComparison }) => {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Historique des comparaisons</h2>
      {history.length === 0 ? (
        <p>Aucune comparaison précédente.</p>
      ) : (
        <ul className="space-y-2">
          {history.map((item, index) => (
            <li key={index} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg flex justify-between items-center">
              <div>
                <p className="font-semibold">{item.file1} vs {item.file2}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <Clock size={16} className="inline mr-1" />
                  {new Date(item.timestamp).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => onSelectComparison(item)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Voir
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ComparisonHistory;