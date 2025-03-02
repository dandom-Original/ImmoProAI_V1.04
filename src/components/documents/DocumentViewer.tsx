import React, { useState, useEffect } from 'react';
import { FileText, X, Download, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import type { FileWithMetadata } from './DocumentUploader';

interface DocumentViewerProps {
  document: FileWithMetadata;
  onClose: () => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ document, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  useEffect(() => {
    setLoading(true);
    setError(null);
    setZoom(1);
    setRotation(0);
    setCurrentPage(1);
    
    // For PDF documents, we would initialize PDF.js here
    // For simplicity, we're just setting a timeout to simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
      
      // For PDFs, we would get the total pages from PDF.js
      if (document.type === 'application/pdf') {
        setTotalPages(Math.floor(Math.random() * 10) + 1); // Simulate random page count
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [document]);
  
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };
  
  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };
  
  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };
  
  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };
  
  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };
  
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="flex flex-col justify-center items-center h-full text-center p-6">
          <FileText className="h-16 w-16 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Document</h3>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      );
    }
    
    // Handle different file types
    if (document.type.startsWith('image/')) {
      return (
        <div className="flex justify-center items-center h-full">
          <img
            src={document.url}
            alt={document.name}
            className="max-h-full max-w-full object-contain transition-transform duration-200"
            style={{ 
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
            }}
          />
        </div>
      );
    }
    
    if (document.type === 'application/pdf') {
      return (
        <div className="h-full w-full">
          <iframe
            src={`${document.url}#page=${currentPage}`}
            title={document.name}
            className="w-full h-full border-0"
          />
        </div>
      );
    }
    
    // For other file types, show a download prompt
    return (
      <div className="flex flex-col justify-center items-center h-full text-center p-6">
        <FileText className="h-16 w-16 text-indigo-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">{document.name}</h3>
        <p className="text-sm text-gray-500 mb-4">
          This file type cannot be previewed directly. Please download the file to view it.
        </p>
        <a
          href={document.url}
          download
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Download className="h-4 w-4 mr-2" />
          Download File
        </a>
      </div>
    );
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 truncate max-w-lg">
            {document.name}
          </h3>
          <div className="flex items-center space-x-2">
            <a
              href={document.url}
              download
              className="text-gray-500 hover:text-gray-700 p-2"
              title="Download"
            >
              <Download className="h-5 w-5" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Document Content */}
        <div className="flex-1 overflow-auto relative">
          {renderContent()}
        </div>
        
        {/* Footer with Controls */}
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          {/* Page Controls (for PDFs) */}
          {document.type === 'application/pdf' && (
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handlePreviousPage}
                disabled={currentPage <= 1}
                className="p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous Page"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
                className="p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next Page"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
          
          {/* Image Controls */}
          {document.type.startsWith('image/') && (
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
                className="p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Zoom Out"
              >
                <ZoomOut className="h-5 w-5" />
              </button>
              <span className="text-sm text-gray-600">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoom >= 3}
                className="p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Zoom In"
              >
                <ZoomIn className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={handleRotate}
                className="p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                title="Rotate"
              >
                <RotateCw className="h-5 w-5" />
              </button>
            </div>
          )}
          
          {/* Metadata */}
          <div className="text-sm text-gray-500">
            {formatFileSize(document.size)} • {getFileTypeLabel(document.type)}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' '+ sizes[i];
};

const getFileTypeLabel = (fileType: string) => {
  if (fileType.startsWith('image/')) return 'Image';
  if (fileType.startsWith('video/')) return 'Video';
  if (fileType.startsWith('audio/')) return 'Audio';
  if (fileType.startsWith('application/pdf')) return 'PDF';
  if (fileType.includes('spreadsheet') || fileType.includes('excel')) return 'Spreadsheet';
  if (fileType.includes('word') || fileType.includes('document')) return 'Document';
  if (fileType.includes('zip') || fileType.includes('compressed')) return 'Archive';
  return 'File';
};

export default DocumentViewer;
