import React, { useState } from 'react';
import { useMatching } from '../../hooks/useMatching';
import { useClients } from '../../hooks/useClients';
import { useProperties } from '../../hooks/useProperties';
import { Match } from '../../hooks/useMatching';
import { PurchaseProfile } from '../clients/PurchaseProfileForm';
import { Property } from '../../hooks/useProperties';
import { Search, RefreshCw, Check, X, AlertTriangle } from 'lucide-react';

interface MatchingEngineProps {
  mode: 'profile' | 'property';
  profileId?: string;
  propertyId?: string;
  clientId?: string;
  onMatchesFound?: (matches: Match[]) => void;
}

export default function MatchingEngine({ 
  mode, 
  profileId, 
  propertyId, 
  clientId,
  onMatchesFound 
}: MatchingEngineProps) {
  const { findMatchesForProfile, findMatchesForProperty, loading, error } = useMatching();
  const { clients } = useClients();
  const { properties } = useProperties();
  
  const [selectedProfileId, setSelectedProfileId] = useState<string>(profileId || '');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(propertyId || '');
  const [selectedClientId, setSelectedClientId] = useState<string>(clientId || '');
  const [clientProfiles, setClientProfiles] = useState<PurchaseProfile[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchCompleted, setSearchCompleted] = useState(false);
  
  // Fetch profiles for selected client
  const handleClientChange = async (clientId: string) => {
    setSelectedClientId(clientId);
    setSelectedProfileId('');
    
    if (!clientId) {
      setClientProfiles([]);
      return;
    }
    
    try {
      const { data } = await supabase
        .from('purchase_profiles')
        .select('*')
        .eq('client_id', clientId)
        .eq('is_active', true);
      
      setClientProfiles(data || []);
    } catch (error) {
      console.error('Error fetching client profiles:', error);
    }
  };
  
  const handleSearch = async () => {
    setIsSearching(true);
    setSearchCompleted(false);
    setMatches([]);
    
    try {
      let foundMatches: Match[] = [];
      
      if (mode === 'profile' && selectedProfileId) {
        foundMatches = await findMatchesForProfile(selectedProfileId);
      } else if (mode === 'property' && selectedPropertyId) {
        foundMatches = await findMatchesForProperty(selectedPropertyId);
      }
      
      setMatches(foundMatches);
      setSearchCompleted(true);
      
      if (onMatchesFound) {
        onMatchesFound(foundMatches);
      }
    } catch (error) {
      console.error('Error searching for matches:', error);
    } finally {
      setIsSearching(false);
    }
  };
  
  const getPropertyById = (id: string): Property | undefined => {
    return properties.find(p => p.id === id);
  };
  
  const getProfileById = (id: string): PurchaseProfile | undefined => {
    return clientProfiles.find(p => p.id === id);
  };
  
  const getClientById = (id: string) => {
    return clients.find(c => c.id === id);
  };
  
  const renderMatchResults = () => {
    if (!searchCompleted) return null;
    
    if (matches.length === 0) {
      return (
        <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Keine passenden {mode === 'profile' ? 'Immobilien' : 'Kaufprofile'} gefunden.
              </p>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          {matches.length} {matches.length === 1 ? 'Match' : 'Matches'} gefunden
        </h3>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {matches.map(match => {
              const property = mode === 'profile' 
                ? match.property 
                : getPropertyById(match.property_id);
              
              const profile = mode === 'property' 
                ? match.profile 
                : getProfileById(match.profile_id);
              
              const client = mode === 'property' 
                ? getClientById(match.client_id) 
                : null;
              
              if (!property && mode === 'profile') return null;
              if (!profile && mode === 'property') return null;
              
              return (
                <li key={match.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      {mode === 'profile' && property && (
                        <>
                          <h4 className="text-lg font-medium text-indigo-600">
                            {property.title}
                          </h4>
                          <p className="text-sm text-gray-500">{property.address}</p>
                          <div className="mt-1 flex items-center">
                            <span className="text-sm font-medium text-gray-900">
                              {property.price ? `€${property.price.toLocaleString('de-DE')}` : 'Preis auf Anfrage'}
                            </span>
                            <span className="mx-2 text-gray-500">•</span>
                            <span className="text-sm text-gray-500">
                              {property.size} m² • {property.rooms} {property.rooms === 1 ? 'Zimmer' : 'Zimmer'}
                            </span>
                          </div>
                        </>
                      )}
                      
                      {mode === 'property' && profile && client && (
                        <>
                          <h4 className="text-lg font-medium text-indigo-600">
                            {client.name} - {profile.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {profile.property_type} • {profile.locations?.join(', ')}
                          </p>
                          <div className="mt-1 flex items-center">
                            <span className="text-sm font-medium text-gray-900">
                              {profile.min_price ? `€${profile.min_price.toLocaleString('de-DE')}` : '€0'} - 
                              {profile.max_price ? `€${profile.max_price.toLocaleString('de-DE')}` : 'unbegrenzt'}
                            </span>
                            <span className="mx-2 text-gray-500">•</span>
                            <span className="text-sm text-gray-500">
                              {profile.min_size || 0} - {profile.max_size || '∞'} m²
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <div className="text-2xl font-bold text-indigo-600">{match.score}%</div>
                      <div className="mt-1 w-24 bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-indigo-600 h-2.5 rounded-full" 
                          style={{ width: `${match.score}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  };
  
  return (
    <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            {mode === 'profile' ? 'Immobilien finden' : 'Kaufprofile finden'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {mode === 'profile' 
              ? 'Finden Sie passende Immobilien für ein Kaufprofil.' 
              : 'Finden Sie passende Kaufprofile für eine Immobilie.'}
          </p>
        </div>
        
        <div className="mt-5 md:mt-0 md:col-span-2">
          <div className="grid grid-cols-1 gap-6">
            {mode === 'profile' && (
              <>
                {!profileId && (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="client" className="block text-sm font-medium text-gray-700">
                        Kunde
                      </label>
                      <select
                        id="client"
                        name="client"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        value={selectedClientId}
                        onChange={(e) => handleClientChange(e.target.value)}
                      >
                        <option value="">Kunde auswählen</option>
                        {clients.map(client => (
                          <option key={client.id} value={client.id}>{client.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="profile" className="block text-sm font-medium text-gray-700">
                        Kaufprofil
                      </label>
                      <select
                        id="profile"
                        name="profile"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        value={selectedProfileId}
                        onChange={(e) => setSelectedProfileId(e.target.value)}
                        disabled={clientProfiles.length === 0}
                      >
                        <option value="">Profil auswählen</option>
                        {clientProfiles.map(profile => (
                          <option key={profile.id} value={profile.id}>{profile.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </>
            )}
            
            <boltAction type="file" filePath="src/components/matching/MatchingEngine.tsx">import React, { useState } from 'react';
import { useMatching } from '../../hooks/useMatching';
import { useClients } from '../../hooks/useClients';
import { useProperties } from '../../hooks/useProperties';
import { Match } from '../../hooks/useMatching';
import { PurchaseProfile } from '../clients/PurchaseProfileForm';
import { Property } from '../../hooks/useProperties';
import { Search, RefreshCw, Check, X, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface MatchingEngineProps {
  mode: 'profile' | 'property';
  profileId?: string;
  propertyId?: string;
  clientId?: string;
  onMatchesFound?: (matches: Match[]) => void;
}

export default function MatchingEngine({ 
  mode, 
  profileId, 
  propertyId, 
  clientId,
  onMatchesFound 
}: MatchingEngineProps) {
  const { findMatchesForProfile, findMatchesForProperty, loading, error } = useMatching();
  const { clients } = useClients();
  const { properties } = useProperties();
  
  const [selectedProfileId, setSelectedProfileId] = useState<string>(profileId || '');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(propertyId || '');
  const [selectedClientId, setSelectedClientId] = useState<string>(clientId || '');
  const [clientProfiles, setClientProfiles] = useState<PurchaseProfile[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchCompleted, setSearchCompleted] = useState(false);
  
  // Fetch profiles for selected client
  const handleClientChange = async (clientId: string) => {
    setSelectedClientId(clientId);
    setSelectedProfileId('');
    
    if (!clientId) {
      setClientProfiles([]);
      return;
    }
    
    try {
      const { data } = await supabase
        .from('purchase_profiles')
        .select('*')
        .eq('client_id', clientId)
        .eq('is_active', true);
      
      setClientProfiles(data || []);
    } catch (error) {
      console.error('Error fetching client profiles:', error);
    }
  };
  
  const handleSearch = async () => {
    setIsSearching(true);
    setSearchCompleted(false);
    setMatches([]);
    
    try {
      let foundMatches: Match[] = [];
      
      if (mode === 'profile' && selectedProfileId) {
        foundMatches = await findMatchesForProfile(selectedProfileId);
      } else if (mode === 'property' && selectedPropertyId) {
        foundMatches = await findMatchesForProperty(selectedPropertyId);
      }
      
      setMatches(foundMatches);
      setSearchCompleted(true);
      
      if (onMatchesFound) {
        onMatchesFound(foundMatches);
      }
    } catch (error) {
      console.error('Error searching for matches:', error);
    } finally {
      setIsSearching(false);
    }
  };
  
  const getPropertyById = (id: string): Property | undefined => {
    return properties.find(p => p.id === id);
  };
  
  const getProfileById = (id: string): PurchaseProfile | undefined => {
    return clientProfiles.find(p => p.id === id);
  };
  
  const getClientById = (id: string) => {
    return clients.find(c => c.id === id);
  };
  
  const renderMatchResults = () => {
    if (!searchCompleted) return null;
    
    if (matches.length === 0) {
      return (
        <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Keine passenden {mode === 'profile' ? 'Immobilien' : 'Kaufprofile'} gefunden.
              </p>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          {matches.length} {matches.length === 1 ? 'Match' : 'Matches'} gefunden
        </h3>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {matches.map(match => {
              const property = mode === 'profile' 
                ? match.property 
                : getPropertyById(match.property_id);
              
              const profile = mode === 'property' 
                ? match.profile 
                : getProfileById(match.profile_id);
              
              const client = mode === 'property' 
                ? getClientById(match.client_id) 
                : null;
              
              if (!property && mode === 'profile') return null;
              if (!profile && mode === 'property') return null;
              
              return (
                <li key={match.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      {mode === 'profile' && property && (
                        <>
                          <h4 className="text-lg font-medium text-indigo-600">
                            {property.title}
                          </h4>
                          <p className="text-sm text-gray-500">{property.address}</p>
                          <div className="mt-1 flex items-center">
                            <span className="text-sm font-medium text-gray-900">
                              {property.price ? `€${property.price.toLocaleString('de-DE')}` : 'Preis auf Anfrage'}
                            </span>
                            <span className="mx-2 text-gray-500">•</span>
                            <span className="text-sm text-gray-500">
                              {property.size} m² • {property.rooms} {property.rooms === 1 ? 'Zimmer' : 'Zimmer'}
                            </span>
                          </div>
                        </>
                      )}
                      
                      {mode === 'property' && profile && client && (
                        <>
                          <h4 className="text-lg font-medium text-indigo-600">
                            {client.name} - {profile.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {profile.property_type} • {profile.locations?.join(', ')}
                          </p>
                          <div className="mt-1 flex items-center">
                            <span className="text-sm font-medium text-gray-900">
                              {profile.min_price ? `€${profile.min_price.toLocaleString('de-DE')}` : '€0'} - 
                              {profile.max_price ? `€${profile.max_price.toLocaleString('de-DE')}` : 'unbegrenzt'}
                            </span>
                            <span className="mx-2 text-gray-500">•</span>
                            <span className="text-sm text-gray-500">
                              {profile.min_size || 0} - {profile.max_size || '∞'} m²
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <div className="text-2xl font-bold text-indigo-600">{match.score}%</div>
                      <div className="mt-1 w-24 bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-indigo-600 h-2.5 rounded-full" 
                          style={{ width: `${match.score}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  };
  
  return (
    <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            {mode === 'profile' ? 'Immobilien finden' : 'Kaufprofile finden'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {mode === 'profile' 
              ? 'Finden Sie passende Immobilien für ein Kaufprofil.' 
              : 'Finden Sie passende Kaufprofile für eine Immobilie.'}
          </p>
        </div>
        
        <div className="mt-5 md:mt-0 md:col-span-2">
          <div className="grid grid-cols-1 gap-6">
            {mode === 'profile' && (
              <>
                {!profileId && (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="client" className="block text-sm font-medium text-gray-700">
                        Kunde
                      </label>
                      <select
                        id="client"
                        name="client"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        value={selectedClientId}
                        onChange={(e) => handleClientChange(e.target.value)}
                      >
                        <option value="">Kunde auswählen</option>
                        {clients.map(client => (
                          <option key={client.id} value={client.id}>{client.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="profile" className="block text-sm font-medium text-gray-700">
                        Kaufprofil
                      </label>
                      <select
                        id="profile"
                        name="profile"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        value={selectedProfileId}
                        onChange={(e) => setSelectedProfileId(e.target.value)}
                        disabled={clientProfiles.length === 0}
                      >
                        <option value="">Profil auswählen</option>
                        {clientProfiles.map(profile => (
                          <option key={profile.id} value={profile.id}>{profile.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </>
            )}
            
            {mode === 'property' && (
              <>
                {!propertyId && (
                  <div>
                    <label htmlFor="property" className="block text-sm font-medium text-gray-700">
                      Immobilie
                    </label>
                    <select
                      id="property"
                      name="property"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      value={selectedPropertyId}
                      onChange={(e) => setSelectedPropertyId(e.target.value)}
                    >
                      <option value="">Immobilie auswählen</option>
                      {properties.map(property => (
                        <option key={property.id} value={property.id}>{property.title}</option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSearch}
                disabled={
                  isSearching || 
                  (mode === 'profile' && !selectedProfileId) || 
                  (mode === 'property' && !selectedPropertyId)
                }
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
              >
                {isSearching ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Suche läuft...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Matches finden
                  </>
                )}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mt-6 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <X className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    Fehler bei der Suche: {error.message}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {renderMatchResults()}
        </div>
      </div>
    </div>
  );
}
