import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const BatchComparison = ({ onCompare }) => {
  const [filePairs, setFilePairs] = useState([{ file1: null, file2: null }]);

  const addFilePair = () => {
    setFilePairs([...filePairs, { file1: null, file2: null }]);
  };

  const removeFilePair = (index) => {
    const newFilePairs = filePairs.filter((_, i) => i !== index);
    setFilePairs(newFilePairs);
  };

  const handleFileChange = (index, fileNumber, file) => {
    const newFilePairs = [...filePairs];
    newFilePairs[index][`file${fileNumber}`] = file;
    setFilePairs(newFilePairs);
  };

  const handleCompare = () => {
    onCompare(filePairs);
  };

  return (
    <div className="space-y-4">
      {filePairs.map((pair, index) => (
        <div key={index} className="flex items-center space-x-4">
          <input
            type="file"
            onChange={(e) => handleFileChange(index, 1, e.target.files[0])}
            className="flex-1"
          />
          <input
            type="file"
            onChange={(e) => handleFileChange(index, 2, e.target.files[0])}
            className="flex-1"
          />
          <button onClick={() => removeFilePair(index)} className="p-2 bg-red-500 text-white rounded">
            <Trash2 size={20} />
          </button>
        </div>
      ))}
      <div className="flex justify-between">
        <button onClick={addFilePair} className="p-2 bg-blue-500 text-white rounded flex items-center">
          <Plus size={20} className="mr-2" /> Ajouter une paire
        </button>
        <button onClick={handleCompare} className="p-2 bg-green-500 text-white rounded">
          Comparer tous
        </button>
      </div>
    </div>
  );
};

export default BatchComparison;