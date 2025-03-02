import { useState } from 'react';
import { AIService } from '../../services/AIService';

interface AIMatchFinderProps {
  clientProfile: any;
  properties: any[];
  onMatchesFound?: (matches: any[]) => void;
}

export default function AIMatchFinder({ clientProfile, properties, onMatchesFound }: AIMatchFinderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFindMatches = async () => {
    if (!clientProfile || properties.length === 0) {
      setError('Client profile and properties are required');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const matchResults = await AIService.findMatches(clientProfile, properties);
      setMatches(matchResults);
      
      if (onMatchesFound) {
        onMatchesFound(matchResults);
      }
    } catch (err) {
      console.error('Error finding matches:', err);
      setError('Failed to find matches. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">AI Match Finder</h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Find the best property matches for this client profile using AI analysis.
        </p>
      </div>
      
      <button
        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        onClick={handleFindMatches}
        disabled={isLoading || !clientProfile || properties.length === 0}
      >
        {isLoading ? 'Finding Matches...' : 'Find Matches'}
      </button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {matches.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Match Results</h3>
          <div className="space-y-4">
            {matches.map((match, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-md border-l-4 border-indigo-500">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Property ID: {match.propertyId}</span>
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full">
                    Match Score: {match.matchScore}%
                  </span>
                </div>
                
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-700">Match Reasons:</span>
                  <ul className="list-disc pl-5 mt-1 text-sm">
                    {match.matchReasons.map((reason: string, i: number) => (
                      <li key={i}>{reason}</li>
                    ))}
                  </ul>
                </div>
                
                {match.concerns && match.concerns.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Potential Concerns:</span>
                    <ul className="list-disc pl-5 mt-1 text-sm text-amber-700">
                      {match.concerns.map((concern: string, i: number) => (
                        <li key={i}>{concern}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
