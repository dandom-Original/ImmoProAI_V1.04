import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter, Calendar, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { de } from 'date-fns/locale';
import { useClientTasks } from '../hooks/useClientTasks';
import { useClients } from '../hooks/useClients';
import ClientTaskForm from '../components/crm/ClientTaskForm';
import ClientTaskList from '../components/crm/ClientTaskList';
import type { Database } from '../lib/database.types';

type ClientTask = Database['public']['Tables']['client_tasks']['Row'];
type Client = Database['public']['Tables']['clients']['Row'];

const TasksPage: React.FC = () => {
  const { tasks, loading, error, fetchTasks, createTask, updateTask, deleteTask, completeTask } = useClientTasks();
  const { clients, loading: clientsLoading } = useClients();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('filter') || 'all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [editingTask, setEditingTask] = useState<ClientTask | null>(null);
  
  useEffect(() => {
    fetchTasks();
  }, []);
  
  useEffect(() => {
    if (searchParams.get('filter')) {
      setStatusFilter(searchParams.get('filter') || 'all');
    }
  }, [searchParams]);
  
  const handleAddTask = async (task: any) => {
    try {
      await createTask(task);
      setShowTaskForm(false);
      setEditingTask(null);
      setSelectedClient('');
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };
  
  const handleEditTask = (task: ClientTask) => {
    setEditingTask(task);
    setSelectedClient(task.client_id);
    setShowTaskForm(true);
  };
  
  const handleDeleteTask = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(id);
    }
  };
  
  const handleCompleteTask = async (id: string) => {
    await completeTask(id);
  };
  
  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Unknown Client';
  };
  
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesStatus = true;
    if (statusFilter === 'completed') {
      matchesStatus = task.status === 'completed';
    } else if (statusFilter === 'pending') {
      matchesStatus = task.status === 'pending';
    } else if (statusFilter === 'overdue') {
      matchesStatus = task.status === 'pending' && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date));
    } else if (statusFilter === 'today') {
      matchesStatus = isToday(new Date(task.due_date));
    } else if (statusFilter === 'tomorrow') {
      matchesStatus = isTomorrow(new Date(task.due_date));
    }
    
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });
  
  // Group tasks by client
  const tasksByClient: Record<string, ClientTask[]> = {};
  filteredTasks.forEach(task => {
    if (!tasksByClient[task.client_id]) {
      tasksByClient[task.client_id] = [];
    }
    tasksByClient[task.client_id].push(task);
  });
  
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Tasks</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage all client-related tasks and follow-ups.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => { setShowTaskForm(true); setEditingTask(null); }}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </button>
        </div>
      </div>
      
      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="sm:w-64">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setSearchParams({ filter: e.target.value });
              }}
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
              <option value="today">Due Today</option>
              <option value="tomorrow">Due Tomorrow</option>
            </select>
          </div>
        </div>
        
        <div className="sm:w-64">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <AlertTriangle className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mt-6 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Error loading tasks: {error.message}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {showTaskForm && (
        <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              {editingTask ? 'Edit Task' : 'New Task'}
            </h2>
            <button
              onClick={() => { setShowTaskForm(false); setEditingTask(null); setSelectedClient(''); }}
              className="text-gray-400 hover:text-gray-500"
            >
              &times;
            </button>
          </div>
          
          {!editingTask && (
            <div className="mb-4">
              <label htmlFor="client_select" className="block text-sm font-medium text-gray-700">
                Select Client *
              </label>
              <select
                id="client_select"
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                required
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} ({client.company})
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {(selectedClient || editingTask) && (
            <ClientTaskForm
              clientId={selectedClient || editingTask?.client_id || ''}
              initialData={editingTask || undefined}
              onSubmit={handleAddTask}
              onCancel={() => { setShowTaskForm(false); setEditingTask(null); setSelectedClient(''); }}
              isLoading={loading}
            />
          )}
        </div>
      )}
      
      <div className="mt-6">
        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-10 bg-white shadow overflow-hidden sm:rounded-md">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new task for a client.
            </p>
            <div className="mt-6">
              <button
                onClick={() => { setShowTaskForm(true); setEditingTask(null); }}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Task summary */}
            <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                      <Clock className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Tasks</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">{filteredTasks.length}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Overdue</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">
                            {filteredTasks.filter(task => 
                              task.status === 'pending' && 
                              isPast(new Date(task.due_date)) && 
                              !isToday(new Date(task.due_date))
                            ).length}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-amber-100 rounded-md p-3">
                      <Calendar className="h-6 w-6 text-amber-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Due Today</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">
                            {filteredTasks.filter(task => 
                              isToday(new Date(task.due_date))
                            ).length}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">
                            {filteredTasks.filter(task => 
                              task.status === 'completed'
                            ).length}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tasks by client */}
            {Object.keys(tasksByClient).map(clientId => (
              <div key={clientId} className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-medium text-gray-900">
                    <Link to={`/clients/${clientId}`} className="hover:text-indigo-600">
                      {getClientName(clientId)}
                    </Link>
                  </h2>
                  <span className="text-sm text-gray-500">
                    {tasksByClient[clientId].length} task{tasksByClient[clientId].length !== 1 ? 's' : ''}
                  </span>
                </div>
                <ClientTaskList
                  tasks={tasksByClient[clientId]}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onComplete={handleCompleteTask}
                  isLoading={false}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksPage;
