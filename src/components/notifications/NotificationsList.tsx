import React from 'react';
import { useNotifications, Notification } from '../../contexts/NotificationsContext';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { Check, Trash2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NotificationsListProps {
  limit?: number;
  showControls?: boolean;
  onNotificationClick?: (notification: Notification) => void;
  className?: string;
}

const NotificationsList: React.FC<NotificationsListProps> = ({
  limit,
  showControls = true,
  onNotificationClick,
  className = ''
}) => {
  const { notifications, markAsRead, removeNotification, loading } = useNotifications();
  const navigate = useNavigate();
  
  const displayedNotifications = limit ? notifications.slice(0, limit) : notifications;
  
  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    if (onNotificationClick) {
      onNotificationClick(notification);
    } else if (notification.action_url) {
      navigate(notification.action_url);
    }
  };
  
  const formatNotificationTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: de });
    } catch (error) {
      return 'Unbekanntes Datum';
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (notifications.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Keine Benachrichtigungen</h3>
        <p className="mt-1 text-sm text-gray-500">
          Sie haben derzeit keine Benachrichtigungen.
        </p>
      </div>
    );
  }
  
  return (
    <div className={`divide-y divide-gray-200 ${className}`}>
      {displayedNotifications.map((notification) => (
        <div 
          key={notification.id} 
          className={`py-4 ${!notification.read ? 'bg-indigo-50' : ''}`}
        >
          <div className="flex items-start">
            <div 
              className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full mr-3 ${
                notification.type === 'success' ? 'bg-green-500' :
                notification.type === 'error' ? 'bg-red-500' :
                notification.type === 'warning' ? 'bg-yellow-500' :
                'bg-blue-500'
              }`}
            />
            <div className="flex-1 min-w-0">
              <div 
                className="cursor-pointer"
                onClick={() => handleNotificationClick(notification)}
              >
                <p className="text-sm font-medium text-gray-900 truncate">
                  {notification.title}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatNotificationTime(notification.created_at)}
                </p>
                
                {notification.action_url && (
                  <div className="mt-2">
                    <button
                      type="button"
                      className="inline-flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-900"
                    >
                      Details anzeigen
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {showControls && (
              <div className="ml-4 flex-shrink-0 flex space-x-2">
                {!notification.read && (
                  <button
                    type="button"
                    className="bg-white rounded-full p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => markAsRead(notification.id)}
                    title="Als gelesen markieren"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  className="bg-white rounded-full p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => removeNotification(notification.id)}
                  title="Löschen"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationsList;
