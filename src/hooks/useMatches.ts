import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Match = Database['public']['Tables']['matches']['Row'];
type MatchInsert = Database['public']['Tables']['matches']['Insert'];
type MatchUpdate = Database['public']['Tables']['matches']['Update'];

export function useMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMatches = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('score', { ascending: false });

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

  async function getMatchesForClient(clientId: string) {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          properties:property_id(id, title, address, price, images)
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

  async function getMatchesForPurchaseProfile(profileId: string) {
    try {
      setLoading(true);
      // First get the client ID for this profile
      const { data: profile, error: profileError } = await supabase
        .from('purchase_profiles')
        .select('client_id')
        .eq('id', profileId)
        .single();
      
      if (profileError) throw profileError;
      if (!profile) throw new Error(`Purchase profile with ID ${profileId} not found`);
      
      // Then get matches for this client that are related to this profile
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          properties:property_id(id, title, address, price, images)
        `)
        .eq('client_id', profile.client_id)
        .eq('profile_id', profileId)
        .order('score', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to fetch matches for profile: ${profileId}`));
      console.error(`Error fetching matches for profile ${profileId}:`, err);
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

  async function getMatchById(id: string) {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          clients:client_id(*),
          properties:property_id(*),
          purchase_profiles:profile_id(*)
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

  async function getMatchesByTags(tagIds: string[], clientId?: string) {
    try {
      setLoading(true);
      
      // Start building the query
      let query = supabase
        .from('matches')
        .select(`
          *,
          clients:client_id(id, name, company),
          properties:property_id(id, title, address, price)
        `);
      
      // If client ID is provided, filter by client
      if (clientId) {
        query = query.eq('client_id', clientId);
      }
      
      // Execute the query
      const { data, error } = await query.order('score', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // If no tag IDs, return all matches
      if (!tagIds.length) {
        return data || [];
      }
      
      // Filter matches by checking if the property has any of the specified tags
      const matchesWithTags = [];
      
      for (const match of data || []) {
        // Get property tags
        const { data: propertyTags } = await supabase
          .from('property_tags')
          .select('tag_id')
          .eq('property_id', match.property_id);
        
        // Check if property has any of the specified tags
        const propertyTagIds = propertyTags?.map(pt => pt.tag_id) || [];
        const hasMatchingTag = tagIds.some(tagId => propertyTagIds.includes(tagId));
        
        if (hasMatchingTag) {
          matchesWithTags.push(match);
        }
      }
      
      return matchesWithTags;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch matches by tags'));
      console.error('Error fetching matches by tags:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }

  return {
    matches,
    loading,
    error,
    fetchMatches,
    getMatchesForClient,
    getMatchesForProperty,
    getMatchesForPurchaseProfile,
    createMatch,
    updateMatch,
    deleteMatch,
    getMatchById,
    getMatchesByTags
  };
}
