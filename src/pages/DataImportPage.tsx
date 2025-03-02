import { useState } from 'react';
import Layout from '../components/Layout';
import CSVImporter from '../components/csv/CSVImporter';

export default function DataImportPage() {
  const [importedData, setImportedData] = useState<any[] | null>(null);
  const [importStatus, setImportStatus] = useState<{
    success: number;
    failed: number;
    total: number;
  } | null>(null);
  
  const handleDataProcessed = (data: any[]) => {
    setImportedData(data);
    
    // Simulate processing the data
    // In a real application, you would save this to your database
    setTimeout(() => {
      const successCount = Math.floor(data.length * 0.9); // Simulate 90% success rate
      setImportStatus({
        success: successCount,
        failed: data.length - successCount,
        total: data.length
      });
    }, 1500);
  };
  
  const handleNewImport = () => {
    setImportedData(null);
    setImportStatus(null);
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Data Import</h1>
          {importedData && (
            <button
              onClick={handleNewImport}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              New Import
            </button>
          )}
        </div>
        
        {!importedData ? (
          <CSVImporter onDataProcessed={handleDataProcessed} />
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Import Results</h2>
            
            {importStatus ? (
              <div className="mb-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Total Records</p>
                    <p className="text-2xl font-bold">{importStatus.total}</p>
                  </div>
                  <div>
                    <p className="text-sm text-green-500">Successfully Imported</p>
                    <p className="text-2xl font-bold text-green-600">{importStatus.success}</p>
                  </div>
                  <div>
                    <p className="text-sm text-red-500">Failed</p>
                    <p className="text-2xl font-bold text-red-600">{importStatus.failed}</p>
                  </div>
                </div>
                
                {importStatus.failed > 0 && (
                  <div className="p-3 bg-yellow-100 text-yellow-800 rounded-md">
                    Some records failed to import. Please check the data and try again.
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-3"></div>
                <p>Processing your data...</p>
              </div>
            )}
            
            <h3 className="text-lg font-medium mb-2">Imported Data Preview</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {importedData.length > 0 && Object.keys(importedData[0]).map((key, index) => (
                      <th
                        key={index}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {importedData.slice(0, 5).map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {Object.values(row).map((value: any, colIndex) => (
                        <td
                          key={colIndex}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                        >
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {importedData.length > 5 && (
                <p className="mt-2 text-sm text-gray-500 text-right">
                  Showing 5 of {importedData.length} records
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
