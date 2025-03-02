import { useState } from 'react';
import { AIService } from '../../services/AIService';

interface AIClientDiscoveryProps {
  onProfileGenerated?: (profile: any) => void;
}

export default function AIClientDiscovery({ onProfileGenerated }: AIClientDiscoveryProps) {
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      const profile = await AIService.generateClientProfile(description);
      setResult(profile);
      if (onProfileGenerated) {
        onProfileGenerated(profile);
      }
    } catch (err) {
      console.error('Error generating client profile:', err);
      setError('Failed to generate client profile. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">AI Client Discovery</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Client Description
        </label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter a description of the client, their needs, preferences, and any other relevant information..."
        />
      </div>
      
      <button
        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        onClick={handleGenerate}
        disabled={isGenerating || !description.trim()}
      >
        {isGenerating ? 'Generating...' : 'Generate Client Profile'}
      </button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {result && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Generated Profile</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            {result.name && (
              <p className="mb-2">
                <span className="font-medium">Name:</span> {result.name}
              </p>
            )}
            {result.company && (
              <p className="mb-2">
                <span className="font-medium">Company:</span> {result.company}
              </p>
            )}
            {result.type && (
              <p className="mb-2">
                <span className="font-medium">Client Type:</span> {result.type}
              </p>
            )}
            
            <div className="mb-2">
              <span className="font-medium">Preferences:</span>
              <ul className="list-disc pl-5 mt-1">
                {Object.entries(result.preferences).map(([key, value]: [string, any]) => (
                  <li key={key}>
                    <span className="capitalize">{key}:</span>{' '}
                    {Array.isArray(value) ? value.join(', ') : value.toString()}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <span className="font-medium">Suggested Tags:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {result.suggestedTags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
