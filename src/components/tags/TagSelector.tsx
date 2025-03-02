import { useState, useEffect } from 'react';
import { TagService, Tag } from '../../services/TagService';
import TagBadge from './TagBadge';

interface TagSelectorProps {
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
  categoryFilter?: string;
}

export default function TagSelector({ selectedTagIds, onChange, categoryFilter }: TagSelectorProps) {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadTags = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Load all available tags
        const allTags = await TagService.getTags();
        
        // Apply category filter if provided
        const filteredTags = categoryFilter
          ? allTags.filter(tag => tag.category === categoryFilter)
          : allTags;
          
        setAvailableTags(filteredTags);
        
        // Set selected tags based on IDs
        if (selectedTagIds.length > 0) {
          const selected = allTags.filter(tag => selectedTagIds.includes(tag.id));
          setSelectedTags(selected);
        }
      } catch (err) {
        console.error('Error loading tags:', err);
        setError('Failed to load tags. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTags();
  }, [categoryFilter, selectedTagIds]);
  
  const handleTagToggle = (tag: Tag) => {
    let newSelectedTags: Tag[];
    let newSelectedTagIds: string[];
    
    if (selectedTagIds.includes(tag.id)) {
      // Remove tag
      newSelectedTags = selectedTags.filter(t => t.id !== tag.id);
      newSelectedTagIds = selectedTagIds.filter(id => id !== tag.id);
    } else {
      // Add tag
      newSelectedTags = [...selectedTags, tag];
      newSelectedTagIds = [...selectedTagIds, tag.id];
    }
    
    setSelectedTags(newSelectedTags);
    onChange(newSelectedTagIds);
  };
  
  if (isLoading) {
    return <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
    </div>;
  }
  
  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }
  
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {selectedTags.length > 0 ? (
          selectedTags.map(tag => (
            <TagBadge
              key={tag.id}
              tag={tag}
              removable
              onRemove={() => handleTagToggle(tag)}
            />
          ))
        ) : (
          <p className="text-sm text-gray-500">No tags selected</p>
        )}
      </div>
      
      <div className="border-t pt-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Available Tags</h3>
        <div className="flex flex-wrap gap-2">
          {availableTags
            .filter(tag => !selectedTagIds.includes(tag.id))
            .map(tag => (
              <TagBadge
                key={tag.id}
                tag={tag}
                onClick={() => handleTagToggle(tag)}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
