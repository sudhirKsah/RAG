import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { FileUpload } from '../components/FileUpload';
import {
  FileText,
  Upload,
  Search,
  Filter,
  MoreVertical,
  Download,
  Trash2,
  Eye,
  Calendar,
  FileCheck,
  RefreshCw,
} from 'lucide-react';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

interface Document {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  content_length?: number;
  chunk_count?: number;
  file_url?: string;
  status: 'processing' | 'processed' | 'failed';
  created_at: string;
  updated_at: string;
}

interface DocumentStats {
  total_documents: number;
  processed_documents: number;
  processing_documents: number;
  failed_documents: number;
  total_size: number;
  total_chunks: number;
}

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<DocumentStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
    fetchStats();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await api.getDocuments();
      if (response.ok) {
        const result = await response.json();
        setDocuments(result.data.documents);
      } else {
        throw new Error('Failed to fetch documents');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.getDocumentStats();
      if (response.ok) {
        const result = await response.json();
        setStats(result.data.stats);
      }
    } catch (error: any) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const response = await api.deleteDocument(id);
      if (response.ok) {
        setDocuments(prev => prev.filter(doc => doc.id !== id));
        toast.success('Document deleted successfully');
        fetchStats(); // Refresh stats
      } else {
        throw new Error('Failed to delete document');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete document');
    }
  };

  const handleReprocessDocument = async (id: string) => {
    try {
      const response = await api.reprocessDocument(id);
      if (response.ok) {
        toast.success('Document reprocessing started');
        fetchDocuments(); // Refresh documents
      } else {
        throw new Error('Failed to reprocess document');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to reprocess document');
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedFilter === 'all' || doc.status === selectedFilter)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed':
        return 'text-green-600 bg-green-50';
      case 'processing':
        return 'text-yellow-600 bg-yellow-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'docx':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'txt':
        return <FileText className="h-5 w-5 text-gray-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
            <p className="text-gray-600 mt-1">Manage your knowledge base and training documents</p>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Documents
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            className="bg-white p-6 rounded-xl border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Documents</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats?.total_documents || documents.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white p-6 rounded-xl border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Processed</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats?.processed_documents || documents.filter(d => d.status === 'processed').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <FileCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white p-6 rounded-xl border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Chunks</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats?.total_chunks || documents.reduce((sum, doc) => sum + (doc.chunk_count || 0), 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white p-6 rounded-xl border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Storage Used</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatFileSize(stats?.total_size || documents.reduce((sum, doc) => sum + doc.file_size, 0))}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <Upload className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="processed">Processed</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
              </select>
              <button 
                onClick={fetchDocuments}
                className="border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Documents Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Upload your first document to get started'
                }
              </p>
              {!searchTerm && selectedFilter === 'all' && (
                <button
                  onClick={() => setShowUpload(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Upload Documents
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">Document</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">Type</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">Size</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">Chunks</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">Status</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">Upload Date</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredDocuments.map((document, index) => (
                    <motion.tr
                      key={document.id}
                      className="hover:bg-gray-50 transition-colors"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          {getFileIcon(document.file_type)}
                          <div>
                            <p className="font-medium text-gray-900">{document.filename}</p>
                            <p className="text-sm text-gray-500">
                              {document.content_length ? `${document.content_length} characters` : 'Processing...'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-900 uppercase">{document.file_type}</td>
                      <td className="py-4 px-6 text-gray-900">{formatFileSize(document.file_size)}</td>
                      <td className="py-4 px-6 text-gray-900">{document.chunk_count || '-'}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(document.status)}`}>
                          {document.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-900">{formatDate(document.created_at)}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          {document.file_url && (
                            <a
                              href={document.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-blue-600 transition-colors"
                              title="View document"
                            >
                              <Eye className="h-4 w-4" />
                            </a>
                          )}
                          {document.status === 'failed' && (
                            <button
                              onClick={() => handleReprocessDocument(document.id)}
                              className="text-gray-400 hover:text-green-600 transition-colors"
                              title="Reprocess document"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteDocument(document.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete document"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Upload Modal */}
        {showUpload && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Upload Documents</h2>
                <button
                  onClick={() => setShowUpload(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <FileUpload 
                onClose={() => setShowUpload(false)} 
                onUploadComplete={() => {
                  fetchDocuments();
                  fetchStats();
                }}
              />
            </motion.div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};