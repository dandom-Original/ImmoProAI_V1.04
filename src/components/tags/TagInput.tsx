import { useState, useEffect } from 'react';
import { TagService, Tag } from '../../services/TagService';

interface TagInputProps {
  onTagSelected: (tagId: string) => void;
  excludeTagIds?: string[];
}

export default function TagInput({ onTagSelected, excludeTagIds = [] }: TagInputProps) {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTags = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const tags = await TagService.getTags();
        setAllTags(tags);
      } catch (err) {
        console.error('Error loading tags:', err);
        setError('Failed to load tags');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTags();
  }, []);

  useEffect(() => {
    // Filter tags based on search query and excluded IDs
    const filtered = allTags
      .filter(tag => !excludeTagIds.includes(tag.id))
      .filter(tag => 
        tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tag.category && tag.category.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    
    setFilteredTags(filtered);
  }, [searchQuery, allTags, excludeTagIds]);

  const handleTagClick = (tagId: string) => {
    onTagSelected(tagId);
    setSearchQuery('');
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative">
      <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
        <input
          type="text"
          className="flex-grow px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="Search or add tags..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsDropdownOpen(true);
          }}
          onFocus={() => setIsDropdownOpen(true)}
          onBlur={() => {
            // Delay closing to allow for tag selection
            setTimeout(() => setIsDropdownOpen(false), 150);
          }}
        />
      </div>
      
      {isDropdownOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md max-h-60 overflow-auto">
          {isLoading ? (
            <div className="p-2 text-center text-gray-500">Loading tags...</div>
          ) : filteredTags.length > 0 ? (
            <ul className="py-1">
              {filteredTags.map(tag => (
                <li
                  key={tag.id}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                  onClick={() => handleTagClick(tag.id)}
                >
                  <span className={`w-3 h-3 rounded-full mr-2 ${tag.color ? `bg-${tag.color}-500` : 'bg-indigo-500'}`}></span>
                  {tag.category && (
                    <span className="text-gray-500 mr-1">{tag.category}:</span>
                  )}
                  <span>{tag.name}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-2 text-center text-gray-500">
              {searchQuery ? 'No matching tags found' : 'No available tags'}
            </div>
          )}
        </div>
      )}
      
      {error && (
        <div className="mt-1 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}
