import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, MapPin, Tag, Calendar, Zap, Building, Plus, Edit, Trash2 } from 'lucide-react';
import { useClients } from '../hooks/useClients';
import { useClientRelationships } from '../hooks/useClientRelationships';
import { useClientTasks } from '../hooks/useClientTasks';
import ClientRelationshipCard from '../components/crm/ClientRelationshipCard';
import ContactEventForm from '../components/crm/ContactEventForm';
import ContactEventList from '../components/crm/ContactEventList';
import ClientTaskForm from '../components/crm/ClientTaskForm';
import ClientTaskList from '../components/crm/ClientTaskList';
import ClientTimeline from '../components/crm/ClientTimeline';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import type { Database } from '../lib/database.types';

type ContactEvent = Database['public']['Tables']['contact_events']['Row'];
type ClientTask = Database['public']['Tables']['client_tasks']['Row'];

const ClientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { clients, loading: clientsLoading, error: clientsError, getClient } = useClients();
  const { 
    relationships, 
    contactEvents, 
    loading: relationshipsLoading, 
    error: relationshipsError,
    getRelationship,
    updateRelationship,
    createRelationship,
    fetchContactEvents,
    addContactEvent,
    updateContactEvent,
    deleteContactEvent,
    calculateRelationshipScore
  } = useClientRelationships();
  const {
    tasks,
    loading: tasksLoading,
    error: tasksError,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    completeTask
  } = useClientTasks();
  
  const [client, setClient] = useState<any>(null);
  const [relationship, setRelationship] = useState<any>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactEvent | null>(null);
  const [editingTask, setEditingTask] = useState<ClientTask | null>(null);
  
  useEffect(() => {
    if (id) {
      loadClientData();
    }
  }, [id]);
  
  const loadClientData = async () => {
    if (!id) return;
    
    // Load client data
    const clientData = await getClient(id);
    if (clientData) {
      setClient(clientData);
    }
    
    // Load relationship data
    const relationshipData = await getRelationship(id);
    setRelationship(relationshipData);
    
    // Load contact events
    await fetchContactEvents(id);
    
    // Load tasks
    await fetchTasks(id);
  };
  
  const handleUpdateRelationshipStage = async (stage: string) => {
    if (!id) return;
    
    try {
      if (relationship) {
        const updated = await updateRelationship(id, {
          relationship_stage: stage
        });
        setRelationship(updated);
      } else {
        const created = await createRelationship({
          client_id: id,
          relationship_stage: stage,
          relationship_score: 1
        });
        setRelationship(created);
      }
    } catch (error) {
      console.error('Error updating relationship stage:', error);
    }
  };
  
  const handleAddContactEvent = async (event: any) => {
    if (!id) return;
    
    try {
      await addContactEvent(event);
      setShowContactForm(false);
      setEditingContact(null);
      
      // Recalculate relationship score
      await calculateRelationshipScore(id);
      
      // Reload relationship data
      const relationshipData = await getRelationship(id);
      setRelationship(relationshipData);
    } catch (error) {
      console.error('Error adding contact event:', error);
    }
  };
  
  const handleEditContactEvent = (event: ContactEvent) => {
    setEditingContact(event);
    setShowContactForm(true);
  };
  
  const handleDeleteContactEvent = async (eventId: string) => {
    if (!id || !window.confirm('Are you sure you want to delete this contact event?')) return;
    
    try {
      await deleteContactEvent(eventId);
      
      // Recalculate relationship score
      await calculateRelationshipScore(id);
      
      // Reload relationship data
      const relationshipData = await getRelationship(id);
      setRelationship(relationshipData);
    } catch (error) {
      console.error('Error deleting contact event:', error);
    }
  };
  
  const handleAddTask = async (task: any) => {
    if (!id) return;
    
    try {
      await createTask(task);
      setShowTaskForm(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };
  
  const handleEditTask = (task: ClientTask) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };
  
  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };
  
  const handleCompleteTask = async (taskId: string) => {
    try {
      await completeTask(taskId);
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };
  
  if (clientsLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-10">
          <p className="text-gray-500">Loading client details...</p>
        </div>
      </div>
    );
  }
  
  if (clientsError) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Error loading client details: {clientsError.message}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // If client not found in state, try to find it in the clients array
  const clientData = client || clients.find(c => c.id === id) || {
    id: '1',
    name: 'Loading...',
    company: 'Loading...',
    email: 'loading@example.com',
    phone: '',
    address: '',
    status: 'active',
    tags: [],
    notes: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          to="/clients"
          className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Clients
        </Link>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        {/* Client Header */}
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{clientData.name}</h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">{clientData.company}</p>
          </div>
          <div className="flex space-x-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              clientData.status === 'active' ? 'bg-green-100 text-green-800' :
              clientData.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
              clientData.status === 'lead' ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {clientData.status.charAt(0).toUpperCase() + clientData.status.slice(1)}
            </span>
            <Link
              to={`/clients/${clientData.id}/edit`}
              className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Link>
          </div>
        </div>
        
        {/* Client Contact Information */}
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
          <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-start">
              <User className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
              <div>
                <dt className="text-sm font-medium text-gray-500">Contact Person</dt>
                <dd className="mt-1 text-sm text-gray-900">{clientData.name}</dd>
              </div>
            </div>
            
            <div className="flex items-start">
              <Mail className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <a href={`mailto:${clientData.email}`} className="text-indigo-600 hover:text-indigo-500">
                    {clientData.email}
                  </a>
                </dd>
              </div>
            </div>
            
            <div className="flex items-start">
              <Phone className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {clientData.phone ? (
                    <a href={`tel:${clientData.phone}`} className="text-indigo-600 hover:text-indigo-500">
                      {clientData.phone}
                    </a>
                  ) : (
                    <span className="text-gray-400">Not provided</span>
                  )}
                </dd>
              </div>
            </div>
            
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
              <div>
                <dt className="text-sm font-medium text-gray-500">Address</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {clientData.address || <span className="text-gray-400">Not provided</span>}
                </dd>
              </div>
            </div>
            
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
              <div>
                <dt className="text-sm font-medium text-gray-500">Client Since</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(clientData.created_at).toLocaleDateString()}
                </dd>
              </div>
            </div>
          </div>
        </div>
        
        {/* Client Tags */}
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div className="flex items-center">
            <Tag className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Tags</h3>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {clientData.tags && clientData.tags.length > 0 ? (
              clientData.tags.map((tag: string, index: number) => (
                <span key={index} className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  {tag.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </span>
              ))
            ) : (
              <span className="text-sm text-gray-400">No tags</span>
            )}
          </div>
        </div>
        
        {/* Client Notes */}
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium text-gray-900">Notes</h3>
          <div className="mt-3 text-sm text-gray-500">
            <p>{clientData.notes || 'No notes available.'}</p>
          </div>
        </div>
      </div>
      
      {/* Client Relationship Management */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Relationship Card */}
        <div className="lg:col-span-1">
          <ClientRelationshipCard
            relationship={relationship}
            onUpdateStage={handleUpdateRelationshipStage}
            isLoading={relationshipsLoading}
          />
        </div>
        
        {/* CRM Tabs */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg">
            <Tabs defaultValue="timeline" className="w-full">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="interactions">Interactions</TabsTrigger>
                  <TabsTrigger value="tasks">Tasks</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="timeline" className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Client Timeline</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => { setShowContactForm(true); setEditingContact(null); }}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Interaction
                    </button>
                    <button
                      onClick={() => { setShowTaskForm(true); setEditingTask(null); }}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Task
                    </button>
                  </div>
                </div>
                
                <ClientTimeline
                  events={contactEvents}
                  tasks={tasks}
                  isLoading={relationshipsLoading || tasksLoading}
                />
              </TabsContent>
              
              <TabsContent value="interactions" className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Contact Interactions</h3>
                  <button
                    onClick={() => { setShowContactForm(true); setEditingContact(null); }}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Interaction
                  </button>
                </div>
                
                {showContactForm && (
                  <div className="mb-6 bg-gray-50 p-4 rounded-md border border-gray-200">
                    <h4 className="text-md font-medium text-gray-900 mb-4">
                      {editingContact ? 'Edit Contact Event' : 'New Contact Event'}
                    </h4>
                    <ContactEventForm
                      clientId={id || ''}
                      initialData={editingContact || undefined}
                      onSubmit={handleAddContactEvent}
                      onCancel={() => { setShowContactForm(false); setEditingContact(null); }}
                      isLoading={relationshipsLoading}
                    />
                  </div>
                )}
                
                <ContactEventList
                  events={contactEvents}
                  onEdit={handleEditContactEvent}
                  onDelete={handleDeleteContactEvent}
                  isLoading={relationshipsLoading}
                />
              </TabsContent>
              
              <TabsContent value="tasks" className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Client Tasks</h3>
                  <button
                    onClick={() => { setShowTaskForm(true); setEditingTask(null); }}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Task
                  </button>
                </div>
                
                {showTaskForm && (
                  <div className="mb-6 bg-gray-50 p-4 rounded-md border border-gray-200">
                    <h4 className="text-md font-medium text-gray-900 mb-4">
                      {editingTask ? 'Edit Task' : 'New Task'}
                    </h4>
                    <ClientTaskForm
                      clientId={id || ''}
                      initialData={editingTask || undefined}
                      onSubmit={handleAddTask}
                      onCancel={() => { setShowTaskForm(false); setEditingTask(null); }}
                      isLoading={tasksLoading}
                    />
                  </div>
                )}
                
                <ClientTaskList
                  tasks={tasks}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onComplete={handleCompleteTask}
                  isLoading={tasksLoading}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="mt-6 flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3">
        <Link
          to={`/clients/${clientData.id}/edit`}
          className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Edit Client
        </Link>
        
        <Link
          to="/matching"
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Zap className="h-4 w-4 mr-2" />
          Find Matching Properties
        </Link>
      </div>
    </div>
  );
};

export default ClientDetailPage;
