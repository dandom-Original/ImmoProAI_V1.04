import React from 'react';
import { ChevronRight } from 'lucide-react';

interface RelationshipStageSelectorProps {
  currentStage: string;
  onChange: (stage: string) => void;
  isLoading: boolean;
}

const stages = [
  { id: 'new', name: 'New', color: 'bg-gray-200' },
  { id: 'qualified', name: 'Qualified', color: 'bg-blue-200' },
  { id: 'proposal', name: 'Proposal', color: 'bg-indigo-200' },
  { id: 'negotiation', name: 'Negotiation', color: 'bg-purple-200' },
  { id: 'closed_won', name: 'Closed Won', color: 'bg-green-200' },
  { id: 'closed_lost', name: 'Closed Lost', color: 'bg-red-200' }
];

const RelationshipStageSelector: React.FC<RelationshipStageSelectorProps> = ({
  currentStage,
  onChange,
  isLoading
}) => {
  const currentIndex = stages.findIndex(stage => stage.id === currentStage) || 0;
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700">Relationship Stage</h3>
        {isLoading && (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent text-indigo-600 motion-reduce:animate-[spin_1.5s_linear_infinite]"></span>
        )}
      </div>
      
      <div className="relative">
        <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-100">
          {stages.map((stage, index) => (
            <div
              key={stage.id}
              className={`${stage.color} ${
                index <= currentIndex ? 'opacity-100' : 'opacity-30'
              } h-full flex flex-col text-center whitespace-nowrap text-white justify-center`}
              style={{ width: `${100 / stages.length}%` }}
            ></div>
          ))}
        </div>
        
        <div className="mt-3 grid grid-cols-6 gap-1 text-xs">
          {stages.map((stage, index) => (
            <button
              key={stage.id}
              onClick={() => onChange(stage.id)}
              disabled={isLoading}
              className={`px-1 py-1 rounded text-center ${
                currentStage === stage.id
                  ? 'bg-indigo-100 text-indigo-800 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {stage.name}
              {index < stages.length - 1 && (
                <ChevronRight className="inline h-3 w-3 ml-1" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RelationshipStageSelector;
