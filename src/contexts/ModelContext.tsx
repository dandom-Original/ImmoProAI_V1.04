import { createContext, useState, useContext, ReactNode } from 'react';
import { AIService } from '../services/AIService';

interface ModelContextType {
  currentModel: string;
  setCurrentModel: (model: string) => void;
  availableModels: string[];
  setAvailableModels: (models: string[]) => void;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export function ModelProvider({ children }: { children: ReactNode }) {
  const [currentModel, setCurrentModel] = useState<string>(AIService.getModel());
  const [availableModels, setAvailableModels] = useState<string[]>([
    'anthropic/claude-3-opus:beta',
    'anthropic/claude-3-sonnet:beta',
    'anthropic/claude-3-haiku:beta',
    'anthropic/claude-2.1',
    'anthropic/claude-2.0',
    'anthropic/claude-instant-v1',
    'openai/gpt-4-turbo',
    'openai/gpt-4',
    'openai/gpt-3.5-turbo',
    'google/gemini-pro',
    'meta-llama/llama-3-70b-instruct',
    'meta-llama/llama-3-8b-instruct'
  ]);

  const handleSetCurrentModel = (model: string) => {
    AIService.setModel(model);
    setCurrentModel(model);
  };

  return (
    <ModelContext.Provider
      value={{
        currentModel,
        setCurrentModel: handleSetCurrentModel,
        availableModels,
        setAvailableModels,
      }}
    >
      {children}
    </ModelContext.Provider>
  );
}

export function useModel() {
  const context = useContext(ModelContext);
  if (context === undefined) {
    throw new Error('useModel must be used within a ModelProvider');
  }
  return context;
}
