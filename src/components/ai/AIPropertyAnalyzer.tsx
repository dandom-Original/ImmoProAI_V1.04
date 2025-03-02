import { useState } from 'react';
import { AIService } from '../../services/AIService';

interface AIPropertyAnalyzerProps {
  propertyData: any;
  onAnalysisComplete?: (analysis: any) => void;
}

export default function AIPropertyAnalyzer({ propertyData, onAnalysisComplete }: AIPropertyAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!propertyData) {
      setError('Property data is required');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    
    try {
      const result = await AIService.analyzeProperty(propertyData);
      setAnalysis(result);
      
      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }
    } catch (err) {
      console.error('Error analyzing property:', err);
      setError('Failed to analyze property. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">AI Property Analyzer</h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Get AI-powered insights and analysis for this property.
        </p>
      </div>
      
      <button
        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        onClick={handleAnalyze}
        disabled={isAnalyzing || !propertyData}
      >
        {isAnalyzing ? 'Analyzing...' : 'Analyze Property'}
      </button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {analysis && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Analysis Results</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="mb-4 text-gray-800">{analysis.summary}</p>
            
            <div className="mb-3">
              <h4 className="font-medium text-gray-900 mb-1">Strengths</h4>
              <ul className="list-disc pl-5 text-green-700">
                {analysis.strengths.map((strength: string, index: number) => (
                  <li key={index}>{strength}</li>
                ))}
              </ul>
            </div>
            
            <div className="mb-3">
              <h4 className="font-medium text-gray-900 mb-1">Weaknesses</h4>
              <ul className="list-disc pl-5 text-red-700">
                {analysis.weaknesses.map((weakness: string, index: number) => (
                  <li key={index}>{weakness}</li>
                ))}
              </ul>
            </div>
            
            <div className="mb-3">
              <h4 className="font-medium text-gray-900 mb-1">Potential Buyers</h4>
              <ul className="list-disc pl-5 text-gray-700">
                {analysis.potentialBuyers.map((buyer: string, index: number) => (
                  <li key={index}>{buyer}</li>
                ))}
              </ul>
            </div>
            
            <div className="mb-3">
              <h4 className="font-medium text-gray-900 mb-1">Suggested Tags</h4>
              <div className="flex flex-wrap gap-1 mt-1">
                {analysis.suggestedTags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Estimated Value</h4>
              <p className="text-indigo-700 font-medium">{analysis.estimatedValue}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
