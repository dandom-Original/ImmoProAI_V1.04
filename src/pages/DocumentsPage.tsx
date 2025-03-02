import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import DocumentUploader from '../components/documents/DocumentUploader';
import { supabase } from '../lib/supabase';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null);
  
  // For demo purposes, we'll use a fixed entity
  const demoEntityId = 'demo-entity-123';
  const demoEntityType = 'client';
  
  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('entity_type', demoEntityType)
          .eq('entity_id', demoEntityId)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setDocuments(data || []);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError('Failed to load documents. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDocuments();
  }, []);
  
  const handleUploadComplete = (uploadedFiles: any[]) => {
    setDocuments(prev => [...uploadedFiles, ...prev]);
  };
  
  const handleDocumentClick = (document: any) => {
    setSelectedDocument(document);
  };
  
  const handleClosePreview = () => {
    setSelectedDocument(null);
  };
  
  const handleDeleteDocument = async (documentId: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }
    
    try {
      // First get the document to get the file path
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .select('file_path')
        .eq('id', documentId)
        .single();
      
      if (docError) throw docError;
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')<boltAction type="file" filePath="src/pages/DocumentsPage.tsx">import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import DocumentUploader from '../components/documents/DocumentUploader';
import { supabase } from '../lib/supabase';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null);
  
  // For demo purposes, we'll use a fixed entity
  const demoEntityId = 'demo-entity-123';
  const demoEntityType = 'client';
  
  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('entity_type', demoEntityType)
          .eq('entity_id', demoEntityId)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setDocuments(data || []);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError('Failed to load documents. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDocuments();
  }, []);
  
  const handleUploadComplete = (uploadedFiles: any[]) => {
    setDocuments(prev => [...uploadedFiles, ...prev]);
  };
  
  const handleDocumentClick = (document: any) => {
    setSelectedDocument(document);
  };
  
  const handleClosePreview = () => {
    setSelectedDocument(null);
  };
  
  const handleDeleteDocument = async (documentId: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }
    
    try {
      // First get the document to get the file path
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .select('file_path')
        .eq('id', documentId)
        .single();
      
      if (docError) throw docError;
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([docData.file_path]);
      
      if (storageError) throw storageError;
      
      // Delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);
      
      if (dbError) throw dbError;
      
      // Update state
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      
      if (selectedDocument?.id === documentId) {
        setSelectedDocument(null);
      }
    } catch (err) {
      console.error('Error deleting document:', err);
      alert('Failed to delete document. Please try again.');
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Document Management</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Documents</h2>
                
                {isLoading ? (
                  <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : error ? (
                  <div className="p-4 text-red-600">
                    {error}
                  </div>
                ) : documents.length === 0 ? (
                  <div className="text-center p-8 text-gray-500">
                    <p>No documents found. Upload some documents to get started.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Size
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Uploaded
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {documents.map((doc) => (
                          <tr 
                            key={doc.id} 
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleDocumentClick(doc)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                  {doc.file_name}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-500">
                                {doc.file_type}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-500">
                                {(doc.file_size / 1024).toFixed(1)} KB
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-500">
                                {new Date(doc.created_at).toLocaleDateString()}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(doc.public_url, '_blank');
                                }}
                                className="text-indigo-600 hover:text-indigo-900 mr-3"
                              >
                                View
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteDocument(doc.id);
                                }}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Upload Documents</h2>
              <DocumentUploader
                entityType={demoEntityType}
                entityId={demoEntityId}
                onUploadComplete={handleUploadComplete}
              />
            </div>
          </div>
        </div>
        
        {selectedDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-medium">{selectedDocument.file_name}</h3>
                <button
                  onClick={handleClosePreview}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4">
                {selectedDocument.file_type.startsWith('image/') ? (
                  <img
                    src={selectedDocument.public_url}
                    alt={selectedDocument.file_name}
                    className="max-w-full mx-auto"
                  />
                ) : selectedDocument.file_type === 'application/pdf' ? (
                  <iframe
                    src={selectedDocument.public_url}
                    title={selectedDocument.file_name}
                    className="w-full h-full min-h-[500px]"
                  />
                ) : (
                  <div className="text-center p-12">
                    <p>Preview not available for this file type.</p>
                    <a
                      href={selectedDocument.public_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Download File
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
