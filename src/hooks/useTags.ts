import { useState, useEffect, useCallback } from 'react';
import { TagService, Tag } from '../services/TagService';

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTags = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedTags = await TagService.getTags();
      setTags(fetchedTags);
    } catch (err) {
      console.error('Error fetching tags:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch tags'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const createTag = useCallback(async (tag: Omit<Tag, 'id' | 'created_at' | 'user_id'>) => {
    try {
      const newTag = await TagService.createTag(tag);
      setTags(prevTags => [...prevTags, newTag]);
      return newTag;
    } catch (err) {
      console.error('Error creating tag:', err);
      throw err;
    }
  }, []);

  const updateTag = useCallback(async (id: string, updates: Partial<Omit<Tag, 'id' | 'created_at' | 'user_id'>>) => {
    try {
      const updatedTag = await TagService.updateTag(id, updates);
      setTags(prevTags => prevTags.map(tag => tag.id === id ? updatedTag : tag));
      return updatedTag;
    } catch (err) {
      console.error('Error updating tag:', err);
      throw err;
    }
  }, []);

  const deleteTag = useCallback(async (id: string) => {
    try {
      await TagService.deleteTag(id);
      setTags(prevTags => prevTags.filter(tag => tag.id !== id));
    } catch (err) {
      console.error('Error deleting tag:', err);
      throw err;
    }
  }, []);

  const getTagsByIds = useCallback(async (ids: string[]) => {
    try {
      return await TagService.getTagsByIds(ids);
    } catch (err) {
      console.error('Error getting tags by IDs:', err);
      throw err;
    }
  }, []);

  return {
    tags,
    isLoading,
    error,
    fetchTags,
    createTag,
    updateTag,
    deleteTag,
    getTagsByIds
  };
}
