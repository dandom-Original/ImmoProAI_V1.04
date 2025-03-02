import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

export type Match = Database['public']['Tables']['matches']['Row'];
export type MatchInsert = Database['public']['Tables']['matches']['Insert'];
export type MatchUpdate = Database['public']['Tables']['matches']['Update'];

export function useMatching() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMatches = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          clients:client_id(id, name, company),
          properties:property_id(id, title, address, city)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setMatches(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch matches'));
      console.error('Error fetching matches:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
    
    // Set up real-time subscription for matches
    const matchesSubscription = supabase
      .channel('matches_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'matches' 
        }, 
        (payload) => {
          console.log('Matches change received:', payload);
          fetchMatches();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(matchesSubscription);
    };
  }, [fetchMatches]);

  async function getMatchById(id: string) {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          clients:client_id(id, name, company, email, phone, status, preferences),
          properties:property_id(id, title, address, city, country, price, size, property_type, features, images)
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to fetch match with ID: ${id}`));
      console.error(`Error fetching match ${id}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function getMatchesForClient(clientId: string) {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          properties:property_id(id, title, address, city, price, images)
        `)
        .eq('client_id', clientId)
        .order('score', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to fetch matches for client: ${clientId}`));
      console.error(`Error fetching matches for client ${clientId}:`, err);
      return [];
    } finally {
      setLoading(false);
    }
  }

  async function getMatchesForProperty(propertyId: string) {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          clients:client_id(id, name, company, email)
        `)
        .eq('property_id', propertyId)
        .order('score', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to fetch matches for property: ${propertyId}`));
      console.error(`Error fetching matches for property ${propertyId}:`, err);
      return [];
    } finally {
      setLoading(false);
    }
  }

  async function createMatch(match: MatchInsert) {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('matches')
        .insert(match)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setMatches(prev => [data, ...prev]);
      
      // Create notification
      await supabase.from('notifications').insert({
        title: 'New match created',
        message: `A new match was created with score ${match.score}%`,
        type: 'info',
        entity_id: data.id,
        entity_type: 'match',
        action_url: `/matching/${data.id}`
      });
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create match'));
      console.error('Error creating match:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function updateMatch(id: string, updates: MatchUpdate) {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('matches')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setMatches(prev => prev.map(match => match.id === id ? data : match));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to update match with ID: ${id}`));
      console.error(`Error updating match ${id}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function deleteMatch(id: string) {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setMatches(prev => prev.filter(match => match.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to delete match with ID: ${id}`));
      console.error(`Error deleting match ${id}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function runMatchingForClient(clientId: string) {
    try {
      setLoading(true);
      
      // Fetch client data
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();
      
      if (clientError) throw clientError;
      
      // Fetch active properties
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'active');
      
      if (propertiesError) throw propertiesError;
      
      // Calculate matches for each property
      const newMatches = [];
      for (const property of properties || []) {
        const matchScore = await supabase.functions.invoke('calculate-match-score', {
          body: { client, property }
        });
        
        if (matchScore.data && matchScore.data.score >= 60) {
          newMatches.push({
            client_id: clientId,
            property_id: property.id,
            score: matchScore.data.score,
            match_reasons: matchScore.data.matchReasons,
            concerns: matchScore.data.concerns,
            status: 'pending',
            notes: `Automatically generated match with score ${matchScore.data.score}%`
          });
        }
      }
      
      // Insert new matches
      if (newMatches.length > 0) {
        const { data, error } = await supabase
          .from('matches')
          .insert(newMatches)
          .select();
        
        if (error) throw error;
        
        // Create notification
        await supabase.from('notifications').insert({
          title: 'New matches found',
          message: `${newMatches.length} new potential matches found for client`,
          type: 'info',
          entity_id: clientId,
          entity_type: 'client',
          action_url: `/clients/${clientId}`
        });
        
        return data || [];
      }
      
      return [];
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to run matching for client: ${clientId}`));
      console.error(`Error running matching for client ${clientId}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return {
    matches,
    loading,
    error,
    fetchMatches,
    getMatchById,
    getMatchesForClient,
    getMatchesForProperty,
    createMatch,
    updateMatch,
    deleteMatch,
    runMatchingForClient
  };
}
