import React from 'react';
import { useModel, AITask } from '../../contexts/ModelContext';

const ModelSettings: React.FC = () => {
  const { availableModels, selectedModels, isLoading, error, setModelForTask } = useModel();

  const taskLabels: Record<AITask, string> = {
    clientDiscovery: 'Client Discovery',
    propertyAnalysis: 'Property Analysis',
    matchFinding: 'Match Finding'
  };

  const taskDescriptions: Record<AITask, string> = {
    clientDiscovery: 'AI model used for discovering and analyzing potential clients',
    propertyAnalysis: 'AI model used for analyzing property features and market positioning',
    matchFinding: 'AI model used for matching clients with suitable properties'
  };

  if (isLoading) {
    return (
      <div className="py-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-500">Loading available models...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Error loading models: {error.message}
              </p>
              <p className="text-sm text-red-700 mt-2">
                Using default model settings. Please check your API configuration.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.keys(taskLabels).map((task) => (
        <div key={task} className="bg-gray-50 p-4 rounded-md">
          <label htmlFor={`model-${task}`} className="block text-sm font-medium text-gray-700">
            {taskLabels[task as AITask]}
          </label>
          <p className="mt-1 text-sm text-gray-500">
            {taskDescriptions[task as AITask]}
          </p>
          <select
            id={`model-${task}`}
            name={`model-${task}`}
            className="mt-2 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={selectedModels[task as AITask].id}
            onChange={(e) => {
              const selectedModel = availableModels.find(model => model.id === e.target.value);
              if (selectedModel) {
                setModelForTask(task as AITask, selectedModel);
              }
            }}
          >
            {availableModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-gray-500">
            Currently using: <span className="font-medium">{selectedModels[task as AITask].name}</span>
          </p>
        </div>
      ))}

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Note: Different models have different capabilities and pricing. Choose models appropriate for each task.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelSettings;
