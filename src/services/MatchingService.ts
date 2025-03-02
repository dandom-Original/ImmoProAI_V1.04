import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import { NotificationService } from './NotificationService';

type Match = Database['public']['Tables']['matches']['Row'];
type MatchInsert = Database['public']['Tables']['matches']['Insert'];
type MatchUpdate = Database['public']['Tables']['matches']['Update'];
type Property = Database['public']['Tables']['properties']['Row'];
type PurchaseProfile = Database['public']['Tables']['purchase_profiles']['Row'];
type Client = Database['public']['Tables']['clients']['Row'];

export class MatchingService {
  static async getMatches(): Promise<Match[]> {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .order('match_score', { ascending: false });

    if (error) {
      throw new Error(`Error fetching matches: ${error.message}`);
    }

    return data || [];
  }

  static async getMatchById(id: string): Promise<Match | null> {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Error fetching match: ${error.message}`);
    }

    return data;
  }

  static async getMatchesByClientId(clientId: string): Promise<Match[]> {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('client_id', clientId)
      .order('match_score', { ascending: false });

    if (error) {
      throw new Error(`Error fetching matches for client: ${error.message}`);
    }

    return data || [];
  }

  static async getMatchesByPropertyId(propertyId: string): Promise<Match[]> {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('property_id', propertyId)
      .order('match_score', { ascending:false });

    if (error) {
      throw new Error(`Error fetching matches for property: ${error.message}`);
    }

    return data || [];
  }

  static async createMatch(match: MatchInsert): Promise<Match> {
    const { data, error } = await supabase
      .from('matches')
      .insert(match)
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating match: ${error.message}`);
    }

    // Notify user about new match
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (userId) {
        // Get client and property details for notification
        const client = await this.getClientById(match.client_id);
        const property = await this.getPropertyById(match.property_id);
        
        if (client && property) {
          await NotificationService.createNotification({
            user_id: userId,
            title: 'New Match Found',
            message: `New match found between ${client.name} and ${property.title}`,
            type: 'new_match',
            entity_type: 'matches',
            entity_id: data.id,
            is_read: false
          });
        }
      }
    } catch (notificationError) {
      console.error('Error creating match notification:', notificationError);
    }

    return data;
  }

  static async updateMatch(id: string, updates: MatchUpdate): Promise<Match> {
    const { data, error } = await supabase
      .from('matches')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating match: ${error.message}`);
    }

    return data;
  }

  static async deleteMatch(id: string): Promise<void> {
    const { error } = await supabase
      .from('matches')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting match: ${error.message}`);
    }
  }

  static async findMatches(propertyId?: string, clientId?: string): Promise<Match[]> {
    if (!propertyId && !clientId) {
      throw new Error('Either propertyId or clientId must be provided');
    }

    if (propertyId) {
      // Find matches for a specific property
      const property = await this.getPropertyById(propertyId);
      if (!property) {
        throw new Error(`Property with ID ${propertyId} not found`);
      }

      const { data: purchaseProfiles, error: profilesError } = await supabase
        .from('purchase_profiles')
        .select('*');

      if (profilesError) {
        throw new Error(`Error fetching purchase profiles: ${profilesError.message}`);
      }

      const matches: Match[] = [];

      for (const profile of purchaseProfiles || []) {
        const matchScore = this.calculateMatchScore(property, profile);
        
        if (matchScore > 0) {
          const matchReasons = this.generateMatchReasons(property, profile);
          
          const match: MatchInsert = {
            client_id: profile.client_id,
            property_id: propertyId,
            purchase_profile_id: profile.id,
            match_score: matchScore,
            match_reasons: matchReasons,
            status: 'new'
          };
          
          try {
            const createdMatch = await this.createMatch(match);
            matches.push(createdMatch);
          } catch (error) {
            console.error(`Error creating match for profile ${profile.id}:`, error);
          }
        }
      }

      return matches;
    } else if (clientId) {
      // Find matches for a specific client
      const { data: purchaseProfiles, error: profilesError } = await supabase
        .from('purchase_profiles')
        .select('*')
        .eq('client_id', clientId);

      if (profilesError) {
        throw new Error(`Error fetching purchase profiles: ${profilesError.message}`);
      }

      if (!purchaseProfiles || purchaseProfiles.length === 0) {
        return [];
      }

      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('*');

      if (propertiesError) {
        throw new Error(`Error fetching properties: ${propertiesError.message}`);
      }

      const matches: Match[] = [];

      for (const profile of purchaseProfiles) {
        for (const property of properties || []) {
          const matchScore = this.calculateMatchScore(property, profile);
          
          if (matchScore > 0) {
            const matchReasons = this.generateMatchReasons(property, profile);
            
            const match: MatchInsert = {
              client_id: clientId,
              property_id: property.id,
              purchase_profile_id: profile.id,
              match_score: matchScore,
              match_reasons: matchReasons,
              status: 'new'
            };
            
            try {
              const createdMatch = await this.createMatch(match);
              matches.push(createdMatch);
            } catch (error) {
              console.error(`Error creating match for property ${property.id}:`, error);
            }
          }
        }
      }

      return matches;
    }

    return [];
  }

  private static async getClientById(clientId: string): Promise<Client | null> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (error) {
      console.error(`Error fetching client ${clientId}:`, error);
      return null;
    }

    return data;
  }

  private static async getPropertyById(propertyId: string): Promise<Property | null> {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single();

    if (error) {
      console.error(`Error fetching property ${propertyId}:`, error);
      return null;
    }

    return data;
  }

  private static calculateMatchScore(property: Property, profile: PurchaseProfile): number {
    let score = 0;
    const maxScore = 100;
    
    // Check property type
    if (profile.property_types.includes(property.property_type)) {
      score += 15;
    } else {
      return 0; // Property type is a must-match criterion
    }
    
    // Check location
    if (profile.locations.includes(property.city)) {
      score += 20;
    } else {
      return 0; // Location is a must-match criterion
    }
    
    // Check price range
    if (property.price !== null) {
      if (
        (profile.min_price === null || property.price >= profile.min_price) &&
        (profile.max_price === null || property.price <= profile.max_price)
      ) {
        score += 15;
      } else {
        // Price outside range reduces score but doesn't eliminate
        const minPriceMatch = profile.min_price === null || property.price >= profile.min_price * 0.9;
        const maxPriceMatch = profile.max_price === null || property.price <= profile.max_price * 1.1;
        
        if (minPriceMatch && maxPriceMatch) {
          score += 5; // Price is close to range
        }
      }
    }
    
    // Check size
    if (property.size !== null) {
      if (
        (profile.min_size === null || property.size >= profile.min_size) &&
        (profile.max_size === null || property.size <= profile.max_size)
      ) {
        score += 10;
      }
    }
    
    // Check bedrooms
    if (property.bedrooms !== null) {
      if (
        (profile.min_bedrooms === null || property.bedrooms >= profile.min_bedrooms) &&
        (profile.max_bedrooms === null || property.bedrooms <= profile.max_bedrooms)
      ) {
        score += 10;
      }
    }
    
    // Check bathrooms
    if (property.bathrooms !== null) {
      if (
        (profile.min_bathrooms === null || property.bathrooms >= profile.min_bathrooms) &&
        (profile.max_bathrooms === null || property.bathrooms <= profile.max_bathrooms)
      ) {
        score += 5;
      }
    }
    
    // Check required features
    if (profile.required_features && profile.required_features.length > 0 && property.features) {
      const matchingRequiredFeatures = profile.required_features.filter(feature => 
        property.features?.includes(feature)
      );
      
      if (matchingRequiredFeatures.length === profile.required_features.length) {
        score += 15;
      } else if (matchingRequiredFeatures.length > 0) {
        // Partial match on required features
        score += (matchingRequiredFeatures.length / profile.required_features.length) * 10;
      }
    }
    
    // Check desired features
    if (profile.desired_features && profile.desired_features.length > 0 && property.features) {
      const matchingDesiredFeatures = profile.desired_features.filter(feature => 
        property.features?.includes(feature)
      );
      
      if (matchingDesiredFeatures.length > 0) {
        score += (matchingDesiredFeatures.length / profile.desired_features.length) * 10;
      }
    }
    
    // Normalize score to 0-100 range
    return Math.min(Math.round(score), maxScore);
  }

  private static generateMatchReasons(property: Property, profile: PurchaseProfile): string[] {
    const reasons: string[] = [];
    
    // Property type match
    if (profile.property_types.includes(property.property_type)) {
      reasons.push(`Property type "${property.property_type}" matches client preferences`);
    }
    
    // Location match
    if (profile.locations.includes(property.city)) {
      reasons.push(`Location "${property.city}" is in client's desired areas`);
    }
    
    // Price match
    if (property.price !== null) {
      if (
        (profile.min_price === null || property.price >= profile.min_price) &&
        (profile.max_price === null || property.price <= profile.max_price)
      ) {
        reasons.push(`Price ${property.price} is within client's budget range`);
      }
    }
    
    // Size match
    if (property.size !== null) {
      if (
        (profile.min_size === null || property.size >= profile.min_size) &&
        (profile.max_size === null || property.size <= profile.max_size)
      ) {
        reasons.push(`Size ${property.size} sqm meets client's requirements`);
      }
    }
    
    // Bedrooms match
    if (property.bedrooms !== null) {
      if (
        (profile.min_bedrooms === null || property.bedrooms >= profile.min_bedrooms) &&
        (profile.max_bedrooms === null || property.bedrooms <= profile.max_bedrooms)
      ) {
        reasons.push(`${property.bedrooms} bedrooms matches client's needs`);
      }
    }
    
    // Bathrooms match
    if (property.bathrooms !== null) {
      if (
        (profile.min_bathrooms === null || property.bathrooms >= profile.min_bathrooms) &&
        (profile.max_bathrooms === null || property.bathrooms <= profile.max_bathrooms)
      ) {
        reasons.push(`${property.bathrooms} bathrooms matches client's needs`);
      }
    }
    
    // Feature matches
    if (property.features && property.features.length > 0) {
      // Required features
      if (profile.required_features && profile.required_features.length > 0) {
        const matchingRequiredFeatures = profile.required_features.filter(feature => 
          property.features?.includes(feature)
        );
        
        if (matchingRequiredFeatures.length > 0) {
          reasons.push(`Property has ${matchingRequiredFeatures.length} of ${profile.required_features.length} required features`);
        }
      }
      
      // Desired features
      if (profile.desired_features && profile.desired_features.length > 0) {
        const matchingDesiredFeatures = profile.desired_features.filter(feature => 
          property.features?.includes(feature)
        );
        
        if (matchingDesiredFeatures.length > 0) {
          reasons.push(`Property has ${matchingDesiredFeatures.length} of ${profile.desired_features.length} desired features`);
        }
      }
    }
    
    return reasons;
  }
}
