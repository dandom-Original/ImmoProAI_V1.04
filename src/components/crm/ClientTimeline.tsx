import React from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { Mail, Phone, Users, FileText, Calendar, MapPin, FileCheck, AlertTriangle, CheckCircle } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type ContactEvent = Database['public']['Tables']['contact_events']['Row'];
type ClientTask = Database['public']['Tables']['client_tasks']['Row'];

type TimelineItem = {
  id: string;
  type: 'event' | 'task';
  date: string;
  data: ContactEvent | ClientTask;
};

interface ClientTimelineProps {
  events: ContactEvent[];
  tasks: ClientTask[];
  isLoading: boolean;
}

const ClientTimeline: React.FC<ClientTimelineProps> = ({ events, tasks, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Combine events and tasks into a single timeline
  const timelineItems: TimelineItem[] = [
    ...events.map(event => ({
      id: event.id,
      type: 'event' as const,
      date: event.event_date,
      data: event
    })),
    ...tasks.map(task => ({
      id: task.id,
      type: 'task' as const,
      date: task.status === 'completed' && task.completed_at 
        ? task.completed_at 
        : task.due_date,
      data: task
    }))
  ];

  // Sort by date, newest first
  timelineItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (timelineItems.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-gray-500">No timeline items available.</p>
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

  const getTaskIcon = (task: ClientTask) => {
    if (task.status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    
    const dueDate = new Date(task.due_date);
    const now = new Date();
    
    if (dueDate < now && dueDate.toDateString() !== now.toDateString()) {
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
    
    return <Calendar className="h-5 w-5 text-amber-500" />;
  };

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {timelineItems.map((item, index) => (
          <li key={`${item.type}-${item.id}`}>
            <div className="relative pb-8">
              {index !== timelineItems.length - 1 ? (
                <span
                  className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                ></span>
              ) : null}
              <div className="relative flex items-start space-x-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white">
                    {item.type === 'event' 
                      ? getEventIcon((item.data as ContactEvent).event_type)
                      : getTaskIcon(item.data as ClientTask)}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-900">
                        {item.type === 'event' 
                          ? `${(item.data as ContactEvent).event_type.charAt(0).toUpperCase() + (item.data as ContactEvent).event_type.slice(1)}`
                          : (item.data as ClientTask).title}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">
                      <time dateTime={item.date}>
                        {format(new Date(item.date), 'PPpp', { locale: de })}
                      </time>
                      {' · '}
                      {formatDistanceToNow(new Date(item.date), { addSuffix: true, locale: de })}
                    </p>
                  </div>
                  
                  {item.type === 'event' && (item.data as ContactEvent).notes && (
                    <div className="mt-2 text-sm text-gray-700">
                      <p>{(item.data as ContactEvent).notes}</p>
                    </div>
                  )}
                  
                  {item.type === 'task' && (item.data as ClientTask).description && (
                    <div className="mt-2 text-sm text-gray-700">
                      <p>{(item.data as ClientTask).description}</p>
                    </div>
                  )}
                  
                  {item.type === 'event' && (item.data as ContactEvent).outcome && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Outcome: {(item.data as ContactEvent).outcome}
                      </span>
                    </div>
                  )}
                  
                  {item.type === 'task' && (
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        (item.data as ClientTask).status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {(item.data as ClientTask).status === 'completed' 
                          ? 'Completed' 
                          : `Due: ${format(new Date((item.data as ClientTask).due_date), 'PP', { locale: de })}`}
                      </span>
                      {(item.data as ClientTask).priority && (
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${(item.data as ClientTask).priority === 'urgent' 
                          ? 'bg-red-100 text-red-800' 
                          : (item.data as ClientTask).priority === 'high'
                          ? 'bg-amber-100 text-amber-800'
                          : (item.data as ClientTask).priority === 'medium'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                        }`}>
                          {(item.data as ClientTask).priority.charAt(0).toUpperCase() + (item.data as ClientTask).priority.slice(1)} Priority
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClientTimeline;
