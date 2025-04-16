import React, { useState, useCallback, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  Folder, 
  Search, 
  Download, 
  Trash2, 
  MoreVertical,
  Plus,
  X,
  Calendar,
  User,
  File
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import LoadingSpinner from './LoadingSpinner';
import { format } from 'date-fns';
import { z } from 'zod';

// Validation schemas
const folderSchema = z.object({
  name: z.string().min(1, 'Folder name is required'),
  parent_id: z.string().uuid('Invalid parent folder ID').optional().nullable(),
  status: z.enum(['active', 'archived']).default('active')
});

const documentSchema = z.object({
  title: z.string().min(1, 'Document title is required'),
  type: z.string().min(1, 'Document type is required'),
  client_id: z.string().uuid('Invalid client ID').optional().nullable(),
  provider_id: z.string().uuid('Invalid provider ID'),
  folder_id: z.string().uuid('Invalid folder ID').optional().nullable(),
  file_path: z.string().min(1, 'File path is required'),
  status: z.enum(['active', 'archived']).default('active')
});

type Folder = z.infer<typeof folderSchema> & {
  id: string;
  created_at: string;
  updated_at: string;
};

type Document = z.infer<typeof documentSchema> & {
  id: string;
  created_at: string;
  updated_at: string;
  client?: {
    first_name: string;
    last_name: string;
  };
  provider: {
    first_name: string;
    last_name: string;
  };
};

function Documents() {
  const { user } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [showNewFolder, setShowNewFolder] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Query hooks
  /*const { data: documents = [], loading, error, mutate } = useSupabaseQuery<Document>({
    query: supabase
      .from('documents')
      .select(`
        *,
        client:clients(first_name, last_name),
        provider:users(first_name, last_name)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false }),
    key: 'documents'
  });

  const { data: folders = [], mutate: mutateFolders } = useSupabaseQuery<Folder>({
    query: supabase
      .from('folders')
      .select('*')
      .eq('status', 'active')
      .order('name'),
    key: 'folders'
  });

  const { data: clients = [] } = useSupabaseQuery({
    query: supabase
      .from('clients')
      .select('id, first_name, last_name')
      .eq('status', 'active'),
    key: 'active-clients'
  });*/

  /*const handleCreateFolder = async () => {
    try {
      const validatedData = folderSchema.parse({
        name: newFolderName,
        parent_id: currentFolder,
        status: 'active'
      });

      const { data, error } = await supabase
        .from('folders')
        .insert([validatedData])
        .select()
        .single();

      if (error) throw error;

      mutateFolders(prev => [...(prev || []), data]);
      setShowNewFolder(false);
      setNewFolderName('');
      showSuccess('Folder created successfully');
    } catch (error) {
      if (error instanceof z.ZodError) {
        showError(error.errors[0].message);
      } else {
        showError('Failed to create folder');
      }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(`${Date.now()}-${file.name}`, file);

      if (uploadError) throw uploadError;

      // Create document record
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .insert([{
          title: file.name,
          type: file.type,
          provider_id: user?.id,
          folder_id: currentFolder,
          file_path: uploadData.path,
          status: 'active'
        }])
        .select(`
          *,
          client:clients(first_name, last_name),
          provider:users(first_name, last_name)
        `)
        .single();

      if (docError) throw docError;

      mutate(prev => [docData, ...(prev || [])]);
      showSuccess('Document uploaded successfully');
    } catch (error) {
      showError('Failed to upload document');
    }
  };

  const handleDownload = async (document: Document) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(document.file_path);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = document.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      showError('Failed to download document');
    }
  };

  const handleDelete = async (document: Document) => {
    try {
      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.file_path]);

      if (storageError) throw storageError;

      // Delete document record
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', document.id);

      if (dbError) throw dbError;

      mutate(prev => prev?.filter(doc => doc.id !== document.id) ?? []);
      showSuccess('Document deleted successfully');
    } catch (error) {
      showError('Failed to delete document');
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    try {
      // Check if folder is empty
      const { data: docs, error: checkError } = await supabase
        .from('documents')
        .select('id')
        .eq('folder_id', folderId)
        .limit(1);

      if (checkError) throw checkError;

      if (docs && docs.length > 0) {
        showError('Cannot delete folder that contains documents');
        return;
      }

      const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', folderId);

      if (error) throw error;

      mutateFolders(prev => prev?.filter(folder => folder.id !== folderId) ?? []);
      showSuccess('Folder deleted successfully');
    } catch (error) {
      showError('Failed to delete folder');
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.client?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.client?.last_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || doc.type === selectedType;
    const matchesFolder = !currentFolder || doc.folder_id === currentFolder;
    
    return matchesSearch && matchesType && matchesFolder;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Error Loading Documents</h3>
          <p className="text-gray-500">Please try again later</p>
        </div>
      </div>
    );
  }*/

  return (
    <div className="p-8">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
            <p className="text-gray-600">Manage and organize your files</p>
          </div>
          <div className="flex space-x-4">
            <button 
              onClick={() => setShowNewFolder(true)}
              className="btn btn-secondary"
            >
              <Folder className="w-4 h-4 mr-2" />
              New Folder
            </button>
            <label className="btn btn-primary cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Upload Files
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={/*handleFileUpload*/() => {}}
                accept=".pdf,.doc,.docx,.txt"
              />
            </label>
          </div>
        </div>
      </header>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Filters */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search documents..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="application/pdf">PDF</option>
              <option value="application/msword">Word</option>
              <option value="text/plain">Text</option>
            </select>
          </div>
        </div>

        {/* Folder Navigation */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentFolder(null)}
              className={`px-3 py-1 rounded-lg ${
                !currentFolder ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
              }`}
            >
              All Files
            </button>
            {/*folders*/[].map(folder => (
              <button
                key={folder.id}
                onClick={() => setCurrentFolder(folder.id)}
                className={`px-3 py-1 rounded-lg flex items-center ${
                  currentFolder === folder.id ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
                }`}
              >
                <Folder className="w-4 h-4 mr-1" />
                {folder.name}
              </button>
            ))}
          </div>
        </div>

        {/* Documents List */}
        <div className="divide-y divide-gray-200">
          {/*filteredDocuments*/[].map((doc) => (
            <div key={doc.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">{doc.title}</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {format(new Date(doc.created_at), 'MMM d, yyyy')}
                      {doc.client && (
                        <>
                          <span className="mx-2">•</span>
                          <User className="w-4 h-4 mr-1" />
                          {doc.client.first_name} {doc.client.last_name}
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDownload(doc)}
                    className="p-2 text-gray-400 hover:text-blue-600"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(doc)}
                    className="p-2 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Folder Modal */}
      {showNewFolder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">New Folder</h2>
              <button
                onClick={() => setShowNewFolder(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Folder Name
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Enter folder name"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowNewFolder(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={/*handleCreateFolder */() => {}}
                  disabled={!newFolderName.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Folder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Documents;