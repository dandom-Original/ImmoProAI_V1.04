import React, { useState } from 'react';
import { Bell, Check, Trash2, X, ExternalLink } from 'lucide-react';
import { useNotifications, Notification } from '../../contexts/NotificationsContext';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface NotificationCenterProps {
  className?: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification, 
    clearAll,
    loading
  } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.action_url) {
      navigate(notification.action_url);
      setIsOpen(false);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="h-5 w-5 text-green-600" />
          </div>
        );
      case 'error':
        return (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
            <X className="h-5 w-5 text-red-600" />
          </div>
        );
      case 'warning':
        return (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
            <svg className="h-5 w-5 text-yellow-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };

  const formatNotificationTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: de });
    } catch (error) {
      return 'Unbekanntes Datum';
    }
  };

  const getEntityTypeLabel = (entityType?: string) => {
    switch (entityType) {
      case 'client': return 'Kunde';
      case 'property': return 'Immobilie';
      case 'match': return 'Match';
      case 'document': return 'Dokument';
      case 'system': return 'System';
      default: return '';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        className="relative p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="sr-only">Benachrichtigungen anzeigen</span>
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-400 ring-2 ring-white"></span>
        )}
      </button>
      
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-25 z-40 md:hidden" 
            onClick={() => setIsOpen(false)}
          ></div>
          
          <div className="origin-top-right absolute right-0 mt-2 w-80 md:w-96 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
            <div className="py-2" role="menu" aria-orientation="vertical">
              <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-900">Benachrichtigungen</h3>
                <div className="flex space-x-2">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      className="text-xs text-indigo-600 hover:text-indigo-900 font-medium"
                      onClick={() => markAllAsRead()}
                    >
                      Alle als gelesen markieren
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      type="button"
                      className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                      onClick={() => clearAll()}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              
              {loading ? (
                <div className="px-4 py-6 text-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
                  <p className="mt-2 text-sm text-gray-500">Benachrichtigungen werden geladen...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <Bell className="h-8 w-8 text-gray-300 mx-auto" />
                  <p className="mt-2 text-sm text-gray-500">Keine Benachrichtigungen vorhanden</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 ${
                        !notification.read ? 'bg-indigo-50' : ''
                      }`}
                    >
                      <div className="flex">
                        {getNotificationIcon(notification.type)}
                        <div className="ml-3 flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                              {notification.entity_type && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {getEntityTypeLabel(notification.entity_type)}
                                </p>
                              )}
                            </div>
                            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                              {formatNotificationTime(notification.created_at)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          
                          <div className="mt-2 flex justify-between items-center">
                            {notification.action_url && (
                              <button
                                type="button"
                                className="text-xs text-indigo-600 hover:text-indigo-900 font-medium flex items-center"
                                onClick={() => handleNotificationClick(notification)}
                              >
                                Details anzeigen
                                <ExternalLink className="ml-1 h-3 w-3" />
                              </button>
                            )}
                            
                            <div className="flex space-x-2">
                              {!notification.read && (
                                <button
                                  type="button"
                                  className="text-xs text-gray-500 hover:text-gray-700"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                type="button"
                                className="text-xs text-gray-500 hover:text-gray-700"
                                onClick={() => removeNotification(notification.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;
