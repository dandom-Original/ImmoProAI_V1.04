import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AIAgent {
  id: string;
  name: string;
  description: string;
  type: 'discovery' | 'analysis' | 'matching';
  isActive: boolean;
  lastRun?: string;
  settings?: Record<string, any>;
}

interface AIAgentsContextType {
  agents: AIAgent[];
  toggleAgent: (id: string) => void;
  updateAgentSettings: (id: string, settings: Record<string, any>) => void;
}

const defaultAgents: AIAgent[] = [
  {
    id: 'client-discovery',
    name: 'Client Discovery Agent',
    description: 'Automatically discovers potential clients based on your criteria',
    type: 'discovery',
    isActive: false,
    settings: {
      runFrequency: 'daily',
      sources: ['web', 'database'],
      criteria: {
        budget: { min: 500000, max: 5000000 },
        propertyTypes: ['commercial', 'residential'],
        locations: ['Berlin', 'Hamburg', 'Munich']
      }
    }
  },
  {
    id: 'property-analyzer',
    name: 'Property Analysis Agent',
    description: 'Analyzes properties to identify key selling points and target demographics',
    type: 'analysis',
    isActive: false,
    settings: {
      runFrequency: 'on-demand',
      analysisDepth: 'comprehensive',
      includeSimilarProperties: true
    }
  },
  {
    id: 'match-finder',
    name: 'Match Finding Agent',
    description: 'Automatically matches clients with suitable properties',
    type: 'matching',
    isActive: false,
    settings: {
      runFrequency: 'weekly',
      matchThreshold: 70,
      notifyClients: false,
      notifyAgents: true
    }
  }
];

const AIAgentsContext = createContext<AIAgentsContextType | undefined>(undefined);

export const AIAgentsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [agents, setAgents] = useState<AIAgent[]>(defaultAgents);

  const toggleAgent = (id: string) => {
    setAgents(prev => 
      prev.map(agent => 
        agent.id === id 
          ? { ...agent, isActive: !agent.isActive, lastRun: agent.isActive ? agent.lastRun : new Date().toISOString() } 
          : agent
      )
    );
  };

  const updateAgentSettings = (id: string, settings: Record<string, any>) => {
    setAgents(prev => 
      prev.map(agent => 
        agent.id === id 
          ? { ...agent, settings: { ...agent.settings, ...settings } } 
          : agent
      )
    );
  };

  return (
    <AIAgentsContext.Provider
      value={{
        agents,
        toggleAgent,
        updateAgentSettings
      }}
    >
      {children}
    </AIAgentsContext.Provider>
  );
};

export const useAIAgents = () => {
  const context = useContext(AIAgentsContext);
  if (context === undefined) {
    throw new Error('useAIAgents must be used within an AIAgentsProvider');
  }
  return context;
};
