import React, { useState } from 'react'
import DragDropUpload from '../components/uploads/DragDropUpload'

const UploadsPage: React.FC = () => {
  const [files, setFiles] = useState<File[]>([])

  const handleFilesAdded = (fileList: FileList) => {
    const newFiles = Array.from(fileList)
    setFiles(prevFiles => [...prevFiles, ...newFiles])
    console.log('Files added:', newFiles)
    // Trigger upload process here if needed.
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Uploads</h1>
      <DragDropUpload onFilesAdded={handleFilesAdded} />
      {files.length > 0 && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Uploaded Files:</h2>
          <ul className="list-disc pl-5">
            {files.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default UploadsPage
