import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import TagManager from '../tags/TagManager';
import { Tag } from '../tags/TagManager';
import { X, Save, Plus } from 'lucide-react';

export interface PurchaseProfile {
  id?: string;
  client_id: string;
  name: string;
  property_type: string;
  min_price?: number;
  max_price?: number;
  min_size?: number;
  max_size?: number;
  min_rooms?: number;
  max_rooms?: number;
  locations: string[];
  description?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  tags?: Tag[];
}

interface PurchaseProfileFormProps {
  clientId: string;
  profile?: PurchaseProfile;
  onSave: (profile: PurchaseProfile) => void;
  onCancel: () => void;
}

const propertyTypes = [
  { value: 'office', label: 'Büro' },
  { value: 'retail', label: 'Einzelhandel' },
  { value: 'industrial', label: 'Industrie' },
  { value: 'logistics', label: 'Logistik' },
  { value: 'residential', label: 'Wohnen' },
  { value: 'mixed', label: 'Gemischt' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'healthcare', label: 'Gesundheitswesen' },
  { value: 'land', label: 'Grundstück' },
  { value: 'other', label: 'Sonstiges' }
];

export default function PurchaseProfileForm({ 
  clientId, 
  profile, 
  onSave, 
  onCancel 
}: PurchaseProfileFormProps) {
  const isEditing = !!profile?.id;
  
  const [formData, setFormData] = useState<PurchaseProfile>({
    client_id: clientId,
    name: '',
    property_type: 'office',
    min_price: undefined,
    max_price: undefined,
    min_size: undefined,
    max_size: undefined,
    min_rooms: undefined,
    max_rooms: undefined,
    locations: [],
    description: '',
    is_active: true,
    tags: []
  });
  
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileTags, setProfileTags] = useState<Tag[]>([]);
  
  useEffect(() => {
    if (profile) {
      setFormData({
        ...profile,
        tags: profile.tags || []
      });
    }
    
    // Fetch tags if editing
    if (profile?.id) {
      fetchProfileTags(profile.id);
    }
  }, [profile]);
  
  const fetchProfileTags = async (profileId: string) => {
    try {
      const { data, error } = await supabase
        .from('tag_relations')
        .select('*, tag:tags(*)')
        .eq('entity_id', profileId)
        .eq('entity_type', 'purchase_profile');
      
      if (error) throw error;
      
      const tags = data?.map(relation => relation.tag) || [];
      setProfileTags(tags);
    } catch (error) {
      console.error('Error fetching profile tags:', error);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle number inputs
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: value ? parseFloat(value) : undefined
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };
  
  const handleAddLocation = () => {
    if (location.trim() && !formData.locations.includes(location.trim())) {
      setFormData({
        ...formData,
        locations: [...formData.locations, location.trim()]
      });
      setLocation('');
    }
  };
  
  const handleRemoveLocation = (locationToRemove: string) => {
    setFormData({
      ...formData,
      locations: formData.locations.filter(loc => loc !== locationToRemove)
    });
  };
  
  const handleTagsChange = (tags: Tag[]) => {
    setProfileTags(tags);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let profileId = profile?.id;
      
      // Create or update the profile
      if (isEditing) {
        const { error } = await supabase
          .from('purchase_profiles')
          .update({
            name: formData.name,
            property_type: formData.property_type,
            min_price: formData.min_price,
            max_price: formData.max_price,
            min_size: formData.min_size,
            max_size: formData.max_size,
            min_rooms: formData.min_rooms,
            max_rooms: formData.max_rooms,
            locations: formData.locations,
            description: formData.description,
            is_active: formData.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', profileId);
        
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('purchase_profiles')
          .insert([{
            client_id: clientId,
            name: formData.name,
            property_type: formData.property_type,
            min_price: formData.min_price,
            max_price: formData.max_price,
            min_size: formData.min_size,
            max_size: formData.max_size,
            min_rooms: formData.min_rooms,
            max_rooms: formData.max_rooms,
            locations: formData.locations,
            description: formData.description,
            is_active: formData.is_active
          }])
          .select()
          .single();
        
        if (error) throw error;
        profileId = data.id;
      }
      
      // Update tags
      if (profileId) {
        // First, remove all existing tag relations
        await supabase
          .from('tag_relations')
          .delete()
          .eq('entity_id', profileId)
          .eq('entity_type', 'purchase_profile');
        
        // Then add new tag relations
        if (profileTags.length > 0) {
          const tagRelations = profileTags.map(tag => ({
            entity_id: profileId,
            entity_type: 'purchase_profile',
            tag_id: tag.id
          }));
          
          await supabase
            .from('tag_relations')
            .insert(tagRelations);
        }
      }
      
      // Call the onSave callback with the updated profile
      onSave({
        ...formData,
        id: profileId,
        tags: profileTags
      });
    } catch (error) {
      console.error('Error saving purchase profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {isEditing ? 'Kaufprofil bearbeiten' : 'Neues Kaufprofil'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Definieren Sie die Suchkriterien für diesen Kunden.
            </p>
          </div>
          
          <div className="mt-5 md:mt-0 md:col-span-2">
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Profilname *
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="property_type" className="block text-sm font-medium text-gray-700">
                  Immobilientyp *
                </label>
                <select
                  id="property_type"
                  name="property_type"
                  value={formData.property_type}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  {propertyTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="min_price" className="block text-sm font-medium text-gray-700">
                  Mindestpreis (€)
                </label>
                <input
                  type="number"
                  name="min_price"
                  id="min_price"
                  value={formData.min_price || ''}
                  onChange={handleChange}
                  min="0"
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="max_price" className="block text-sm font-medium text-gray-700">
                  Höchstpreis (€)
                </label>
                <input
                  type="number"
                  name="max_price"
                  id="max_price"
                  value={formData.max_price || ''}
                  onChange={handleChange}
                  min="0"
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="min_size" className="block text-sm font-medium text-gray-700">
                  Mindestgröße (m²)
                </label>
                <input
                  type="number"
                  name="min_size"
                  id="min_size"
                  value={formData.min_size || ''}
                  onChange={handleChange}
                  min="0"
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="max_size" className="block text-sm font-medium text-gray-700">
                  Maximalgröße (m²)
                </label>
                <input
                  type="number"
                  name="max_size"
                  id="max_size"
                  value={formData.max_size || ''}
                  onChange={handleChange}
                  min="0"
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="min_rooms" className="block text-sm font-medium text-gray-700">
                  Mindestzimmeranzahl
                </label>
                <input
                  type="number"
                  name="min_rooms"
                  id="min_rooms"
                  value={formData.min_rooms || ''}
                  onChange={handleChange}
                  min="0"
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="max_rooms" className="block text-sm font-medium text-gray-700">
                  Maximalzimmeranzahl
                </label>
                <input
                  type="number"
                  name="max_rooms"
                  id="max_rooms"
                  value={formData.max_rooms || ''}
                  onChange={handleChange}
                  min="0"
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              
              <div className="col-span-6">
                <label className="block text-sm font-medium text-gray-700">
                  Standorte
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                    placeholder="Stadt, Region oder PLZ"
                  />
                  <button
                    type="button"
                    onClick={handleAddLocation}
                    className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 sm:text-sm hover:bg-gray-100"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                
                {formData.locations.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.locations.map((loc, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        {loc}
                        <button
                          type="button"
                          onClick={() => handleRemoveLocation(loc)}
                          className="flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none focus:bg-indigo-500 focus:text-white"
                        >
                          <span className="sr-only">Remove {loc}</span>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Beschreibung
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description || ''}
                  onChange={handleChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="Weitere Details zu den Suchkriterien..."
                />
              </div>
              
              <div className="col-span-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <TagManager
                  selectedTags={profileTags}
                  onTagsChange={handleTagsChange}
                  entityType="purchase_profile"
                  maxTags={10}
                />
              </div>
              
              <div className="col-span-6">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="is_active"
                      name="is_active"
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={handleCheckboxChange}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="is_active" className="font-medium text-gray-700">
                      Aktives Profil
                    </label>
                    <p className="text-gray-500">
                      Deaktivieren Sie dieses Profil, wenn es derzeit nicht für Matching verwendet werden soll.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
        >
          {isSubmitting ? (
            <span className="inline-flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Speichern...
            </span>
          ) : (
            <span className="inline-flex items-center">
              <Save className="h-4 w-4 mr-2" />
              Speichern
            </span>
          )}
        </button>
      </div>
    </form>
  );
}
