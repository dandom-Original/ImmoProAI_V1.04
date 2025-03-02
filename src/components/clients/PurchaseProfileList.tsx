import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { PlusCircle, Edit, Trash2, Check, X, Building, MapPin, Euro, SquareFootage } from 'lucide-react';
import { PurchaseProfile } from './PurchaseProfileForm';
import PurchaseProfileForm from './PurchaseProfileForm';
import TagBadge from '../tags/TagManager';

interface PurchaseProfileListProps {
  clientId: string;
}

export default function PurchaseProfileList({ clientId }: PurchaseProfileListProps) {
  const [profiles, setProfiles] = useState<PurchaseProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingProfile, setEditingProfile] = useState<PurchaseProfile | null>(null);
  
  useEffect(() => {
    fetchProfiles();
  }, [clientId]);
  
  const fetchProfiles = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('purchase_profiles')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Fetch tags for each profile
      const profilesWithTags = await Promise.all(
        (data || []).map(async (profile) => {
          const { data: tagRelations, error: tagError } = await supabase
            .from('tag_relations')
            .select('*, tag:tags(*)')
            .eq('entity_id', profile.id)
            .eq('entity_type', 'purchase_profile');
          
          if (tagError) throw tagError;
          
          const tags = tagRelations?.map(relation => relation.tag) || [];
          
          return {
            ...profile,
            tags
          };
        })
      );
      
      setProfiles(profilesWithTags);
    } catch (error) {
      console.error('Error fetching purchase profiles:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveProfile = (profile: PurchaseProfile) => {
    if (editingProfile) {
      // Update existing profile
      setProfiles(profiles.map(p => p.id === profile.id ? profile : p));
      setEditingProfile(null);
    } else {
      // Add new profile
      setProfiles([profile, ...profiles]);
      setIsCreating(false);
    }
  };
  
  const handleDeleteProfile = async (profileId: string) => {
    if (!window.confirm('Sind Sie sicher, dass Sie dieses Kaufprofil löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      return;
    }
    
    try {
      // Delete tag relations first
      await supabase
        .from('tag_relations')
        .delete()
        .eq('entity_id', profileId)
        .eq('entity_type', 'purchase_profile');
      
      // Then delete the profile
      const { error } = await supabase
        .from('purchase_profiles')
        .delete()
        .eq('id', profileId);
      
      if (error) throw error;
      
      // Update state
      setProfiles(profiles.filter(p => p.id !== profileId));
    } catch (error) {
      console.error('Error deleting purchase profile:', error);
    }
  };
  
  const getPropertyTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      'office': 'Büro',
      'retail': 'Einzelhandel',
      'industrial': 'Industrie',
      'logistics': 'Logistik',
      'residential': 'Wohnen',
      'mixed': 'Gemischt',
      'hotel': 'Hotel',
      'healthcare': 'Gesundheitswesen',
      'land': 'Grundstück',
      'other': 'Sonstiges'
    };
    
    return typeMap[type] || type;
  };
  
  const formatPrice = (price?: number) => {
    if (!price) return '-';
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(price);
  };
  
  const formatSize = (size?: number) => {
    if (!size) return '-';
    return `${size.toLocaleString('de-DE')} m²`;
  };
  
  if (isCreating || editingProfile) {
    return (
      <PurchaseProfileForm
        clientId={clientId}
        profile={editingProfile || undefined}
        onSave={handleSaveProfile}
        onCancel={() => {
          setIsCreating(false);
          setEditingProfile(null);
        }}
      />
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Kaufprofile</h3>
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Neues Profil
        </button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : profiles.length === 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6 text-center">
            <p className="text-gray-500">Keine Kaufprofile vorhanden. Erstellen Sie ein neues Profil, um die Suchkriterien des Kunden zu definieren.</p>
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Kaufprofil erstellen
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {profiles.map((profile) => (
              <li key={profile.id} className={`px-4 py-4 sm:px-6 ${!profile.is_active ? 'bg-gray-50' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <h4 className="text-lg font-medium text-gray-900">{profile.name}</h4>
                    {!profile.is_active && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Inaktiv
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setEditingProfile(profile)}
                      className="inline-flex items-center p-1.5 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProfile(profile.id!)}
                      className="inline-flex items-center p-1.5 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <div className="flex items-center text-sm text-gray-500 mr-6">
                      <Building className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      {getPropertyTypeLabel(profile.property_type)}
                    </div>
                    {profile.locations.length<boltAction type="file" filePath="src/components/clients/PurchaseProfileList.tsx">import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { PlusCircle, Edit, Trash2, Check, X, Building, MapPin, Euro, SquareFootage } from 'lucide-react';
import { PurchaseProfile } from './PurchaseProfileForm';
import PurchaseProfileForm from './PurchaseProfileForm';
import TagBadge from '../tags/TagManager';

interface PurchaseProfileListProps {
  clientId: string;
}

export default function PurchaseProfileList({ clientId }: PurchaseProfileListProps) {
  const [profiles, setProfiles] = useState<PurchaseProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingProfile, setEditingProfile] = useState<PurchaseProfile | null>(null);
  
  useEffect(() => {
    fetchProfiles();
  }, [clientId]);
  
  const fetchProfiles = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('purchase_profiles')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Fetch tags for each profile
      const profilesWithTags = await Promise.all(
        (data || []).map(async (profile) => {
          const { data: tagRelations, error: tagError } = await supabase
            .from('tag_relations')
            .select('*, tag:tags(*)')
            .eq('entity_id', profile.id)
            .eq('entity_type', 'purchase_profile');
          
          if (tagError) throw tagError;
          
          const tags = tagRelations?.map(relation => relation.tag) || [];
          
          return {
            ...profile,
            tags
          };
        })
      );
      
      setProfiles(profilesWithTags);
    } catch (error) {
      console.error('Error fetching purchase profiles:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveProfile = (profile: PurchaseProfile) => {
    if (editingProfile) {
      // Update existing profile
      setProfiles(profiles.map(p => p.id === profile.id ? profile : p));
      setEditingProfile(null);
    } else {
      // Add new profile
      setProfiles([profile, ...profiles]);
      setIsCreating(false);
    }
  };
  
  const handleDeleteProfile = async (profileId: string) => {
    if (!window.confirm('Sind Sie sicher, dass Sie dieses Kaufprofil löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      return;
    }
    
    try {
      // Delete tag relations first
      await supabase
        .from('tag_relations')
        .delete()
        .eq('entity_id', profileId)
        .eq('entity_type', 'purchase_profile');
      
      // Then delete the profile
      const { error } = await supabase
        .from('purchase_profiles')
        .delete()
        .eq('id', profileId);
      
      if (error) throw error;
      
      // Update state
      setProfiles(profiles.filter(p => p.id !== profileId));
    } catch (error) {
      console.error('Error deleting purchase profile:', error);
    }
  };
  
  const getPropertyTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      'office': 'Büro',
      'retail': 'Einzelhandel',
      'industrial': 'Industrie',
      'logistics': 'Logistik',
      'residential': 'Wohnen',
      'mixed': 'Gemischt',
      'hotel': 'Hotel',
      'healthcare': 'Gesundheitswesen',
      'land': 'Grundstück',
      'other': 'Sonstiges'
    };
    
    return typeMap[type] || type;
  };
  
  const formatPrice = (price?: number) => {
    if (!price) return '-';
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(price);
  };
  
  const formatSize = (size?: number) => {
    if (!size) return '-';
    return `${size.toLocaleString('de-DE')} m²`;
  };
  
  if (isCreating || editingProfile) {
    return (
      <PurchaseProfileForm
        clientId={clientId}
        profile={editingProfile || undefined}
        onSave={handleSaveProfile}
        onCancel={() => {
          setIsCreating(false);
          setEditingProfile(null);
        }}
      />
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Kaufprofile</h3>
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Neues Profil
        </button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : profiles.length === 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6 text-center">
            <p className="text-gray-500">Keine Kaufprofile vorhanden. Erstellen Sie ein neues Profil, um die Suchkriterien des Kunden zu definieren.</p>
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Kaufprofil erstellen
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {profiles.map((profile) => (
              <li key={profile.id} className={`px-4 py-4 sm:px-6 ${!profile.is_active ? 'bg-gray-50' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <h4 className="text-lg font-medium text-gray-900">{profile.name}</h4>
                    {!profile.is_active && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Inaktiv
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setEditingProfile(profile)}
                      className="inline-flex items-center p-1.5 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProfile(profile.id!)}
                      className="inline-flex items-center p-1.5 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <div className="flex items-center text-sm text-gray-500 mr-6">
                      <Building className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      {getPropertyTypeLabel(profile.property_type)}
                    </div>
                    {profile.locations.length > 0 && (
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 mr-6">
                        <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        {profile.locations.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="bg-gray-50 rounded-md p-3">
                    <div className="text-xs font-medium text-gray-500 uppercase">Preisspanne</div>
                    <div className="mt-1 flex items-center">
                      <Euro className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm font-medium">
                        {profile.min_price ? formatPrice(profile.min_price) : '-'} bis {profile.max_price ? formatPrice(profile.max_price) : '-'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-md p-3">
                    <div className="text-xs font-medium text-gray-500 uppercase">Größe</div>
                    <div className="mt-1 flex items-center">
                      <SquareFootage className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm font-medium">
                        {profile.min_size ? formatSize(profile.min_size) : '-'} bis {profile.max_size ? formatSize(profile.max_size) : '-'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-md p-3">
                    <div className="text-xs font-medium text-gray-500 uppercase">Zimmer</div>
                    <div className="mt-1 flex items-center">
                      <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                      </svg>
                      <span className="text-sm font-medium">
                        {profile.min_rooms || '-'} bis {profile.max_rooms || '-'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-md p-3">
                    <div className="text-xs font-medium text-gray-500 uppercase">Status</div>
                    <div className="mt-1 flex items-center">
                      {profile.is_active ? (
                        <>
                          <Check className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-sm font-medium text-green-700">Aktiv</span>
                        </>
                      ) : (
                        <>
                          <X className="h-4 w-4 text-red-500 mr-1" />
                          <span className="text-sm font-medium text-red-700">Inaktiv</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {profile.description && (
                  <div className="mt-2 text-sm text-gray-700">
                    <div className="font-medium">Beschreibung:</div>
                    <p className="mt-1">{profile.description}</p>
                  </div>
                )}
                
                {profile.tags && profile.tags.length > 0 && (
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-1">
                      {profile.tags.map(tag => (
                        <TagBadge key={tag.id} tag={tag} />
                      ))}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
