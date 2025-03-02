import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, File, FileText, Image, Film, Music, Archive, Database, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export interface FileWithMetadata extends File {
  preview?: string;
  id?: string;
  progress?: number;
  error?: string;
}

interface DocumentUploaderProps {
  entityType: string;
  entityId: string;
  onUploadComplete?: (files: any[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  acceptedFileTypes?: string[];
  className?: string;
}

export default function DocumentUploader({
  entityType,
  entityId,
  onUploadComplete,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB default
  acceptedFileTypes,
  className
}: DocumentUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Check if adding these files would exceed the max files limit
    if (files.length + acceptedFiles.length > maxFiles) {
      alert(`You can only upload a maximum of ${maxFiles} files.`);
      return;
    }
    
    // Filter out files that are too large
    const validFiles = acceptedFiles.filter(file => file.size <= maxSize);
    const invalidFiles = acceptedFiles.filter(file => file.size > maxSize);
    
    if (invalidFiles.length > 0) {
      alert(`Some files were too large and were not added. Maximum file size is ${maxSize / (1024 * 1024)}MB.`);
    }
    
    setFiles(prev => [...prev, ...validFiles]);
  }, [files, maxFiles, maxSize]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept: acceptedFileTypes ? 
      acceptedFileTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}) : 
      undefined
  });
  
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const getFileIcon = (file: File) => {
    const type = file.type;
    
    if (type.startsWith('image/')) return <Image className="h-6 w-6 text-blue-500" />;
    if (type.startsWith('video/')) return <Film className="h-6 w-6 text-purple-500" />;
    if (type.startsWith('audio/')) return <Music className="h-6 w-6 text-green-500" />;
    if (type.includes('pdf')) return <FileText className="h-6 w-6 text-red-500" />;
    if (type.includes('zip') || type.includes('rar') || type.includes('tar')) 
      return <Archive className="h-6 w-6 text-yellow-500" />;
    if (type.includes('csv') || type.includes('excel') || type.includes('spreadsheet')) 
      return <Database className="h-6 w-6 text-green-500" />;
    
    return <File className="h-6 w-6 text-gray-500" />;
  };
  
  const uploadFiles = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    const uploadedDocs: any[] = [];
    const errors: Record<string, string> = {};
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileId = `file-${i}`;
      
      try {
        // Create a unique file path
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${entityType}/${entityId}/${fileName}`;
        
        // Upload file to storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
            onUploadProgress: (progress) => {
              setUploadProgress(prev => ({
                ...prev,
                [fileId]: Math.round((progress.loaded / progress.total) * 100)
              }));
            }
          });
        
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath);
        
        // Create document record in database
        const { data: docData, error: docError } = await supabase
          .from('documents')
          .insert({
            entity_type: entityType,
            entity_id: entityId,
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            file_path: filePath,
            public_url: publicUrlData?.publicUrl || '',
            uploaded_by: (await supabase.auth.getUser()).data.user?.id || null
          })
          .select()
          .single();
        
        if (docError) throw docError;
        
        uploadedDocs.push(docData);
      } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error);
        errors[fileId] = error instanceof Error ? error.message : 'Upload failed';
      }
    }
    
    setUploadErrors(errors);
    setUploadedFiles(uploadedDocs);
    
    if (Object.keys(errors).length === 0) {
      // All uploads successful
      setFiles([]);
      setUploadProgress({});
      
      if (onUploadComplete) {
        onUploadComplete(uploadedDocs);
      }
    }
    
    setUploading(false);
  };
  
  return (
    <div className={className}>
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} ref={fileInputRef} />
        <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">
          {isDragActive ? 
            'Drop the files here...' : 
            'Drag & drop files here, or click to select files'
          }
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Max {maxFiles} files, up to {maxSize / (1024 * 1024)}MB each
        </p>
        {acceptedFileTypes && (
          <p className="text-xs text-gray-500 mt-1">
            Accepted file types: {acceptedFileTypes.join(', ')}
          </p>
        )}
      </div>
      
      {files.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Files</h3>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                <div className="flex items-center">
                  {getFileIcon(file)}
                  <span className="ml-2 text-sm text-gray-700 truncate max-w-xs">{file.name}</span>
                  <span className="ml-2 text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                
                <div className="flex items-center">
                  {uploading && uploadProgress[`file-${index}`] !== undefined && (
                    <div className="mr-2 w-16 bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-blue-600 h-1.5 rounded-full" 
                        style={{ width: `${uploadProgress[`file-${index}`]}%` }}
                      ></div>
                    </div>
                  )}
                  
                  {uploadErrors[`file-${index}`] && (
                    <AlertCircle className="h-4 w-4 text-red-500 mr-2" title={uploadErrors[`file-${index}`]} />
                  )}
                  
                  <button 
                    type="button"
                    onClick={() => removeFile(index)}
                    disabled={uploading}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={uploadFiles}
              disabled={uploading || files.length === 0}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload {files.length} {files.length === 1 ? 'file' : 'files'}
                </>
              )}
            </button>
          </div>
        </div>
      )}
      
      {uploadedFiles.length > 0 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-700">
            Successfully uploaded {uploadedFiles.length} {uploadedFiles.length === 1 ? 'file' : 'files'}.
          </p>
        </div>
      )}
    </div>
  );
}
