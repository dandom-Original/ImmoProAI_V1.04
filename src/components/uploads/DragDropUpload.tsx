import React, { useCallback, useState } from 'react';
    
    interface DragDropUploadProps {
      onFilesAdded: (files: FileList) => void;
    }
    
    const DragDropUpload: React.FC<DragDropUploadProps> = ({ onFilesAdded }) => {
      const [highlight, setHighlight] = useState(false);
    
      const openFileDialog = useCallback(() => {
        document.getElementById('fileInput')?.click();
      }, []);
    
      const onFilesAddedHandler = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
          if (e.target.files && e.target.files.length > 0) {
            onFilesAdded(e.target.files);
          }
        },
        [onFilesAdded]
      );
    
      const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setHighlight(true);
      };
    
      const onDragLeave = () => {
        setHighlight(false);
      };
    
      const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setHighlight(false);
        if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
          onFilesAdded(event.dataTransfer.files);
          event.dataTransfer.clearData();
        }
      };
    
      return (
        <div>
          <div
            className={\`border-2 border-dashed rounded-md p-6 text-center cursor-pointer \${highlight ? 'bg-gray-200' : ''}\`}
            onClick={openFileDialog}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            <p className="text-gray-600">Drag and drop files here, or click to select files</p>
          </div>
          <input
            id="fileInput"
            type="file"
            multiple
            style={{ display: 'none' }}
            onChange={onFilesAddedHandler}
          />
        </div>
      );
    };
    
    export default DragDropUpload;
