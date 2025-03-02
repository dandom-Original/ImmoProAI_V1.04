import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type PurchaseProfile = Database['public']['Tables']['purchase_profiles']['Row'];
type PurchaseProfileInsert = Database['public']['Tables']['purchase_profiles']['Insert'];
type PurchaseProfileUpdate = Database['public']['Tables']['purchase_profiles']['Update'];

export function usePurchaseProfiles() {
  const [profiles, setProfiles] = useState<PurchaseProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfiles = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('purchase_profiles')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        throw error;
      }

      setProfiles(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch purchase profiles'));
      console.error('Error fetching purchase profiles:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  /**
   * Get profiles for a specific client
   */
  async function getProfilesForClient(clientId: string): Promise<PurchaseProfile[]> {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('purchase_profiles')
        .select('*')
        .eq('client_id', clientId)
        .order('updated_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to fetch profiles for client: ${clientId}`));
      console.error(`Error fetching profiles for client ${clientId}:`, err);
      return [];
    } finally {
      setLoading(false);
    }
  }

  /**
   * Get a specific profile by ID
   */
  async function getProfileById(id: string): Promise<PurchaseProfile | null> {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('purchase_profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to fetch profile with ID: ${id}`));
      console.error(`Error fetching profile ${id}:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Create a new purchase profile
   */
  async function createProfile(profile: PurchaseProfileInsert): Promise<PurchaseProfile | null> {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('purchase_profiles')
        .insert(profile)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setProfiles(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create purchase profile'));
      console.error('Error creating purchase profile:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Update an existing purchase profile
   */
  async function updateProfile(id: string, updates: PurchaseProfileUpdate): Promise<PurchaseProfile | null> {
    try {
      setLoading(true);
      
      // Add updated_at timestamp
      updates.updated_at = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('purchase_profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setProfiles(prev => prev.map(profile => profile.id === id ? data : profile));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to update profile with ID: ${id}`));
      console.error(`Error updating profile ${id}:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Delete a purchase profile
   */
  async function deleteProfile(id: string): Promise<boolean> {
    try {
      setLoading(true);
      
      // First delete all entity_tags references
      const { error: entityTagError } = await supabase
        .from('entity_tags')
        .delete()
        .eq('entity_type', 'purchase_profile')
        .eq('entity_id', id);
      
      if (entityTagError) {
        throw entityTagError;
      }
      
      // Then delete the profile
      const { error } = await supabase
        .from('purchase_profiles')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setProfiles(prev => prev.filter(profile => profile.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to delete profile with ID: ${id}`));
      console.error(`Error deleting profile ${id}:`, err);
      return false;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Find similar profiles based on criteria
   */
  async function findSimilarProfiles(profileId: string, threshold = 0.7): Promise<PurchaseProfile[]> {
    try {
      setLoading(true);
      
      // Get the source profile
      const sourceProfile = await getProfileById(profileId);
      if (!sourceProfile) {
        throw new Error(`Profile with ID ${profileId} not found`);
      }
      
      // Get all profiles except the source
      const { data: allProfiles, error } = await supabase
        .from('purchase_profiles')
        .select('*')
        .neq('id', profileId);
      
      if (error) {
        throw error;
      }
      
      // This is a simplified similarity calculation
      // In a real implementation, you would use more sophisticated algorithms
      // and possibly AI assistance for better matching
      const similarProfiles = (allProfiles || []).filter(profile => {
        let similarityScore = 0;
        let criteriaCount = 0;
        
        // Compare property type
        if (sourceProfile.property_type_id && profile.property_type_id) {
          similarityScore += sourceProfile.property_type_id === profile.property_type_id ? 1 : 0;
          criteriaCount++;
        }
        
        // Compare investment volume ranges
        if (sourceProfile.min_investment_volume && profile.min_investment_volume) {
          const minDiff = Math.abs(sourceProfile.min_investment_volume - profile.min_investment_volume) / 
                          Math.max(sourceProfile.min_investment_volume, profile.min_investment_volume);
          similarityScore += (1 - Math.min(minDiff, 1));
          criteriaCount++;
        }
        
        if (sourceProfile.max_investment_volume && profile.max_investment_volume) {
          const maxDiff = Math.abs(sourceProfile.max_investment_volume - profile.max_investment_volume) / 
                          Math.max(sourceProfile.max_investment_volume, profile.max_investment_volume);
          similarityScore += (1 - Math.min(maxDiff, 1));
          criteriaCount++;
        }
        
        // Compare location criteria if available
        if (sourceProfile.location_criteria && profile.location_criteria) {
          // This would be a more complex comparison in a real implementation
          // For now, just check if they have the same countries
          const sourceCountries = (sourceProfile.location_criteria as any).countries || [];
          const profileCountries = (profile.location_criteria as any).countries || [];
          
          if (sourceCountries.length > 0 && profileCountries.length > 0) {
            const commonCountries = sourceCountries.filter((c: string) => profileCountries.includes(c));
            similarityScore += commonCountries.length / Math.max(sourceCountries.length, profileCountries.length);
            criteriaCount++;
          }
        }
        
        // Calculate final similarity score
        const finalScore = criteriaCount > 0 ? similarityScore / criteriaCount : 0;
        return finalScore >= threshold;
      });
      
      return similarProfiles;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to find similar profiles for: ${profileId}`));
      console.error(`Error finding similar profiles for ${profileId}:`, err);
      return [];
    } finally {
      setLoading(false);
    }
  }

  /**
   * Import a profile from CSV data
   */
  async function importProfileFromCSV(clientId: string, csvData: Record<string, any>): Promise<PurchaseProfile | null> {
    try {
      setLoading(true);
      
      // Map CSV fields to profile structure
      // This is a simplified example - in a real implementation, you would have
      // more sophisticated mapping and validation
      const profileData: PurchaseProfileInsert = {
        client_id: clientId,
        title: csvData.titel || 'Imported Profile',
        status: 'active',
        property_type_id: null, // Will be set based on immotyp_id
        
        // Investment details
        investment_strategies: parseArrayField(csvData.investitionsstrategien),
        min_investment_volume: parseNumberField(csvData.investitionsvolumen_min),
        max_investment_volume: parseNumberField(csvData.investitionsvolumen_max),
        min_gross_initial_yield: parseNumberField(csvData.bruttoanfangsrendite_min),
        max_gross_initial_yield: parseNumberField(csvData.bruttoanfangsrendite_max),
        min_target_yield: parseNumberField(csvData.zielrendite_min),
        max_target_yield: parseNumberField(csvData.zielrendite_max),
        
        // Property details
        min_plot_area: parseNumberField(csvData.grundstuecksflaeche_min),
        max_plot_area: parseNumberField(csvData.grundstuecksflaeche_max),
        min_gross_floor_area: parseNumberField(csvData.bruttogeschossflache_min),
        max_gross_floor_area: parseNumberField(csvData.bruttogeschossflache_max),
        construction_year_groups: parseArrayField(csvData.baujahresgruppen),
        min_construction_year: parseNumberField(csvData.baujahr_min),
        max_construction_year: parseNumberField(csvData.baujahr_max),
        heritage_protection: parseBooleanField(csvData.denkmalschutz),
        
        // Unit details
        min_residential_units: parseNumberField(csvData.wohneinheiten_min),
        max_residential_units: parseNumberField(csvData.wohneinheiten_max),
        min_commercial_units: parseNumberField(csvData.gewerbeeinheiten_min),
        max_commercial_units: parseNumberField(csvData.gewerbeeinheiten_max),
        
        // Location criteria
        location_criteria: {
          countries: [csvData.Land || 'Deutschland'],
          cities: [], // Will be populated from location fields
          regions: []
        },
        
        // Additional data
        notes: csvData.bemerkung_lage || csvData.bemerkung_nutzungsarten || csvData.bemerkung_investitionsstrategie || '',
        external_id: csvData.id || null,
        
        // Store all original CSV data for reference
        metadata: csvData
      };
      
      // Create the profile
      return createProfile(profileData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to import profile from CSV'));
      console.error('Error importing profile from CSV:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }

  // Helper functions for CSV data parsing
  function parseNumberField(value: any): number | null {
    if (value === undefined || value === null || value === '') return null;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      if (value.toLowerCase() === 'keine begrenzung' || value.toLowerCase() === 'unbegrenzt') return null;
      const parsed = parseFloat(value.replace(/[^\d.-]/g, ''));
      return isNaN(parsed) ? null : parsed;
    }
    return null;
  }

  function parseArrayField(value: any): string[] | null {
    if (value === undefined || value === null || value === '') return null;
    if (Array.isArray(value)) return value.filter(Boolean);
    if (typeof value === 'string') return value.split(',').map(v => v.trim()).filter(Boolean);
    return null;
  }

  function parseBooleanField(value: any): boolean | null {
    if (value === undefined || value === null || value === '') return null;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value > 0;
    if (typeof value === 'string') {
      const normalized = value.toLowerCase().trim();
      return normalized === 'ja' || normalized === 'yes' || normalized === 'true' || normalized === '1';
    }
    return null;
  }

  return {
    profiles,
    loading,
    error,
    fetchProfiles,
    getProfilesForClient,
    getProfileById,
    createProfile,
    updateProfile,
    deleteProfile,
    findSimilarProfiles,
    importProfileFromCSV
  };
}
