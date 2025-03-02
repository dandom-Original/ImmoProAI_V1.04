import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClients } from '../hooks/useClients';
import AIClientDiscovery from '../components/ai/AIClientDiscovery';

const AIAgentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { fetchClients } = useClients();
  const [activeTab, setActiveTab] = useState('discovery');

  const handleClientCreated = () => {
    fetchClients();
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">AI Agents</h1>
          <p className="mt-2 text-sm text-gray-700">
            Leverage AI to automate tasks, discover clients, and analyze properties.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className="sm:hidden">
          <label htmlFor="tabs" className="sr-only">Select a tab</label>
          <select
            id="tabs"
            name="tabs"
            className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
          >
            <option value="discovery">Client Discovery</option>
            <option value="analysis">Property Analysis</option>
            <option value="matching">Matching Engine</option>
          </select>
        </div>
        <div className="hidden sm:block">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('discovery')}
                className={`${
                  activeTab === 'discovery'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Client Discovery
              </button>
              <button
                onClick={() => setActiveTab('analysis')}
                className={`${
                  activeTab === 'analysis'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Property Analysis
              </button>
              <button
                onClick={() => setActiveTab('matching')}
                className={`${
                  activeTab === 'matching'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Matching Engine
              </button>
            </nav>
          </div>
        </div>
      </div>

      <div className="mt-6">
        {activeTab === 'discovery' && (
          <div>
            <AIClientDiscovery onClientCreated={handleClientCreated} />
            
            <div className="mt-8 bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Client Discovery Settings</h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>
                    Configure how the AI discovers potential clients and what information to gather.
                  </p>
                </div>
                <div className="mt-5">
                  <p className="text-sm text-gray-500">
                    This feature will be expanded in future updates to include:
                  </p>
                  <ul className="mt-2 list-disc pl-5 text-sm text-gray-500">
                    <li>Automated web scraping for client discovery</li>
                    <li>Scheduled discovery runs</li>
                    <li>Custom discovery templates</li>
                    <li>Integration with external data sources</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div>
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Property Analysis</h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>
                    Use AI to analyze properties and get insights on market positioning, target demographics, and investment potential.
                  </p>
                </div>
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => navigate('/properties')}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Go to Properties
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-8 bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Analysis Settings</h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>
                    Configure how the AI analyzes properties and what insights to generate.
                  </p>
                </div>
                <div className="mt-5">
                  <p className="text-sm text-gray-500">
                    This feature will be expanded in future updates to include:
                  </p>
                  <ul className="mt-2 list-disc pl-5 text-sm text-gray-500">
                    <li>Customizable analysis templates</li>
                    <li>Comparative market analysis</li>
                    <li>Investment ROI calculations</li>
                    <li>Trend analysis and forecasting</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'matching' && (
          <div>
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Client-Property Matching</h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>
                    Use AI to match clients with properties based on their preferences and needs.
                  </p>
                </div>
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => navigate('/matching')}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Go to Matching
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-8 bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Matching Settings</h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>
                    Configure how the AI matches clients with properties and what factors to consider.
                  </p>
                </div>
                <div className="mt-5">
                  <p className="text-sm text-gray-500">
                    This feature will be expanded in future updates to include:
                  </p>
                  <ul className="mt-2 list-disc pl-5 text-sm text-gray-500">
                    <li>Customizable matching algorithms</li>
                    <li>Weighted preference matching</li>
                    <li>Automated match notifications</li>
                    <li>Batch matching operations</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAgentsPage;
