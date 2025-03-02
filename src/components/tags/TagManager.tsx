import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import TagBadge from './TagBadge';
import { PlusCircle, Search, X } from 'lucide-react';

export interface Tag {
  id: string;
  name: string;
  category?: string;
  color?: string;
  standard?: boolean;
  created_at: string;
}

interface TagManagerProps {
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  entityType?: string;
  showCategories?: boolean;
  maxTags?: number;
}

export default function TagManager({
  selectedTags = [],
  onTagsChange,
  entityType,
  showCategories = true,
  maxTags = 10
}: TagManagerProps) {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagCategory, setNewTagCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch available tags
  useEffect(() => {
    const fetchTags = async () => {
      setIsLoading(true);
      try {
        let query = supabase.from('tags').select('*');
        
        if (entityType) {
          query = query.eq('entity_type', entityType);
        }
        
        const { data, error } = await query.order('name');
        
        if (error) throw error;
        
        setAvailableTags(data || []);
        
        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(data?.map(tag => tag.category).filter(Boolean))
        ) as string[];
        
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching tags:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTags();
  }, [entityType]);

  const handleAddTag = (tag: Tag) => {
    if (selectedTags.length >= maxTags) {
      alert(`You can only add up to ${maxTags} tags.`);
      return;
    }
    
    if (!selectedTags.some(t => t.id === tag.id)) {
      const updatedTags = [...selectedTags, tag];
      onTagsChange(updatedTags);
    }
    
    setShowTagSelector(false);
    setSearchQuery('');
  };

  const handleRemoveTag = (tagId: string) => {
    const updatedTags = selectedTags.filter(tag => tag.id !== tagId);
    onTagsChange(updatedTags);
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    
    try {
      const newTag = {
        name: newTagName.trim(),
        category: newTagCategory.trim() || null,
        entity_type: entityType || null,
        standard: false,
        color: getRandomColor()
      };
      
      const { data, error } = await supabase
        .from('tags')
        .insert([newTag])
        .select()
        .single();
      
      if (error) throw error;
      
      setAvailableTags(prev => [...prev, data]);
      handleAddTag(data);
      
      // Add new category to list if it doesn't exist
      if (newTagCategory && !categories.includes(newTagCategory)) {
        setCategories(prev => [...prev, newTagCategory]);
      }
      
      setNewTagName('');
      setNewTagCategory('');
    } catch (error) {
      console.error('Error creating tag:', error);
    }
  };

  const getRandomColor = () => {
    const colors = ['indigo', 'red', 'green', 'blue', 'yellow', 'purple', 'pink', 'gray'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const filteredTags = availableTags.filter(tag => {
    const matchesSearch = searchQuery === '' || 
      tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tag.category && tag.category.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = !selectedCategory || tag.category === selectedCategory;
    
    const isNotSelected = !selectedTags.some(t => t.id === tag.id);
    
    return matchesSearch && matchesCategory && isNotSelected;
  });

  return (
    <div className="space-y-3">
      {/* Selected tags */}
      <div className="flex flex-wrap gap-2">
        {selectedTags.map(tag => (
          <TagBadge
            key={tag.id}
            tag={tag}
            removable
            onRemove={() => handleRemoveTag(tag.id)}
          />
        ))}
        
        {selectedTags.length < maxTags && (
          <button
            type="button"
            onClick={() => setShowTagSelector(true)}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
          >
            <PlusCircle className="h-3.5 w-3.5 mr-1" />
            Add Tag
          </button>
        )}
      </div>
      
      {/* Tag selector */}
      {showTagSelector && (
        <div className="relative mt-1 rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-10 sm:text-sm border-gray-300 rounded-md"
            placeholder="Search tags or type to create new..."
            autoFocus
          />
          
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              type="button"
              onClick={() => {
                setShowTagSelector(false);
                setSearchQuery('');
              }}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto max-h-60 focus:outline-none sm:text-sm">
            {showCategories && categories.length > 0 && (
              <div className="px-3 py-2 border-b">
                <div className="flex flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(null)}
                    className={`px-2 py-1 rounded-md text-xs ${
                      selectedCategory === null
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  
                  {categories.map(category => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={`px-2 py-1 rounded-md text-xs ${
                        selectedCategory === category
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {isLoading ? (
              <div className="px-3 py-2 text-sm text-gray-500">Loading tags...</div>
            ) : filteredTags.length > 0 ? (
              <ul>
                {filteredTags.map(tag => (
                  <li
                    key={tag.id}
                    className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100"
                    onClick={() => handleAddTag(tag)}
                  >
                    <div className="flex items-center">
                      <TagBadge tag={tag} />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">
                {searchQuery ? (
                  <div>
                    <p>No matching tags found.</p>
                    <div className="mt-2">
                      <p className="font-medium">Create new tag:</p>
                      <div className="mt-1">
                        <input
                          type="text"
                          value={newTagName}
                          onChange={e => setNewTagName(e.target.value)}
                          placeholder="Tag name"
                          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md mb-2"
                          defaultValue={searchQuery}
                        />
                        
                        {showCategories && (
                          <input
                            type="text"
                            value={newTagCategory}
                            onChange={e => setNewTagCategory(e.target.value)}
                            placeholder="Category (optional)"
                            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md mb-2"
                          />
                        )}
                        
                        <button
                          type="button"
                          onClick={handleCreateTag}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Create Tag
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  'No tags available'
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
