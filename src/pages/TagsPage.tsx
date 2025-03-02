import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';
import TagBadge from '../components/tags/TagBadge';
import { Tag } from '../components/tags/TagManager';
import { PlusCircle, Trash2, Edit, Check, X } from 'lucide-react';

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagCategory, setNewTagCategory] = useState('');
  const [newTagColor, setNewTagColor] = useState('indigo');
  const [newTagStandard, setNewTagStandard] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      setTags(data || []);
      
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

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    
    try {
      const newTag = {
        name: newTagName.trim(),
        category: newTagCategory.trim() || null,
        color: newTagColor,
        standard: newTagStandard
      };
      
      const { error } = await supabase
        .from('tags')
        .insert([newTag]);
      
      if (error) throw error;
      
      // Reset form
      setNewTagName('');
      setNewTagCategory('');
      setNewTagColor('indigo');
      setNewTagStandard(false);
      setIsCreating(false);
      
      // Refresh tags
      fetchTags();
    } catch (error) {
      console.error('Error creating tag:', error);
    }
  };

  const handleUpdateTag = async () => {
    if (!editingTag || !editingTag.name.trim()) return;
    
    try {
      const { error } = await supabase
        .from('tags')
        .update({
          name: editingTag.name.trim(),
          category: editingTag.category?.trim() || null,
          color: editingTag.color,
          standard: editingTag.standard
        })
        .eq('id', editingTag.id);
      
      if (error) throw error;
      
      setEditingTag(null);
      
      // Refresh tags
      fetchTags();
    } catch (error) {
      console.error('Error updating tag:', error);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    if (!window.confirm('Are you sure you want to delete this tag? This action cannot be undone.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', tagId);
      
      if (error) throw error;
      
      // Refresh tags
      fetchTags();
    } catch (error) {
      console.error('Error deleting tag:', error);
    }
  };

  const filteredTags = tags.filter(tag => {
    const matchesSearch = searchQuery === '' || 
      tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tag.category && tag.category.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = !selectedCategory || tag.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const colorOptions = [
    { value: 'indigo', label: 'Indigo' },
    { value: 'red', label: 'Red' },
    { value: 'green', label: 'Green' },
    { value: 'blue', label: 'Blue' },
    { value: 'yellow', label: 'Yellow' },
    { value: 'purple', label: 'Purple' },
    { value: 'pink', label: 'Pink' },
    { value: 'gray', label: 'Gray' }
  ];

  // Group tags by category
  const tagsByCategory: Record<string, Tag[]> = {};
  
  filteredTags.forEach(tag => {
    const category = tag.category || 'Uncategorized';
    if (!tagsByCategory[category]) {
      tagsByCategory[category] = [];
    }
    tagsByCategory[category].push(tag);
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Tag Management</h1>
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Create Tag
          </button>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setSelectedCategory(null)}
                  className={`px-3 py-1 rounded-md text-sm ${
                    selectedCategory === null
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  All Categories
                </button>
                
                {categories.map(category => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1 rounded-md text-sm ${
                      selectedCategory === category
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              
              <div className="relative rounded-md shadow-sm">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Search tags..."
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : Object.keys(tagsByCategory).length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                <p>No tags found. Create some tags to get started.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(tagsByCategory).map(([category, categoryTags]) => (
                  <div key={category}>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">{category}</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categoryTags.map(tag => (
                          <div
                            key={tag.id}
                            className="flex items-center justify-between p-3 bg-white rounded-md shadow-sm"
                          >
                            {editingTag?.id === tag.id ? (
                              <div className="w-full space-y-2">
                                <input
                                  type="text"
                                  value={editingTag.name}
                                  onChange={e => setEditingTag({ ...editingTag, name: e.target.value })}
                                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                  placeholder="Tag name"
                                />
                                
                                <input
                                  type="text"
                                  value={editingTag.category || ''}
                                  onChange={e => setEditingTag({ ...editingTag, category: e.target.value })}
                                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                  placeholder="Category (optional)"
                                />
                                
                                <select
                                  value={editingTag.color || 'indigo'}
                                  onChange={e => setEditingTag({ ...editingTag, color: e.target.value })}
                                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                >
                                  {colorOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                                
                                <div className="flex items-center">
                                  <input
                                    id={`standard-${tag.id}`}
                                    type="checkbox"
                                    checked={editingTag.standard || false}
                                    onChange={e => setEditingTag({ ...editingTag, standard: e.target.checked })}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                  />
                                  <label htmlFor={`standard-${tag.id}`} className="ml-2 block text-sm text-gray-900">
                                    Standard Tag
                                  </label>
                                </div>
                                
                                <div className="flex space-x-2">
                                  <button
                                    type="button"
                                    onClick={handleUpdateTag}
                                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Save
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingTag(null)}
                                    className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-4 font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center">
                                  <TagBadge tag={tag} />
                                  {tag.standard && (
                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                      Standard
                                    </span>
                                  )}
                                </div>
                                
                                <div className="flex space-x-1">
                                  <button
                                    type="button"
                                    onClick={() => setEditingTag(tag)}
                                    className="text-gray-400 hover:text-gray-500"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteTag(tag.id)}
                                    className="text-gray-400 hover:text-red-500"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Create Tag Modal */}
        {isCreating && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-4 border-b">
                <h3 className="text-lg font-medium">Create New Tag</h3>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label htmlFor="tag-name" className="block text-sm font-medium text-gray-700">
                    Tag Name *
                  </label>
                  <input
                    type="text"
                    id="tag-name"
                    value={newTagName}
                    onChange={e => setNewTagName(e.target.value)}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="Enter tag name"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="tag-category" className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <input
                    type="text"
                    id="tag-category"
                    value={newTagCategory}
                    onChange={e => setNewTagCategory(e.target.value)}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="Enter category (optional)"
                    list="existing-categories"
                  />
                  <datalist id="existing-categories">
                    {categories.map(category => (
                      <option key={category} value={category} />
                    ))}
                  </datalist>
                </div>
                
                <div>
                  <label htmlFor="tag-color" className="block text-sm font-medium text-gray-700">
                    Color
                  </label>
                  <select
                    id="tag-color"
                    value={newTagColor}
                    onChange={e => setNewTagColor(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    {colorOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="tag-standard"
                    type="checkbox"
                    checked={newTagStandard}
                    onChange={e => setNewTagStandard(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="tag-standard" className="ml-2 block text-sm text-gray-900">
                    Standard Tag (appears in suggestions)
                  </label>
                </div>
                
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Preview: <TagBadge tag={{ id: 'preview', name: newTagName || 'Tag Name', category: newTagCategory, color: newTagColor }} />
                  </p>
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
                <button
                  type="button"
                  onClick={handleCreateTag}
                  disabled={!newTagName.trim()}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-indigo-300 disabled:cursor-notallowed"
                >
                  Create Tag
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setNewTagName('');
                    setNewTagCategory('');
                    setNewTagColor('indigo');
                    setNewTagStandard(false);
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
