import React from 'react';
import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns';
import { de } from 'date-fns/locale';
import { CheckCircle, Clock, AlertTriangle, Calendar, Edit, Trash2, CheckCircle2 } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type ClientTask = Database['public']['Tables']['client_tasks']['Row'];

interface ClientTaskListProps {
  tasks: ClientTask[];
  onEdit: (task: ClientTask) => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
  isLoading: boolean;
}

const ClientTaskList: React.FC<ClientTaskListProps> = ({ 
  tasks, 
  onEdit, 
  onDelete, 
  onComplete,
  isLoading 
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-gray-500">No tasks scheduled.</p>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-blue-100 text-blue-800';
      case 'medium':
        return 'bg-green-100 text-green-800';
      case 'high':
        return 'bg-amber-100 text-amber-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (task: ClientTask) => {
    if (task.status === 'completed') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Completed
        </span>
      );
    }
    
    const dueDate = new Date(task.due_date);
    
    if (isPast(dueDate) && !isToday(dueDate)) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Overdue
        </span>
      );
    }
    
    if (isToday(dueDate)) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
          <Clock className="h-3 w-3 mr-1" />
          Due Today
        </span>
      );
    }
    
    if (isTomorrow(dueDate)) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Calendar className="h-3 w-3 mr-1" />
          Due Tomorrow
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        <Calendar className="h-3 w-3 mr-1" />
        Upcoming
      </span>
    );
  };

  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {tasks.map((task) => (
          <li key={task.id} className={`${task.status === 'completed' ? 'bg-gray-50' : ''}`}>
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {task.status === 'completed' ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  ) : (
                    <button
                      onClick={() => onComplete(task.id)}
                      className="h-5 w-5 rounded-full border-2 border-gray-300 mr-3 hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    />
                  )}
                  <p className={`text-sm font-medium text-gray-900 ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                    {task.title}
                  </p>
                </div>
                <div className="ml-2 flex flex-shrink-0">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </span>
                </div>
              </div>
              <div className="mt-2 sm:flex sm:justify-between">
                <div className="sm:flex">
                  <p className="flex items-center text-sm text-gray-500">
                    {task.description && (
                      <span className="truncate">{task.description}</span>
                    )}
                  </p>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                  <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                  <p>
                    Due <time dateTime={task.due_date}>{format(new Date(task.due_date), 'PPp', { locale: de })}</time>
                    {' · '}
                    {formatDistanceToNow(new Date(task.due_date), { addSuffix: true, locale: de })}
                  </p>
                </div>
              </div>
              <div className="mt-2 sm:flex sm:justify-between">
                <div className="sm:flex">
                  {getStatusBadge(task)}
                </div>
                <div className="mt-2 flex space-x-2 sm:mt-0">
                  {task.status !== 'completed' && (
                    <button
                      onClick={() => onEdit(task)}
                      className="inline-flex items-center rounded-full border border-gray-300 bg-white p-1 text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(task.id)}
                    className="inline-flex items-center rounded-full border border-gray-300 bg-white p-1 text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  {task.status !== 'completed' && (
                    <button
                      onClick={() => onComplete(task.id)}
                      className="inline-flex items-center rounded-full border border-gray-300 bg-white p-1 text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
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

export default ClientTaskList;
