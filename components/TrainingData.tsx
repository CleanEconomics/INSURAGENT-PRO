import React, { useState, useEffect } from 'react';
import {
  Upload,
  FileText,
  Folder,
  Search,
  Filter,
  X,
  Link as LinkIcon,
  Download,
  Trash2,
  Eye,
  Plus,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Tag,
} from 'lucide-react';

interface TrainingFile {
  id: string;
  fileName: string;
  mimeType: string;
  fileSize?: number;
  webViewLink?: string;
  thumbnailLink?: string;
  category: string;
  tags: string[];
  description?: string;
  usageCount: number;
  createdAt: string;
  isActive: boolean;
}

interface DriveConnectionStatus {
  connected: boolean;
  expired?: boolean;
  connectedAt?: string;
}

const TrainingData: React.FC = () => {
  const [trainingFiles, setTrainingFiles] = useState<TrainingFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [driveStatus, setDriveStatus] = useState<DriveConnectionStatus>({ connected: false });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState('knowledge_base');
  const [uploadTags, setUploadTags] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  const categories = [
    { value: 'all', label: 'All Files' },
    { value: 'scripts', label: 'Scripts' },
    { value: 'templates', label: 'Templates' },
    { value: 'knowledge_base', label: 'Knowledge Base' },
    { value: 'policies', label: 'Policies' },
    { value: 'procedures', label: 'Procedures' },
    { value: 'faqs', label: 'FAQs' },
  ];

  useEffect(() => {
    checkDriveConnection();
    if (driveStatus.connected) {
      fetchTrainingFiles();
    }
  }, []);

  const checkDriveConnection = async () => {
    try {
      const response = await fetch('/api/auth/google/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setDriveStatus(data);
    } catch (error) {
      console.error('Failed to check Drive connection:', error);
    }
  };

  const connectGoogleDrive = async () => {
    try {
      const response = await fetch('/api/auth/google/authorize', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();

      // Redirect to Google OAuth
      window.location.href = data.authUrl;
    } catch (error) {
      console.error('Failed to initiate Google auth:', error);
    }
  };

  const fetchTrainingFiles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      const response = await fetch(`/api/training-data?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setTrainingFiles(data);
    } catch (error) {
      console.error('Failed to fetch training files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('category', uploadCategory);
      formData.append('tags', JSON.stringify(uploadTags.split(',').map(t => t.trim())));
      formData.append('description', uploadDescription);

      const response = await fetch('/api/training-data/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (response.ok) {
        setShowUploadModal(false);
        setUploadFile(null);
        setUploadTags('');
        setUploadDescription('');
        fetchTrainingFiles();
      } else {
        alert('Failed to upload file');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const deleteTrainingFile = async (id: string) => {
    if (!confirm('Delete this training file? This will not delete it from Google Drive.')) return;

    try {
      const response = await fetch(`/api/training-data/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        fetchTrainingFiles();
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const filteredFiles = trainingFiles.filter(file => {
    const matchesSearch = file.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    return mb > 1 ? `${mb.toFixed(2)} MB` : `${(bytes / 1024).toFixed(2)} KB`;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      scripts: 'bg-blue-100 text-blue-800',
      templates: 'bg-green-100 text-green-800',
      knowledge_base: 'bg-purple-100 text-purple-800',
      policies: 'bg-yellow-100 text-yellow-800',
      procedures: 'bg-orange-100 text-orange-800',
      faqs: 'bg-pink-100 text-pink-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (!driveStatus.connected) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <LinkIcon className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Google Drive</h2>
            <p className="text-gray-600 mb-6">
              Connect your Google Drive to upload training materials, templates, and knowledge base documents
              for your AI Copilot.
            </p>
            <button
              onClick={connectGoogleDrive}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path fill="currentColor" d="M2 17l10 5 10-5"/>
                <path fill="currentColor" d="M2 12l10 5 10-5"/>
              </svg>
              Connect Google Drive
            </button>
            <div className="mt-6 text-sm text-gray-500">
              <ul className="space-y-2 text-left max-w-md mx-auto">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                  <span>Store training scripts and templates</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                  <span>Reference files in AI Copilot conversations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                  <span>Keep knowledge base always up-to-date</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Training Data</h1>
          <p className="text-gray-600 mt-1">Manage training materials and knowledge base for AI Copilot</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Upload File
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              fetchTrainingFiles();
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* File Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading training files...</p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No training files yet</h3>
          <p className="text-gray-600 mb-4">Upload your first training document to get started</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Upload File
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map(file => (
            <div key={file.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {file.thumbnailLink ? (
                    <img src={file.thumbnailLink} alt="" className="w-12 h-12 rounded object-cover" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                      <FileText className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{file.fileName}</h3>
                  <p className="text-sm text-gray-500 mt-1">{formatFileSize(file.fileSize)}</p>
                </div>
              </div>

              <div className="mt-3">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(file.category)}`}>
                  {file.category.replace('_', ' ')}
                </span>
              </div>

              {file.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {file.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                  {file.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">+{file.tags.length - 3}</span>
                  )}
                </div>
              )}

              {file.description && (
                <p className="mt-2 text-sm text-gray-600 line-clamp-2">{file.description}</p>
              )}

              <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between text-sm">
                <span className="text-gray-500">Used {file.usageCount} times</span>
                <div className="flex items-center gap-2">
                  {file.webViewLink && (
                    <a
                      href={file.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                      title="View in Drive"
                    >
                      <Eye className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => deleteTrainingFile(file.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Upload Training File</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFileUpload} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">File</label>
                <input
                  type="file"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  {categories.filter(c => c.value !== 'all').map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={uploadTags}
                  onChange={(e) => setUploadTags(e.target.value)}
                  placeholder="insurance, training, sales"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  rows={3}
                  placeholder="Brief description of this file..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  disabled={uploading || !uploadFile}
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingData;
