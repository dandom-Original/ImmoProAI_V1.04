import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type ClientTask = Database['public']['Tables']['client_tasks']['Row'];
type ClientTaskInsert = Database['public']['Tables']['client_tasks']['Insert'];
type ClientTaskUpdate = Database['public']['Tables']['client_tasks']['Update'];

export function useClientTasks() {
  const [tasks, setTasks] = useState<ClientTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks(clientId?: string) {
    try {
      setLoading(true);
      let query = supabase
        .from('client_tasks')
        .select('*')
        .order('due_date', { ascending: true });
      
      if (clientId) {
        query = query.eq('client_id', clientId);
      }
      
      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setTasks(data || []);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch client tasks'));
      console.error('Error fetching client tasks:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }

  async function getTask(id: string) {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('client_tasks')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to fetch task with ID: ${id}`));
      console.error(`Error fetching task ${id}:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function createTask(task: ClientTaskInsert) {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('client_tasks')
        .insert(task)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setTasks(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create task'));
      console.error('Error creating task:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function updateTask(id: string, updates: ClientTaskUpdate) {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('client_tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setTasks(prev => prev.map(task => task.id === id ? data : task));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to update task with ID: ${id}`));
      console.error(`Error updating task ${id}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function deleteTask(id: string) {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('client_tasks')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to delete task with ID: ${id}`));
      console.error(`Error deleting task ${id}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function completeTask(id: string) {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('client_tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setTasks(prev => prev.map(task => task.id === id ? data : task));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to complete task with ID: ${id}`));
      console.error(`Error completing task ${id}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function getUpcomingTasks(days: number = 7) {
    try {
      setLoading(true);
      
      // Calculate the date range
      const today = new Date();
      const endDate = new Date();
      endDate.setDate(today.getDate() + days);
      
      const { data, error } = await supabase
        .from('client_tasks')
        .select('*')
        .gte('due_date', today.toISOString())
        .lte('due_date', endDate.toISOString())
        .eq('status', 'pending')
        .order('due_date', { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to fetch upcoming tasks`));
      console.error('Error fetching upcoming tasks:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }

  async function getOverdueTasks() {
    try {
      setLoading(true);
      
      const today = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('client_tasks')
        .select('*')
        .lt('due_date', today)
        .eq('status', 'pending')
        .order('due_date', { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to fetch overdue tasks`));
      console.error('Error fetching overdue tasks:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    getUpcomingTasks,
    getOverdueTasks
  };
}
