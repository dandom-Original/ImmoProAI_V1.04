import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type ClientRelationship = Database['public']['Tables']['client_relationships']['Row'];
type ClientRelationshipInsert = Database['public']['Tables']['client_relationships']['Insert'];
type ClientRelationshipUpdate = Database['public']['Tables']['client_relationships']['Update'];

type ContactEvent = Database['public']['Tables']['contact_events']['Row'];
type ContactEventInsert = Database['public']['Tables']['contact_events']['Insert'];
type ContactEventUpdate = Database['public']['Tables']['contact_events']['Update'];

export function useClientRelationships() {
  const [relationships, setRelationships] = useState<ClientRelationship[]>([]);
  const [contactEvents, setContactEvents] = useState<ContactEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchRelationships();
  }, []);

  async function fetchRelationships() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('client_relationships')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        throw error;
      }

      setRelationships(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch client relationships'));
      console.error('Error fetching client relationships:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchContactEvents(clientId: string) {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contact_events')
        .select('*')
        .eq('client_id', clientId)
        .order('event_date', { ascending: false });

      if (error) {
        throw error;
      }

      setContactEvents(data || []);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to fetch contact events for client: ${clientId}`));
      console.error(`Error fetching contact events for client ${clientId}:`, err);
      return [];
    } finally {
      setLoading(false);
    }
  }

  async function getRelationship(clientId: string) {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('client_relationships')
        .select('*')
        .eq('client_id', clientId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No relationship found, return null
          return null;
        }
        throw error;
      }

      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to fetch relationship for client: ${clientId}`));
      console.error(`Error fetching relationship for client ${clientId}:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function createRelationship(relationship: ClientRelationshipInsert) {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('client_relationships')
        .insert(relationship)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setRelationships(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create client relationship'));
      console.error('Error creating client relationship:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function updateRelationship(clientId: string, updates: ClientRelationshipUpdate) {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('client_relationships')
        .update(updates)
        .eq('client_id', clientId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setRelationships(prev => prev.map(rel => rel.client_id === clientId ? data : rel));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to update relationship for client: ${clientId}`));
      console.error(`Error updating relationship for client ${clientId}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function addContactEvent(event: ContactEventInsert) {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contact_events')
        .insert(event)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setContactEvents(prev => [data, ...prev]);
      
      // Update the last_contact_date in the client_relationships table
      if (event.client_id) {
        const relationship = await getRelationship(event.client_id);
        if (relationship) {
          await updateRelationship(event.client_id, {
            last_contact_date: event.event_date,
            last_contact_type: event.event_type
          });
        } else {
          await createRelationship({
            client_id: event.client_id,
            last_contact_date: event.event_date,
            last_contact_type: event.event_type,
            relationship_stage: 'new',
            relationship_score: 1
          });
        }
      }
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add contact event'));
      console.error('Error adding contact event:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function updateContactEvent(id: string, updates: ContactEventUpdate) {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contact_events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setContactEvents(prev => prev.map(event => event.id === id ? data : event));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to update contact event: ${id}`));
      console.error(`Error updating contact event ${id}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function deleteContactEvent(id: string) {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('contact_events')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setContactEvents(prev => prev.filter(event => event.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to delete contact event: ${id}`));
      console.error(`Error deleting contact event ${id}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function calculateRelationshipScore(clientId: string) {
    try {
      // Fetch all contact events for this client
      const events = await fetchContactEvents(clientId);
      
      if (!events || events.length === 0) {
        return 0;
      }
      
      // Calculate score based on recency, frequency, and type of interactions
      const now = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(now.getMonth() - 1);
      
      // Count recent interactions (last month)
      const recentEvents = events.filter(event => 
        new Date(event.event_date) >= oneMonthAgo
      );
      
      // Weight different event types
      const eventTypeWeights: Record<string, number> = {
        'meeting': 5,
        'call': 3,
        'email': 2,
        'note': 1
      };
      
      // Calculate weighted score
      let score = 0;
      
      // Recent events contribute more to the score
      recentEvents.forEach(event => {
        const weight = eventTypeWeights[event.event_type] || 1;
        score += weight * 2; // Double weight for recent events
      });
      
      // Older events still contribute but less
      const olderEvents = events.filter(event => 
        new Date(event.event_date) < oneMonthAgo
      );
      
      olderEvents.forEach(event => {
        const weight = eventTypeWeights[event.event_type] || 1;
        score += weight;
      });
      
      // Normalize score to a 1-100 scale
      const normalizedScore = Math.min(Math.round(score), 100);
      
      // Update the relationship score
      const relationship = await getRelationship(clientId);
      if (relationship) {
        await updateRelationship(clientId, {
          relationship_score: normalizedScore
        });
      }
      
      return normalizedScore;
    } catch (err) {
      console.error(`Error calculating relationship score for client ${clientId}:`, err);
      return 0;
    }
  }

  return {
    relationships,
    contactEvents,
    loading,
    error,
    fetchRelationships,
    fetchContactEvents,
    getRelationship,
    createRelationship,
    updateRelationship,
    addContactEvent,
    updateContactEvent,
    deleteContactEvent,
    calculateRelationshipScore
  };
}
