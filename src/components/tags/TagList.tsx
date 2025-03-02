import { useState, useEffect } from 'react';
import { TagService, Tag } from '../../services/TagService';
import TagBadge from './TagBadge';

interface TagListProps {
  onTagClick?: (tag: Tag) => void;
  categoryFilter?: string;
}

export default function TagList({ onTagClick, categoryFilter }: TagListProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadTags = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const allTags = await TagService.getTags();
        
        // Apply category filter if provided
        const filteredTags = categoryFilter
          ? allTags.filter(tag => tag.category === categoryFilter)
          : allTags;
          
        setTags(filteredTags);
      } catch (err) {
        console.error('Error loading tags:', err);
        setError('Failed to load tags. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTags();
  }, [categoryFilter]);
  
  if (isLoading) {
    return <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
    </div>;
  }
  
  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }
  
  if (tags.length === 0) {
    return <div className="p-4 text-gray-500">No tags found</div>;
  }
  
  // Group tags by category if no category filter is applied
  if (!categoryFilter) {
    const tagsByCategory: Record<string, Tag[]> = {};
    
    // Group tags by category
    tags.forEach(tag => {
      const category = tag.category || 'Uncategorized';
      if (!tagsByCategory[category]) {
        tagsByCategory[category] = [];
      }
      tagsByCategory[category].push(tag);
    });
    
    return (
      <div className="space-y-6">
        {Object.entries(tagsByCategory).map(([category, categoryTags]) => (
          <div key={category}>
            <h3 className="text-sm font-medium text-gray-700 mb-2">{category}</h3>
            <div className="flex flex-wrap gap-2">
              {categoryTags.map(tag => (
                <TagBadge
                  key={tag.id}
                  tag={tag}
                  onClick={onTagClick ? () => onTagClick(tag) : undefined}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  // Simple list if category filter is applied
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map(tag => (
        <TagBadge
          key={tag.id}
          tag={tag}
          onClick={onTagClick ? () => onTagClick(tag) : undefined}
        />
      ))}
    </div>
  );
}
