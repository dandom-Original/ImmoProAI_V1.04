import React, { useState } from 'react';
import { useNotifications } from '../contexts/NotificationsContext';
import NotificationsList from '../components/notifications/NotificationsList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Bell, Check, Trash2 } from 'lucide-react';

const NotificationsPage: React.FC = () => {
  const { 
    notifications, 
    unreadCount, 
    markAllAsRead, 
    clearAll, 
    loading 
  } = useNotifications();
  const [activeTab, setActiveTab] = useState<string>('all');
  
  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);
  
  const handleClearAll = () => {
    if (window.confirm('Sind Sie sicher, dass Sie alle Benachrichtigungen löschen möchten?')) {
      clearAll();
    }
  };
  
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Benachrichtigungen</h1>
          <p className="mt-2 text-sm text-gray-700">
            Verwalten Sie Ihre Benachrichtigungen und bleiben Sie über wichtige Ereignisse informiert.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Check className="mr-2 h-4 w-4" />
              Alle als gelesen markieren
            </button>
          )}
          {notifications.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Alle löschen
            </button>
          )}
        </div>
      </div>
      
      <div className="mt-8">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="all" className="relative">
              Alle
              {notifications.length > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {notifications.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="unread" className="relative">
              Ungelesen
              {unreadCount > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {unreadCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="read">
              Gelesen
              {readNotifications.length > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {readNotifications.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Bell className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Keine Benachrichtigungen</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Sie haben derzeit keine Benachrichtigungen.
                </p>
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <NotificationsList />
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="unread">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : unreadNotifications.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Check className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Keine ungelesenen Benachrichtigungen</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Sie haben alle Ihre Benachrichtigungen gelesen.
                </p>
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {unreadNotifications.map(notification => (
                    <li key={notification.id}>
                      <div className="px-4 py-4 sm:px-6 bg-indigo-50">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-indigo-700 truncate">
                            {notification.title}
                          </p>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                              Neu
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="text-sm text-gray-700">
                              {notification.message}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <p>
                              {new Date(notification.created_at).toLocaleDateString()} {new Date(notification.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="read">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : readNotifications.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Bell className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Keine gelesenen Benachrichtigungen</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Sie haben noch keine Benachrichtigungen als gelesen markiert.
                </p>
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {readNotifications.map(notification => (
                    <li key={notification.id}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-700 truncate">
                            {notification.title}
                          </p>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="text-sm text-gray-500">
                              {notification.message}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <p>
                              {new Date(notification.created_at).toLocaleDateString()} {new Date(notification.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NotificationsPage;
