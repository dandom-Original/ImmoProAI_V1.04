import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import { useProperties } from '../hooks/useProperties';

const PropertiesPage: React.FC = () => {
  const { properties, loading, error, deleteProperty } = useProperties();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      await deleteProperty(id);
    }
  };

  // Placeholder data - in a real app, this would come from your database
  const propertiesData = properties.length > 0 ? properties : [
    { 
      id: '1', 
      title: 'Office Space Berlin', 
      type: 'commercial', 
      location: 'Berlin', 
      price: 2500000,
      size: 450,
      status: 'available',
      features: ['parking', 'elevator', 'central-heating'],
      images: ['https://images.unsplash.com/photo-1497366754035-f200968a6e72'],
      createdAt: '2023-04-15T10:00:00Z'
    },
    { 
      id: '2', 
      title: 'Retail Space Hamburg', 
      type: 'retail', 
      location: 'Hamburg', 
      price: 1800000,
      size: 320,
      status: 'available',
      features: ['storefront', 'storage', 'alarm-system'],
      images: ['https://images.unsplash.com/photo-1604014237800-1c9102c219da'],
      createdAt: '2023-04-18T14:30:00Z'
    },
    { 
      id: '3', 
      title: 'Warehouse Munich', 
      type: 'industrial', 
      location: 'Munich', 
      price: 3200000,
      size: 1200,
      status: 'pending',
      features: ['loading-dock', 'high-ceiling', 'security'],
      images: ['https://images.unsplash.com/photo-1565793298595-6a879b1d9492'],
      createdAt: '2023-04-20T09:15:00Z'
    },
    { 
      id: '4', 
      title: 'Office Building Frankfurt', 
      type: 'commercial', 
      location: 'Frankfurt', 
      price: 4100000,
      size: 780,
      status: 'available',
      features: ['conference-room', 'cafeteria', 'parking', 'elevator'],
      images: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab'],
      createdAt: '2023-04-22T16:45:00Z'
    },
    { 
      id: '5', 
      title: 'Shopping Center Dresden', 
      type: 'retail', 
      location: 'Dresden', 
      price: 5500000,
      size: 2400,
      status: 'sold',
      features: ['food-court', 'parking-lot', 'security', 'loading-zone'],
      images: ['https://images.unsplash.com/photo-1519567770579-c2fc5e9ca471'],
      createdAt: '2023-04-25T11:20:00Z'
    }
  ];

  const filteredProperties = propertiesData.filter(property => {
    const matchesSearch = 
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || property.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Properties</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all properties in your portfolio including their title, type, location and price.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            to="/properties/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Link>
        </div>
      </div>
      
      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="sm:w-64">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="commercial">Commercial</option>
              <option value="retail">Retail</option>
              <option value="industrial">Industrial</option>
              <option value="residential">Residential</option>
            </select>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mt-6 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Error loading properties: {error.message}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-500">Loading properties...</p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-500">No properties found. Try adjusting your filters or add a new property.</p>
          </div>
        ) : (
          filteredProperties.map((property) => (
            <div key={property.id} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="h-48 w-full overflow-hidden">
                {property.images && property.images[0] ? (
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      <Link to={`/properties/${property.id}`} className="hover:underline">
                        {property.title}
                      </Link>
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      {property.location}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    property.status === 'available' ? 'bg-green-100 text-green-800' :
                    property.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                  </span>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Price</p>
                      <p className="mt-1 text-lg font-semibold text-gray-900">€{property.price.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Size</p>
                      <p className="mt-1 text-lg font-semibold text-gray-900">{property.size} m²</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-500">Type</p>
                  <p className="mt-1 text-sm text-gray-900 capitalize">{property.type}</p>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-500">Features</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {property.features && property.features.map((feature, index) => (
                      <span key={index} className="px-2 py-1 text-xs rounded-full bg-gray-100">
                        {feature.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-5 flex justify-end space-x-3">
                  <Link
                    to={`/properties/${property.id}`}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    View Details
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(property.id)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PropertiesPage;
