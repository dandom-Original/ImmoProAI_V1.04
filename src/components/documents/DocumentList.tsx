import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { File, FileText, Image, Film, Music, Archive, Database, Trash2, Download, Eye, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface FileWithMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  path: string;
  metadata?: Record<string, any>;
  extractedText?: string;
  uploadedAt: string;
  entityId?: string;
  entityType?: 'client' | 'property' | 'match';
}

interface DocumentListProps {
  entityId?: string;
  entityType?: 'client' | 'property' | 'match';
  onDeleteDocument?: (documentId: string) => void;
  onViewDocument?: (document: FileWithMetadata) => void;
}

const DocumentList: React.FC<DocumentListProps> = ({
  entityId,
  entityType,
  onDeleteDocument,
  onViewDocument
}) => {
  const [documents, setDocuments] = useState<FileWithMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'name' | 'uploadedAt' | 'size'>('uploadedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchDocuments();
    
    // Set up real-time subscription for document changes
    const documentsSubscription = supabase
      .channel('documents_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'documents',
          filter: entityId ? `entity_id=eq.${entityId}` : undefined
        }, 
        () => {
          fetchDocuments();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(documentsSubscription);
    };
  }, [entityId, entityType]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('documents')
        .select('*');
      
      if (entityId) {
        query = query.eq('entity_id', entityId);
      }
      
      if (entityType) {
        query = query.eq('entity_type', entityType);
      }
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      
      // Transform the data to match FileWithMetadata interface
      const transformedData: FileWithMetadata[] = data.map(doc => ({
        id: doc.id,
        name: doc.name,
        size: doc.size,
        type: doc.type,
        url: doc.url,
        path: doc.path,
        metadata: doc.metadata || {},
        extractedText: doc.extracted_text,
        uploadedAt: doc.created_at,
        entityId: doc.entity_id,
        entityType: doc.entity_type
      }));
      
      setDocuments(transformedData);
      
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }
    
    try {
      // First, get the document to find its storage path
      const { data: document, error: fetchError } = await supabase
        .from('documents')
        .select('path')
        .eq('id', documentId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.path]);
      
      if (storageError) throw storageError;
      
      // Delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);
      
      if (dbError) throw dbError;
      
      // Update local state
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      
      // Call the callback if provided
      if (onDeleteDocument) {
        onDeleteDocument(documentId);
      }
      
    } catch (err) {
      console.error('Error deleting document:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete document');
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="h-6 w-6 text-blue-500" />;
    if (fileType.startsWith('video/')) return <Film className="h-6 w-6 text-purple-500" />;
    if (fileType.startsWith('audio/')) return <Music className="h-6 w-6 text-pink-500" />;
    if (fileType.startsWith('application/pdf')) return <FileText className="h-6 w-6 text-red-500" />;
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return <Database className="h-6 w-6 text-green-500" />;
    if (fileType.includes('zip') || fileType.includes('compressed')) return <Archive className="h-6 w-6 text-yellow-500" />;
    return <File className="h-6 w-6 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeLabel = (fileType: string) => {
    if (fileType.startsWith('image/')) return 'Image';
    if (fileType.startsWith('video/')) return 'Video';
    if (fileType.startsWith('audio/')) return 'Audio';
    if (fileType.startsWith('application/pdf')) return 'PDF';
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return 'Spreadsheet';
    if (fileType.includes('word') || fileType.includes('document')) return 'Document';
    if (fileType.includes('zip') || fileType.includes('compressed')) return 'Archive';
    return 'Other';
  };

  const getUniqueFileTypes = () => {
    const types = new Set<string>();
    documents.forEach(doc => {
      types.add(getFileTypeLabel(doc.type));
    });
    return Array.from(types);
  };

  const handleSort = (field: 'name' | 'uploadedAt' | 'size') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Filter and sort documents
  const filteredAndSortedDocuments = documents
    .filter(doc => {
      // Apply search filter
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.extractedText && doc.extractedText.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (doc.metadata && Object.values(doc.metadata).some(value => 
          typeof value === 'string' && value.toLowerCase().includes(searchTerm.toLowerCase())
        ));
      
      // Apply file type filter
      const matchesFileType = !fileTypeFilter || getFileTypeLabel(doc.type) === fileTypeFilter;
      
      return matchesSearch && matchesFileType;
    })
    .sort((a, b) => {
      // Apply sorting
      let comparison = 0;
      
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'uploadedAt') {
        comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
      } else if (sortField === 'size') {
        comparison = a.size - b.size;
      }
      
      return sortDirection === 'desc' ? -comparison : comparison;
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 my-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Filter className="h-4 w-4 mr-2 text-gray-500" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
          {showFilters ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
        </button>
      </div>
      
      {showFilters && (
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="file-type-filter" className="block text-sm font-medium text-gray-700">
              File Type
            </label>
            <select
              id="file-type-filter"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={fileTypeFilter || ''}
              onChange={(e) => setFileTypeFilter(e.target.value || null)}
            >
              <option value="">All File Types</option>
              {getUniqueFileTypes().map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700">
              Sort By
            </label>
            <select
              id="sort-by"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={`${sortField}-${sortDirection}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split('-');
                setSortField(field as 'name' | 'uploadedAt' | 'size');
                setSortDirection(direction as 'asc' | 'desc');
              }}
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="uploadedAt-desc">Date (Newest First)</option>
              <option value="uploadedAt-asc">Date (Oldest First)</option>
              <option value="size-desc">Size (Largest First)</option>
              <option value="size-asc">Size (Smallest First)</option>
            </select>
          </div>
        </div>
      )}
      
      {documents.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <File className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-gray-900">No documents</h3>
          <p className="mt-1 text-sm text-gray-500">
            Upload documents to see them here.
          </p>
        </div>
      ) : filteredAndSortedDocuments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-gray-900">No matching documents</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filters.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Document
                    {sortField === 'name' && (
                      sortDirection === 'asc' ? 
                        <ChevronUp className="ml-1 h-4 w-4" /> : 
                        <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Type
                </th>
                <th 
                  scope="col" 
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                  onClick={() => handleSort('size')}
                >
                  <div className="flex items-center">
                    Size
                    {sortField === 'size' && (
                      sortDirection === 'asc' ? 
                        <ChevronUp className="ml-1 h-4 w-4" /> : 
                        <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                  onClick={() => handleSort('uploadedAt')}
                >
                  <div className="flex items-center">
                    Uploaded
                    {sortField === 'uploadedAt' && (
                      sortDirection === 'asc' ? 
                        <ChevronUp className="ml-1 h-4 w-4" /> : 
                        <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredAndSortedDocuments.map((document) => (
                <tr key={document.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    <div className="flex items-center">
                      {getFileIcon(document.type)}
                      <span className="ml-2 truncate max-w-xs">{document.name}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {getFileTypeLabel(document.type)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {formatFileSize(document.size)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {new Date(document.uploadedAt).toLocaleDateString()}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div className="flex items-center justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => onViewDocument && onViewDocument(document)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="View"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <a
                        href={document.url}
                        download
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Download"
                      >
                        <Download className="h-5 w-5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDeleteDocument(document.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DocumentList;
