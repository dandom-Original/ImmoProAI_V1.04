import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Tag } from '../components/tags/TagManager';

export interface Property {
  id: string;
  title: string;
  description?: string;
  property_type: string;
  status: string;
  price?: number;
  size?: number;
  rooms?: number;
  bathrooms?: number;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  features?: string[];
  images?: string[];
  created_at: string;
  updated_at: string;
  tags?: Tag[];
}

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  async function fetchProperties() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Fetch tags for each property
      const propertiesWithTags = await Promise.all(
        (data || []).map(async (property) => {
          const { data: tagRelations, error: tagError } = await supabase
            .from('tag_relations')
            .select('*, tag:tags(*)')
            .eq('entity_id', property.id)
            .eq('entity_type', 'property');
          
          if (tagError) throw tagError;
          
          const tags = tagRelations?.map(relation => relation.tag) || [];
          
          return {
            ...property,
            tags
          };
        })
      );

      setProperties(propertiesWithTags);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch properties'));
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  }

  async function getProperty(id: string) {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      // Fetch tags
      const { data: tagRelations, error: tagError } = await supabase
        .from('tag_relations')
        .select('*, tag:tags(*)')
        .eq('entity_id', id)
        .eq('entity_type', 'property');
      
      if (tagError) throw tagError;
      
      const tags = tagRelations?.map(relation => relation.tag) || [];
      
      return {
        ...data,
        tags
      };
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to fetch property with ID: ${id}`));
      console.error(`Error fetching property ${id}:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function createProperty(property: Omit<Property, 'id' | 'created_at' | 'updated_at'>) {
    try {
      setLoading(true);
      
      // Extract tags before inserting
      const tags = property.tags || [];
      const propertyData = { ...property };
      delete propertyData.tags;
      
      const { data, error } = await supabase
        .from('properties')
        .insert(propertyData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Add tag relations if there are tags
      if (tags.length > 0) {
        const tagRelations = tags.map(tag => ({
          entity_id: data.id,
          entity_type: 'property',
          tag_id: tag.id
        }));
        
        await supabase
          .from('tag_relations')
          .insert(tagRelations);
      }

      const newProperty = {
        ...data,
        tags
      };
      
      setProperties(prev => [newProperty, ...prev]);
      return newProperty;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create property'));
      console.error('Error creating property:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function updateProperty(id: string, updates: Partial<Property>) {
    try {
      setLoading(true);
      
      // Extract tags before updating
      const tags = updates.tags || [];
      const propertyData = { ...updates };
      delete propertyData.tags;
      
      // Add updated_at timestamp
      propertyData.updated_at = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('properties')
        .update(propertyData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update tag relations
      // First, remove all existing tag relations
      await supabase
        .from('tag_relations')
        .delete()
        .eq('entity_id', id)
        .eq('entity_type', 'property');
      
      // Then add new tag relations
      if (tags.length > 0) {
        const tagRelations = tags.map(tag => ({
          entity_id: id,
          entity_type: 'property',
          tag_id: tag.id
        }));
        
        await supabase
          .from('tag_relations')
          .insert(tagRelations);
      }

      const updatedProperty = {
        ...data,
        tags
      };
      
      setProperties(prev => prev.map(property => property.id === id ? updatedProperty : property));
      return updatedProperty;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to update property with ID: ${id}`));
      console.error(`Error updating property ${id}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function deleteProperty(id: string) {
    try {
      setLoading(true);
      
      // First delete tag relations
      await supabase
        .from('tag_relations')
        .delete()
        .eq('entity_id', id)
        .eq('entity_type', 'property');
      
      // Delete matches
      await supabase
        .from('matches')
        .delete()
        .eq('property_id', id);
      
      // Then delete the property
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setProperties(prev => prev.filter(property => property.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to delete property with ID: ${id}`));
      console.error(`Error deleting property ${id}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return {
    properties,
    loading,
    error,
    fetchProperties,
    getProperty,
    createProperty,
    updateProperty,
    deleteProperty
  };
}
