import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import CSVProcessor from './CSVProcessor';

interface CSVImporterProps {
  onDataProcessed: (data: any[]) => void;
}

export default function CSVImporter({ onDataProcessed }: CSVImporterProps) {
  const [csvData, setCsvData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    
    if (acceptedFiles.length === 0) {
      return;
    }
    
    const file = acceptedFiles[0];
    
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = () => {
      const result = reader.result as string;
      setCsvData(result);
    };
    
    reader.onerror = () => {
      setError('Failed to read the file');
    };
    
    reader.readAsText(file);
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    maxFiles: 1
  });
  
  const handleCancel = () => {
    setCsvData(null);
    setError(null);
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      {!csvData ? (
        <>
          <h2 className="text-xl font-semibold mb-4">Import CSV Data</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer ${
              isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'
            }`}
          >
            <input {...getInputProps()} />
            <div className="space-y-2">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="text-lg font-medium text-gray-700">
                {isDragActive ? 'Drop the file here' : 'Drag and drop a CSV file here, or click to select'}
              </p>
              <p className="text-sm text-gray-500">CSV files only</p>
            </div>
          </div>
        </>
      ) : (
        <CSVProcessor
          csvData={csvData}
          onProcessed={onDataProcessed}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
