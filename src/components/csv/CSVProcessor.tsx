import { useState } from 'react';

interface CSVProcessorProps {
  csvData: string;
  onProcessed: (data: any[]) => void;
  onCancel: () => void;
}

export default function CSVProcessor({ csvData, onProcessed, onCancel }: CSVProcessorProps) {
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [requiredFields, setRequiredFields] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Parse CSV data to get headers and preview rows
  const parseCSV = () => {
    try {
      const lines = csvData.split('\n');
      const headers = lines[0].split(',').map(header => header.trim());
      
      // Get up to 5 rows for preview
      const previewRows = [];
      for (let i = 1; i < Math.min(lines.length, 6); i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',').map(value => value.trim());
          const row: Record<string, string> = {};
          
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          
          previewRows.push(row);
        }
      }
      
      return { headers, previewRows };
    } catch (err) {
      console.error('Error parsing CSV:', err);
      setError('Failed to parse CSV data. Please check the format.');
      return { headers: [], previewRows: [] };
    }
  };
  
  const { headers, previewRows } = parseCSV();
  
  const handleMappingChange = (csvField: string, appField: string) => {
    setMappings(prev => ({
      ...prev,
      [csvField]: appField
    }));
  };
  
  const handleProcessData = () => {
    try {
      // Check if all required fields are mapped
      const missingRequiredFields = requiredFields.filter(field => 
        !Object.values(mappings).includes(field)
      );
      
      if (missingRequiredFields.length > 0) {
        setError(`Missing required field mappings: ${missingRequiredFields.join(', ')}`);
        return;
      }
      
      const lines = csvData.split('\n');
      const csvHeaders = lines[0].split(',').map(header => header.trim());
      
      const processedData = [];
      
      // Process each data row
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',').map(value => value.trim());
        const dataRow: Record<string, string> = {};
        
        // Apply mappings
        csvHeaders.forEach((header, index) => {
          const appField = mappings[header];
          if (appField) {
            dataRow[appField] = values[index] || '';
          }
        });
        
        processedData.push(dataRow);
      }
      
      onProcessed(processedData);
    } catch (err) {
      console.error('Error processing CSV data:', err);
      setError('Failed to process CSV data. Please check the format and mappings.');
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Map CSV Fields</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Data Preview</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {headers.map((header, index) => (
                  <th
                    key={index}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {previewRows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {headers.map((header, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    >
                      {row[header]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Field Mappings</h3>
        <p className="text-sm text-gray-600 mb-4">
          Map each CSV field to the corresponding field in your application.
        </p>
        
        <div className="space-y-3">
          {headers.map((header, index) => (
            <div key={index} className="flex items-center">
              <span className="w-1/3 text-sm font-medium text-gray-700">{header}:</span>
              <select
                className="w-2/3 px-3 py-2 border border-gray-300 rounded-md"
                value={mappings[header] || ''}
                onChange={(e) => handleMappingChange(header, e.target.value)}
              >
                <option value="">-- Select Field --</option>
                <option value="name">Name</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="company">Company</option>
                <option value="address">Address</option>
                <option value="city">City</option>
                <option value="state">State/Province</option>
                <option value="country">Country</option>
                <option value="postalCode">Postal Code</option>
                <option value="notes">Notes</option>
                <option value="budget">Budget</option>
                <option value="preferredLocation">Preferred Location</option>
                <option value="propertyType">Property Type</option>
                <option value="minSize">Minimum Size</option>
                <option value="maxSize">Maximum Size</option>
              </select>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleProcessData}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Process Data
        </button>
      </div>
    </div>
  );
}
