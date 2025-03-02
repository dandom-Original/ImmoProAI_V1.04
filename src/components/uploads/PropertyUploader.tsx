import React, { useState, useRef } from 'react'
import propertyFeatureExtractor from '../../services/PropertyFeatureExtractorService'

const PropertyUploader: React.FC = () => {
  const [dragActive, setDragActive] = useState(false)
  const [fileContent, setFileContent] = useState('')
  const [features, setFeatures] = useState<string[]>([])
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const processFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setFileContent(text)
      const extractedFeatures = propertyFeatureExtractor.extractFeatures(text)
      setFeatures(extractedFeatures)
    }
    reader.readAsText(file)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0])
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  // Erweiterung: Simuliert einen asynchronen Uploadvorgang mit Fortschrittsanzeige
  const simulateUpload = () => {
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  return (
    <div>
      <div
        className={`${dragActive ? 'border-blue-600' : 'border-gray-300'} border-dashed border-2 p-4 text-center cursor-pointer`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {dragActive ? <p>Drop here...</p> : <p>Drag &amp; drop a property document here, or click to select a file.</p>}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileSelect}
        accept=".txt,.pdf,.docx"
      />
      {fileContent && (
        <div className="mt-4">
          <h3 className="text-xl font-semibold">File Content Preview</h3>
          <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap">{fileContent}</pre>
          {features.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mt-2">Extracted Features</h3>
              <ul className="list-disc ml-5">
                {features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-4">
            <button
              onClick={simulateUpload}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              Simulate Upload
            </button>
            {uploadProgress > 0 && (
              <div className="mt-2">
                <progress value={uploadProgress} max="100" className="w-full"></progress>
                <p>{uploadProgress}%</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default PropertyUploader;
