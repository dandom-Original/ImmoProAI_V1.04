import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../lib/utils';
import { TagList } from '../tags/TagList';
import { useTags } from '../../hooks/useTags';

interface PurchaseProfileListProps {
  profiles: any[];
  isLoading?: boolean;
  onDelete?: (id: string) => void;
}

export function PurchaseProfileList({ profiles, isLoading = false, onDelete }: PurchaseProfileListProps) {
  const { getTagsForEntity } = useTags();
  const [profileTags, setProfileTags] = React.useState<Record<string, any[]>>({});
  
  // Load tags for each profile
  React.useEffect(() => {
    const loadTags = async () => {
      const tagsMap: Record<string, any[]> = {};
      
      for (const profile of profiles) {
        const tags = await getTagsForEntity('purchase_profile', profile.id);
        tagsMap[profile.id] = tags;
      }
      
      setProfileTags(tagsMap);
    };
    
    loadTags();
  }, [profiles, getTagsForEntity]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (profiles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No purchase profiles found.</p>
      </div>
    );
  }
  
  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {profiles.map((profile) => (
          <li key={profile.id}>
            <div className="block hover:bg-gray-50">
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="truncate">
                    <div className="flex text-sm">
                      <p className="font-medium text-blue-600 truncate">{profile.title}</p>
                      <p className="ml-1 flex-shrink-0 font-normal text-gray-500">
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
                    <div className="mt-2 flex">
                      <div className="flex items-center text-sm text-gray-500">
                        <span>
                          {profile.min_investment_volume && profile.max_investment_volume ? (
                            `${formatCurrency(profile.min_investment_volume)} - ${formatCurrency(profile.max_investment_volume)}`
                          ) : profile.min_investment_volume ? (
                            `From ${formatCurrency(profile.min_investment_volume)}`
                          ) : profile.max_investment_volume ? (
                            `Up to ${formatCurrency(profile.max_investment_volume)}`
                          ) : (
                            'Investment volume not specified'
                          )}
                        </span>
                      </div>
                    </div>
                    
                    {profileTags[profile.id] && profileTags[profile.id].length > 0 && (
                      <div className="mt-2">
                        <TagList tags={profileTags[profile.id]} limit={5} />
                      </div>
                    )}
                  </div>
                  <div className="ml-5 flex flex-shrink-0">
                    <Link
                      to={`/clients/${profile.client_id}/profiles/${profile.id}`}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      View
                    </Link>
                    
                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this profile?')) {
                            onDelete(profile.id);
                          }
                        }}
                        className="ml-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
