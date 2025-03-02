import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { usePurchaseProfiles } from '../hooks/usePurchaseProfiles';
import { useClients } from '../hooks/useClients';
import { PurchaseProfileForm } from '../components/purchase-profiles/PurchaseProfileForm';
import { TagInput } from '../components/tags/TagInput';
import { formatCurrency } from '../lib/utils';
import { TagList } from '../components/tags/TagList';
import { useTags } from '../hooks/useTags';

export default function PurchaseProfilePage() {
  const { clientId, profileId } = useParams<{ clientId: string; profileId: string }>();
  const navigate = useNavigate();
  const { getProfileById, updateProfile, deleteProfile } = usePurchaseProfiles();
  const { getClient } = useClients();
  const { getTagsForEntity } = useTags();
  
  const [profile, setProfile] = useState<any | null>(null);
  const [client, setClient] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profileTags, setProfileTags] = useState<any[]>([]);
  
  // Load profile and client data
  useEffect(() => {
    const loadData = async () => {
      if (!clientId || !profileId) return;
      
      try {
        setLoading(true);
        
        // Load profile
        const profileData = await getProfileById(profileId);
        if (!profileData) {
          throw new Error('Profile not found');
        }
        setProfile(profileData);
        
        // Load client
        const clientData = await getClient(clientId);
        if (!clientData) {
          throw new Error('Client not found');
        }
        setClient(clientData);
        
        // Load tags
        const tags = await getTagsForEntity('purchase_profile', profileId);
        setProfileTags(tags);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [clientId, profileId, getProfileById, getClient, getTagsForEntity]);
  
  // Handle profile update
  const handleUpdateProfile = async (data: any) => {
    if (!profileId) return;
    
    try {
      setLoading(true);
      await updateProfile(profileId, data);
      
      // Reload profile
      const updatedProfile = await getProfileById(profileId);
      setProfile(updatedProfile);
      
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle profile deletion
  const handleDeleteProfile = async () => {
    if (!profileId || !clientId) return;
    
    const confirmed = window.confirm('Are you sure you want to delete this profile? This action cannot be undone.');
    if (!confirmed) return;
    
    try {
      setLoading(true);
      await deleteProfile(profileId);
      navigate(`/clients/${clientId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete profile');
      console.error('Error deleting profile:', err);
      setLoading(false);
    }
  };
  
  if (loading && !profile) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (error || !profile || !client) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error || 'Failed to load profile'}</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {isEditing ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Edit Purchase Profile</h1>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
            
            <PurchaseProfileForm
              initialData={profile}
              onSubmit={handleUpdateProfile}
              onCancel={() => setIsEditing(false)}
              clientId={clientId || ''}
              isLoading={loading}
            />
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold">{profile.title}</h1>
                <p className="text-gray-600">
                  Client: <a href={`/clients/${client.id}`} className="text-blue-600 hover:underline">{client.name}</a> ({client.company})
                </p>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Edit Profile
                </button>
                <button
                  onClick={handleDeleteProfile}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
            
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Profile Details</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {profile.status === 'active' ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  ) : profile.status === 'inactive' ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Inactive
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Completed
                    </span>
                  )}
                </p>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Tags</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {profileTags.length > 0 ? (
                        <TagList tags={profileTags} />
                      ) : (
                        <span className="text-gray-500">No tags</span>
                      )}
                    </dd>
                  </div>
                  
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Investment Volume</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {profile.min_investment_volume && profile.max_investment_volume ? (
                        `${formatCurrency(profile.min_investment_volume)} - ${formatCurrency(profile.max_investment_volume)}`
                      ) : profile.min_investment_volume ? (
                        `From ${formatCurrency(profile.min_investment_volume)}`
                      ) : profile.max_investment_volume ? (
                        `Up to ${formatCurrency(profile.max_investment_volume)}`
                      ) : (
                        'Not specified'
                      )}
                    </dd>
                  </div>
                  
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Gross Initial Yield</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {profile.min_gross_initial_yield && profile.max_gross_initial_yield ? (
                        `${profile.min_gross_initial_yield}% - ${profile.max_gross_initial_yield}%`
                      ) : profile.min_gross_initial_yield ? (
                        `From ${profile.min_gross_initial_yield}%`
                      ) : profile.max_gross_initial_yield ? (
                        `Up to ${profile.max_gross_initial_yield}%`
                      ) : (
                        'Not specified'
                      )}
                    </dd>
                  </div>
                  
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Target Yield</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {profile.min_target_yield && profile.max_target_yield ? (
                        `${profile.min_target_yield}% - ${profile.max_target_yield}%`
                      ) : profile.min_target_yield ? (
                        `From ${profile.min_target_yield}%`
                      ) : profile.max_target_yield ? (
                        `Up to ${profile.max_target_yield}%`
                      ) : (
                        'Not specified'
                      )}
                    </dd>
                  </div>
                  
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Plot Area</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {profile.min_plot_area && profile.max_plot_area ? (
                        `${profile.min_plot_area} m² - ${profile.max_plot_area} m²`
                      ) : profile.min_plot_area ? (
                        `From ${profile.min_plot_area} m²`
                      ) : profile.max_plot_area ? (
                        `Up to ${profile.max_plot_area} m²`
                      ) : (
                        'Not specified'
                      )}
                    </dd>
                  </div>
                  
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Gross Floor Area</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {profile.min_gross_floor_area && profile.max_gross_floor_area ? (
                        `${profile.min_gross_floor_area} m² - ${profile.max_gross_floor_area} m²`
                      ) : profile.min_gross_floor_area ? (
                        `From ${profile.min_gross_floor_area} m²`
                      ) : profile.max_gross_floor_area ? (
                        `Up to ${profile.max_gross_floor_area} m²`
                      ) : (
                        'Not specified'
                      )}
                    </dd>
                  </div>
                  
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Construction Year</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {profile.min_construction_year && profile.max_construction_year ? (
                        `${profile.min_construction_year} - ${profile.max_construction_year}`
                      ) : profile.min_construction_year ? (
                        `From ${profile.min_construction_year}`
                      ) : profile.max_construction_year ? (
                        `Up to ${profile.max_construction_year}`
                      ) : (
                        'Not specified'
                      )}
                    </dd>
                  </div>
                  
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Heritage Protection</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {profile.heritage_protection ? 'Acceptable' : 'Not preferred'}
                    </dd>
                  </div>
                  
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Residential Units</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {profile.min_residential_units && profile.max_residential_units ? (
                        `${profile.min_residential_units} - ${profile.max_residential_units}`
                      ) : profile.min_residential_units ? (
                        `From ${profile.min_residential_units}`
                      ) : profile.max_residential_units ? (
                        `Up to ${profile.max_residential_units}`
                      ) : (
                        'Not specified'
                      )}
                    </dd>
                  </div>
                  
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Commercial Units</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {profile.min_commercial_units && profile.max_commercial_units ? (
                        `${profile.min_commercial_units} - ${profile.max_commercial_units}`
                      ) : profile.min_commercial_units ? (
                        `From ${profile.min_commercial_units}`
                      ) : profile.max_commercial_units ? (
                        `Up to ${profile.max_commercial_units}`
                      ) : (
                        'Not specified'
                      )}
                    </dd>
                  </div>
                  
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Notes</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {profile.notes || 'No notes'}
                    </dd>
                  </div>
                  
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Add Tags</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <TagInput
                        entityType="purchase_profile"
                        entityId={profileId || ''}
                        placeholder="Add tags to this profile..."
                      />
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
