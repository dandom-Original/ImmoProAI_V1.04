import React from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, User, Building, Mail, Phone } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type Client = Database['public']['Tables']['clients']['Row'];

interface ClientListProps {
  clients: Client[];
  onDelete: (id: string) => void;
  isLoading: boolean;
}

const ClientList: React.FC<ClientListProps> = ({ clients, onDelete, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="mt-2 text-lg font-medium text-gray-900">No clients found</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new client.</p>
        <div className="mt-6">
          <Link
            to="/clients/new"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Client
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Client
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tags
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {clients.map((client) => (
            <tr key={client.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-indigo-100 rounded-full">
                    <User className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      <Link to={`/clients/${client.id}`} className="hover:text-indigo-600">
                        {client.name}
                      </Link>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Building className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      {client.company}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 flex items-center">
                  <Mail className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                  {client.email}
                </div>
                {client.phone && (
                  <div className="text-sm text-gray-500 flex items-center">
                    <Phone className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                    {client.phone}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${client.status === 'active' ? 'bg-green-100 text-green-800' : 
                    client.status === 'inactive' ? 'bg-red-100 text-red-800' : 
                    client.status === 'lead' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-blue-100 text-blue-800'}`}>
                  {client.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-wrap gap-1">
                  {client.tags?.slice(0, 3).map((tag) => (
                    <span key={tag} className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-800">
                      {tag}
                    </span>
                  ))}
                  {client.tags && client.tags.length > 3 && (
                    <span className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-800">
                      +{client.tags.length - 3}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <Link
                    to={`/clients/${client.id}/edit`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <Edit className="h-5 w-5" />
                  </Link>
                  <button
                    onClick={() => onDelete(client.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClientList;
