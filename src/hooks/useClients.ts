import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Client = Database['public']['Tables']['clients']['Row'];
type ClientInsert = Database['public']['Tables']['clients']['Insert'];
type ClientUpdate = Database['public']['Tables']['clients']['Update'];

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        throw error;
      }

      setClients(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch clients'));
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  }

  async function getClient(id: string) {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to fetch client with ID: ${id}`));
      console.error(`Error fetching client ${id}:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function createClient(client: ClientInsert) {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .insert(client)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setClients(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create client'));
      console.error('Error creating client:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function updateClient(id: string, updates: ClientUpdate) {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setClients(prev => prev.map(client => client.id === id ? data : client));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to update client with ID: ${id}`));
      console.error(`Error updating client ${id}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function deleteClient(id: string) {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setClients(prev => prev.filter(client => client.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to delete client with ID: ${id}`));
      console.error(`Error deleting client ${id}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return {
    clients,
    loading,
    error,
    fetchClients,
    getClient,
    createClient,
    updateClient,
    deleteClient
  };
}
