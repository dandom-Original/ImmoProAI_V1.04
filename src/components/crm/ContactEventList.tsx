import React from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { Mail, Phone, Users, FileText, Calendar, Edit, Trash2, MapPin, FileCheck, AlertTriangle } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type ContactEvent = Database['public']['Tables']['contact_events']['Row'];

interface ContactEventListProps {
  events: ContactEvent[];
  onEdit: (event: ContactEvent) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

const ContactEventList: React.FC<ContactEventListProps> = ({ events, onEdit, onDelete, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-gray-500">No contact events recorded yet.</p>
      </div>
    );
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'email':
        return <Mail className="h-5 w-5 text-blue-500" />;
      case 'call':
        return <Phone className="h-5 w-5 text-green-500" />;
      case 'meeting':
        return <Users className="h-5 w-5 text-purple-500" />;
      case 'site_visit':
        return <MapPin className="h-5 w-5 text-red-500" />;
      case 'proposal':
        return <FileCheck className="h-5 w-5 text-orange-500" />;
      case 'contract':
        return <FileText className="h-5 w-5 text-indigo-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {events.map((event, eventIdx) => (
          <li key={event.id}>
            <div className="relative pb-8">
              {eventIdx !== events.length - 1 ? (
                <span
                  className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                ></span>
              ) : null}
              <div className="relative flex items-start space-x-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white">
                    {getEventIcon(event.event_type)}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-900">
                        {event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">
                      <time dateTime={event.event_date}>
                        {format(new Date(event.event_date), 'PPpp', { locale: de })}
                      </time>
                      {' · '}
                      {formatDistanceToNow(new Date(event.event_date), { addSuffix: true, locale: de })}
                    </p>
                  </div>
                  {event.notes && (
                    <div className="mt-2 text-sm text-gray-700">
                      <p>{event.notes}</p>
                    </div>
                  )}
                  {event.outcome && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Outcome: {event.outcome}
                      </span>
                    </div>
                  )}
                  {event.follow_up_required && event.follow_up_date && (
                    <div className="mt-2 flex items-center">
                      <Calendar className="h-4 w-4 text-amber-500 mr-1" />
                      <span className="text-xs text-amber-700">
                        Follow-up scheduled for {format(new Date(event.follow_up_date), 'PPp', { locale: de })}
                      </span>
                      {new Date(event.follow_up_date) < new Date() && (
                        <AlertTriangle className="h-4 w-4 text-red-500 ml-2" />
                      )}
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0 self-center flex">
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => onEdit(event)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(event.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ContactEventList;
