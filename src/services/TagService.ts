import { supabase } from '../lib/supabase';

export interface Tag {
  id: string;
  name: string;
  category?: string;
  color?: string;
  standard?: boolean;
  entity_type?: string;
  created_at?: string;
}

export interface TagRelation {
  id: string;
  entity_id: string;
  entity_type: string;
  tag_id: string;
  created_at: string;
  tag?: Tag;
}

export async function fetchTags(entityType?: string): Promise<Tag[]> {
  try {
    let query = supabase.from('tags').select('*');
    
    if (entityType) {
      query = query.eq('entity_type', entityType).or('entity_type.is.null');
    }
    
    const { data, error } = await query.order('category').order('name');
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
}

export async function fetchStandardTags(entityType?: string): Promise<Tag[]> {
  try {
    let query = supabase.from('tags')
      .select('*')
      .eq('standard', true);
    
    if (entityType) {
      query = query.eq('entity_type', entityType).or('entity_type.is.null');
    }
    
    const { data, error } = await query.order('category').order('name');
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching standard tags:', error);
    return [];
  }
}

export async function createTag(tag: Omit<Tag, 'id' | 'created_at'>): Promise<Tag | null> {
  try {
    const { data, error } = await supabase
      .from('tags')
      .insert([tag])
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error creating tag:', error);
    return null;
  }
}

export async function updateTag(id: string, updates: Partial<Tag>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('tags')
      .update(updates)
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating tag:', error);
    return false;
  }
}

export async function deleteTag(id: string): Promise<boolean> {
  try {
    // First delete all tag relations
    const { error: relationsError } = await supabase
      .from('tag_relations')
      .delete()
      .eq('tag_id', id);
    
    if (relationsError) throw relationsError;
    
    // Then delete the tag
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting tag:', error);
    return false;
  }
}

export async function fetchEntityTags(entityId: string, entityType: string): Promise<Tag[]> {
  try {
    const { data, error } = await supabase
      .from('tag_relations')
      .select('*, tag:tags(*)')
      .eq('entity_id', entityId)
      .eq('entity_type', entityType);
    
    if (error) throw error;
    
    return data?.map(relation => relation.tag) || [];
  } catch (error) {
    console.error('Error fetching entity tags:', error);
    return [];
  }
}

export async function addTagToEntity(tagId: string, entityId: string, entityType: string): Promise<boolean> {
  try {
    // Check if relation already exists
    const { data: existingData, error: existingError } = await supabase
      .from('tag_relations')
      .select('id')
      .eq('tag_id', tagId)
      .eq('entity_id', entityId)
      .eq('entity_type', entityType)
      .maybeSingle();
    
    if (existingError) throw existingError;
    
    // If relation already exists, return true
    if (existingData) return true;
    
    // Create new relation
    const { error } = await supabase
      .from('tag_relations')
      .insert([{
        tag_id: tagId,
        entity_id: entityId,
        entity_type: entityType
      }]);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error adding tag to entity:', error);
    return false;
  }
}

export async function removeTagFromEntity(tagId: string, entityId: string, entityType: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('tag_relations')
      .delete()
      .eq('tag_id', tagId)
      .eq('entity_id', entityId)
      .eq('entity_type', entityType);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error removing tag from entity:', error);
    return false;
  }
}

export async function updateEntityTags(entityId: string, entityType: string, tagIds: string[]): Promise<boolean> {
  try {
    // First, get current tags
    const { data: currentRelations, error: fetchError } = await supabase
      .from('tag_relations')
      .select('id, tag_id')
      .eq('entity_id', entityId)
      .eq('entity_type', entityType);
    
    if (fetchError) throw fetchError;
    
    const currentTagIds = currentRelations?.map(rel => rel.tag_id) || [];
    
    // Tags to add (in tagIds but not in currentTagIds)
    const tagsToAdd = tagIds.filter(id => !currentTagIds.includes(id));
    
    // Tags to remove (in currentTagIds but not in tagIds)
    const tagsToRemove = currentTagIds.filter(id => !tagIds.includes(id));
    
    // Add new tags
    if (tagsToAdd.length > 0) {
      const newRelations = tagsToAdd.map(tagId => ({
        tag_id: tagId,
        entity_id: entityId,
        entity_type: entityType
      }));
      
      const { error: addError } = await supabase
        .from('tag_relations')
        .insert(newRelations);
      
      if (addError) throw addError;
    }
    
    // Remove old tags
    if (tagsToRemove.length > 0) {
      const { error: removeError } = await supabase
        .from('tag_relations')
        .delete()
        .eq('entity_id', entityId)
        .eq('entity_type', entityType)
        .in('tag_id', tagsToRemove);
      
      if (removeError) throw removeError;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating entity tags:', error);
    return false;
  }
}

export async function findEntitiesByTags(tagIds: string[], entityType: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('tag_relations')
      .select('entity_id')
      .eq('entity_type', entityType)
      .in('tag_id', tagIds);
    
    if (error) throw error;
    
    // Count occurrences of each entity_id
    const entityCounts: Record<string, number> = {};
    data?.forEach(relation => {
      const { entity_id } = relation;
      entityCounts[entity_id] = (entityCounts[entity_id] || 0) + 1;
    });
    
    // Sort entities by number of matching tags (descending)
    const sortedEntities = Object.entries(entityCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .map(([entityId]) => entityId);
    
    return sortedEntities;
  } catch (error) {
    console.error('Error finding entities by tags:', error);
    return [];
  }
}
