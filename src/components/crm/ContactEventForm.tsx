import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, FileText, User, Tag } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type ContactEventInsert = Database['public']['Tables']['contact_events']['Insert'];

interface ContactEventFormProps {
  clientId: string;
  initialData?: Partial<ContactEventInsert>;
  onSubmit: (event: ContactEventInsert) => Promise<any>;
  onCancel: () => void;
  isLoading: boolean;
}

const ContactEventForm: React.FC<ContactEventFormProps> = ({
  clientId,
  initialData,
  onSubmit,
  onCancel,
  isLoading
}) => {
  const [formData, setFormData] = useState<Partial<ContactEventInsert>>({
    client_id: clientId,
    event_type: 'note',
    event_date: new Date().toISOString().slice(0, 16),
    notes: '',
    outcome: '',
    follow_up_required: false,
    follow_up_date: null,
    ...initialData
  });
  
  const [formError, setFormError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    if (!formData.event_type || !formData.event_date) {
      setFormError('Event type and date are required');
      return;
    }
    
    try {
      await onSubmit(formData as ContactEventInsert);
      onCancel(); // Close the form after successful submission
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="text-red-700">{formError}</div>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="event_type" className="block text-sm font-medium text-gray-700">
            Event Type *
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Tag className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="event_type"
              name="event_type"
              required
              value={formData.event_type || ''}
              onChange={handleChange}
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="note">Note</option>
              <option value="call">Call</option>
              <option value="email">Email</option>
              <option value="meeting">Meeting</option>
              <option value="site_visit">Site Visit</option>
              <option value="proposal">Proposal</option>
              <option value="contract">Contract</option>
            </select>
          </div>
        </div>
        
        <div>
          <label htmlFor="event_date" className="block text-sm font-medium text-gray-700">
            Date & Time *
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="datetime-local"
              id="event_date"
              name="event_date"
              required
              value={formData.event_date || ''}
              onChange={handleChange}
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        
        <div className="sm:col-span-2">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
              <FileText className="h-5 w-5 text-gray-400" />
            </div>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              value={formData.notes || ''}
              onChange={handleChange}
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter detailed notes about the interaction..."
            />
          </div>
        </div>
        
        <div className="sm:col-span-2">
          <label htmlFor="outcome" className="block text-sm font-medium text-gray-700">
            Outcome
          </label>
          <input
            type="text"
            id="outcome"
            name="outcome"
            value={formData.outcome || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="What was the result of this interaction?"
          />
        </div>
        
        <div className="sm:col-span-2">
          <div className="flex items-center">
            <input
              id="follow_up_required"
              name="follow_up_required"
              type="checkbox"
              checked={formData.follow_up_required || false}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="follow_up_required" className="ml-2 block text-sm text-gray-700">
              Follow-up required
            </label>
          </div>
        </div>
        
        {formData.follow_up_required && (
          <div className="sm:col-span-2">
            <label htmlFor="follow_up_date" className="block text-sm font-medium text-gray-700">
              Follow-up Date
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="datetime-local"
                id="follow_up_date"
                name="follow_up_date"
                value={formData.follow_up_date || ''}
                onChange={handleChange}
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {isLoading ? 'Saving...' : 'Save Contact Event'}
        </button>
      </div>
    </form>
  );
};

export default ContactEventForm;
