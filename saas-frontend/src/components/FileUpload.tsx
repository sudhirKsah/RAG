import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Loader,
} from 'lucide-react';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

interface FileUploadProps {
  onClose: () => void;
  onUploadComplete?: () => void;
}

interface UploadedFile {
  file: File;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  id?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onClose, onUploadComplete }) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      status: 'uploading' as const,
      progress: 0,
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    setIsUploading(true);

    // Upload files one by one
    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i];
      
      try {
        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadedFiles(prev => {
            const updated = [...prev];
            const fileIndex = updated.findIndex(f => f.file.name === file.name);
            if (fileIndex !== -1 && updated[fileIndex].progress < 90) {
              updated[fileIndex].progress += 10;
            }
            return updated;
          });
        }, 200);

        const response = await api.uploadDocument(file);
        const result = await response.json();

        clearInterval(progressInterval);

        if (response.ok) {
          setUploadedFiles(prev => {
            const updated = [...prev];
            const fileIndex = updated.findIndex(f => f.file.name === file.name);
            if (fileIndex !== -1) {
              updated[fileIndex].status = 'success';
              updated[fileIndex].progress = 100;
              updated[fileIndex].id = result.data.id;
            }
            return updated;
          });
          toast.success(`${file.name} uploaded successfully!`);
        } else {
          throw new Error(result.message || 'Upload failed');
        }
      } catch (error: any) {
        setUploadedFiles(prev => {
          const updated = [...prev];
          const fileIndex = updated.findIndex(f => f.file.name === file.name);
          if (fileIndex !== -1) {
            updated[fileIndex].status = 'error';
            updated[fileIndex].error = error.message;
          }
          return updated;
        });
        toast.error(`Failed to upload ${file.name}: ${error.message}`);
      }
    }

    setIsUploading(false);
    if (onUploadComplete) {
      onUploadComplete();
    }
  }, [onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: isUploading,
  });

  const removeFile = (fileName: string) => {
    setUploadedFiles(prev => prev.filter(f => f.file.name !== fileName));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const allFilesProcessed = uploadedFiles.length > 0 && uploadedFiles.every(f => f.status !== 'uploading');
  const hasSuccessfulUploads = uploadedFiles.some(f => f.status === 'success');

  return (
    <div className="space-y-6">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : isUploading
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className={`mx-auto h-12 w-12 mb-4 ${isUploading ? 'text-gray-300' : 'text-gray-400'}`} />
        <p className={`text-lg font-medium mb-2 ${isUploading ? 'text-gray-400' : 'text-gray-900'}`}>
          {isDragActive ? 'Drop files here' : isUploading ? 'Uploading...' : 'Drag & drop files here'}
        </p>
        {!isUploading && (
          <>
            <p className="text-gray-600 mb-4">
              or click to browse files
            </p>
            <p className="text-sm text-gray-500">
              Supported formats: PDF, DOCX, TXT (max 10MB each)
            </p>
          </>
        )}
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900">Files</h3>
          {uploadedFiles.map((uploadFile, index) => (
            <motion.div
              key={uploadFile.file.name}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">{uploadFile.file.name}</p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(uploadFile.file.size)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {uploadFile.status === 'uploading' && (
                  <div className="flex items-center space-x-2">
                    <Loader className="h-4 w-4 animate-spin text-blue-600" />
                    <span className="text-sm text-gray-600">{uploadFile.progress}%</span>
                  </div>
                )}
                
                {uploadFile.status === 'success' && (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-green-600">Uploaded</span>
                  </div>
                )}
                
                {uploadFile.status === 'error' && (
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="text-sm text-red-600">Failed</span>
                  </div>
                )}
                
                {uploadFile.status !== 'uploading' && (
                  <button
                    onClick={() => removeFile(uploadFile.file.name)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {hasSuccessfulUploads ? 'Done' : 'Cancel'}
        </button>
        {!allFilesProcessed && uploadedFiles.length > 0 && (
          <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg">
            Processing documents...
          </div>
        )}
      </div>
    </div>
  );
};