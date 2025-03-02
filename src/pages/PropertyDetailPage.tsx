import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building, MapPin, Euro, Maximize, Tag, Calendar, Zap } from 'lucide-react';
import { useProperties } from '../hooks/useProperties';

const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { properties, loading, error } = useProperties();
  
  // Find the property with the matching ID
  const property = properties.find(p => p.id === id);
  
  // Placeholder data for when we don't have real data yet
  const propertyData = property || {
    id: '1',
    title: 'Office Space Berlin',
    description: 'A modern office space in the heart of Berlin. This property offers excellent facilities for businesses looking to establish a presence in one of Europe\'s most dynamic cities.',
    type: 'commercial',
    location: 'Friedrichstraße 123, 10117 Berlin',
    price: 2500000,
    size: 450,
    status: 'available',
    features: ['parking', 'elevator', 'central-heating', 'security-system', 'fiber-optic', 'meeting-rooms'],
    images: [
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72',
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36'
    ],
    createdAt: '2023-04-15T10:00:00Z',
    updatedAt: '2023-05-01T14:30:00Z',
    yearBuilt: 2015,
    floors: 3,
    amenities: ['Reception area', 'Kitchen facilities', 'Outdoor terrace', 'Bike storage'],
    energyRating: 'B',
    availability: 'Immediate',
    contactInfo: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@immomatch.com',
      phone: '+49 30 1234567'
    }
  };
  
  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-10">
          <p className="text-gray-500">Loading property details...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Error loading property details: {error.message}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          to="/properties"
          className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Properties
        </Link>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {/* Property Images */}
        <div className="relative h-96 bg-gray-200">
          {propertyData.images && propertyData.images.length > 0 ? (
            <img
              src={propertyData.images[0]}
              alt={propertyData.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Building className="h-16 w-16 text-gray-400" />
            </div>
          )}
          
          <div className="absolute top-4 right-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              propertyData.status === 'available' ? 'bg-green-100 text-green-800' :
              propertyData.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              propertyData.status === 'sold' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {propertyData.status.charAt(0).toUpperCase() + propertyData.status.slice(1)}
            </span>
          </div>
        </div>
        
        {/* Property Thumbnails */}
        {propertyData.images && propertyData.images.length > 1 && (
          <div className="flex overflow-x-auto p-4 space-x-4">
            {propertyData.images.map((image, index) => (
              <div key={index} className="flex-shrink-0 w-24 h-24">
                <img
                  src={image}
                  alt={`${propertyData.title} - Image ${index + 1}`}
                  className="w-full h-full object-cover rounded"
                />
              </div>
            ))}
          </div>
        )}
        
        {/* Property Header */}
        <div className="px-4 py-5 sm:px-6">
          <h1 className="text-2xl font-bold text-gray-900">{propertyData.title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 flex items-center">
            <MapPin className="h-4 w-4 mr-1 text-gray-400" />
            {propertyData.location}
          </p>
        </div>
        
        {/* Property Details */}
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center">
                <Euro className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-sm font-medium text-gray-500">Price</h3>
              </div>
              <p className="mt-1 text-lg font-semibold text-gray-900">€{propertyData.price.toLocaleString()}</p>
            </div>
            
            <div>
              <div className="flex items-center">
                <Maximize className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-sm font-medium text-gray-500">Size</h3>
              </div>
              <p className="mt-1 text-lg font-semibold text-gray-900">{propertyData.size} m²</p>
            </div>
            
            <div>
              <div className="flex items-center">
                <Tag className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-sm font-medium text-gray-500">Type</h3>
              </div>
              <p className="mt-1 text-lg font-semibold text-gray-900 capitalize">{propertyData.type}</p>
            </div>
            
            <div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-sm font-medium text-gray-500">Year Built</h3>
              </div>
              <p className="mt-1 text-lg font-semibold text-gray-900">{propertyData.yearBuilt || 'N/A'}</p>
            </div>
          </div>
        </div>
        
        {/* Property Description */}
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium text-gray-900">Description</h3>
          <div className="mt-3 text-sm text-gray-500">
            <p>{propertyData.description || 'No description available.'}</p>
          </div>
        </div>
        
        {/* Property Features */}
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium text-gray-900">Features</h3>
          <div className="mt-3">
            <div className="flex flex-wrap gap-2">
              {propertyData.features && propertyData.features.map((feature, index) => (
                <span key={index} className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  {feature.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        {/* Additional Details */}
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium text-gray-900">Additional Details</h3>
          <div className="mt-3">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Floors</dt>
                <dd className="mt-1 text-sm text-gray-900">{propertyData.floors || 'N/A'}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Energy Rating</dt>
                <dd className="mt-1 text-sm text-gray-900">{propertyData.energyRating || 'N/A'}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Availability</dt>
                <dd className="mt-1 text-sm text-gray-900">{propertyData.availability || 'N/A'}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Listed Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(propertyData.createdAt).toLocaleDateString()}
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {propertyData.updatedAt ? new Date(propertyData.updatedAt).toLocaleDateString() : 'N/A'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
        
        {/* Amenities */}
        {propertyData.amenities && propertyData.amenities.length > 0 && (
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900">Amenities</h3>
            <div className="mt-3">
              <ul className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
                {propertyData.amenities.map((amenity, index) => (
                  <li key={index} className="text-sm text-gray-900 flex items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mr-2"></span>
                    {amenity}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        
        {/* Contact Information */}
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
          <div className="mt-3">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Contact Person</dt>
                <dd className="mt-1 text-sm text-gray-900">{propertyData.contactInfo?.name || 'N/A'}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {propertyData.contactInfo?.email ? (
                    <a href={`mailto:${propertyData.contactInfo.email}`} className="text-indigo-600 hover:text-indigo-500">
                      {propertyData.contactInfo.email}
                    </a>
                  ) : 'N/A'}
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {propertyData.contactInfo?.phone ? (
                    <a href={`tel:${propertyData.contactInfo.phone}`} className="text-indigo-600 hover:text-indigo-500">
                      {propertyData.contactInfo.phone}
                    </a>
                  ) : 'N/A'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
        
        {/* Actions */}
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3">
            <Link
              to={`/properties/edit/${propertyData.id}`}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Edit Property
            </Link>
            
            <Link
              to="/matching"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Zap className="h-4 w-4 mr-2" />
              Find Matching Clients
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailPage;
