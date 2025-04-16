import React, { useState, useCallback } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Calendar,
  User,
  Clock,
  Edit,
  Trash2
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import LoadingSpinner from './LoadingSpinner';
import { format } from 'date-fns';
import { z } from 'zod';

// Validation schema
const clinicalNoteSchema = z.object({
  client_id: z.string().uuid('Invalid client ID'),
  provider_id: z.string().uuid('Invalid provider ID'),
  appointment_id: z.string().uuid('Invalid appointment ID').optional(),
  note_type: z.enum(['progress', 'assessment', 'treatment_plan', 'discharge']),
  content: z.object({
    subjective: z.string().min(1, 'Subjective notes are required'),
    objective: z.string().min(1, 'Objective notes are required'),
    assessment: z.string().min(1, 'Assessment notes are required'),
    plan: z.string().min(1, 'Plan notes are required')
  }),
  status: z.enum(['draft', 'completed', 'signed']).default('draft')
});

type ClinicalNote = z.infer<typeof clinicalNoteSchema> & {
  id: string;
  created_at: string;
  updated_at: string;
  client: {
    first_name: string;
    last_name: string;
  };
  provider: {
    first_name: string;
    last_name: string;
  };
};

function ClinicalNotes() {
  const { user, hasPermission } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showNewNote, setShowNewNote] = useState<boolean>(false);
  const [selectedNote, setSelectedNote] = useState<ClinicalNote | null>(null);

  const [newNote, setNewNote] = useState<Partial<ClinicalNote>>({
    client_id: '',
    note_type: 'progress',
    content: {
      subjective: '',
      objective: '',
      assessment: '',
      plan: ''
    }
  });

  // Query hooks
  /*const { data: notes = [], loading, error, mutate } = useSupabaseQuery<ClinicalNote>({
    query: supabase
      .from('clinical_notes')
      .select(`
        *,
        client:clients(first_name, last_name),
        provider:users(first_name, last_name)
      `)
      .order('created_at', { ascending: false }),
    key: 'clinical-notes'
  });

  const { data: clients = [] } = useSupabaseQuery({
    query: supabase
      .from('clients')
      .select('id, first_name, last_name')
      .eq('status', 'active'),
    key: 'active-clients'
  });*/

  const handleSaveNote = async () => {
    try {
      const validatedData = clinicalNoteSchema.parse({
        ...newNote,
        provider_id: user?.id,
        status: 'draft'
      });

      const { data, error } = await supabase
        .from('clinical_notes')
        .insert([validatedData])
        .select(`
          *,
          client:clients(first_name, last_name),
          provider:users(first_name, last_name)
        `)
        .single();

      if (error) throw error;

      mutate(prev => [data, ...(prev || [])]);
      setShowNewNote(false);
      setNewNote({
        client_id: '',
        note_type: 'progress',
        content: { subjective: '', objective: '', assessment: '', plan: '' }
      });
      showSuccess('Clinical note created successfully');
    } catch (error) {
      if (error instanceof z.ZodError) {
        showError(error.errors[0].message);
      } else {
        showError('Failed to create clinical note');
      }
    }
  };

  const handleUpdateNote = async (note: ClinicalNote) => {
    try {
      const validatedData = clinicalNoteSchema.parse({
        ...note,
        provider_id: note.provider_id
      });

      const { data, error } = await supabase
        .from('clinical_notes')
        .update(validatedData)
        .eq('id', note.id)
        .select(`
          *,
          client:clients(first_name, last_name),
          provider:users(first_name, last_name)
        `)
        .single();

      if (error) throw error;

      mutate(prev => 
        prev?.map(n => n.id === note.id ? data : n) ?? []
      );
      setSelectedNote(null);
      showSuccess('Clinical note updated successfully');
    } catch (error) {
      if (error instanceof z.ZodError) {
        showError(error.errors[0].message);
      } else {
        showError('Failed to update clinical note');
      }
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('clinical_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      mutate(prev => prev?.filter(note => note.id !== noteId) ?? []);
      showSuccess('Clinical note deleted successfully');
    } catch (error) {
      showError('Failed to delete clinical note');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'signed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'signed':
        return FileText;
      default:
        return Clock;
    }
  };

  /*if (loading) {
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
          <h3 className="text-lg font-medium text-gray-900">Error Loading Notes</h3>
          <p className="text-gray-500">Please try again later</p>
        </div>
      </div>
    );
  }*/

  /*const filteredNotes = notes.filter(note => {
    const matchesSearch = 
      note.client.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.client.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.subjective.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || note.note_type === selectedType;
    
    return matchesSearch && matchesType;
  });*/

  return (
    <div className="p-8">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clinical Notes</h1>
            <p className="text-gray-600">Manage clinical documentation</p>
          </div>
          {hasPermission('manage_clinical') && (
            <button
              onClick={() => setShowNewNote(true)}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Note
            </button>
          )}
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search notes..."
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
              <option value="progress">Progress Notes</option>
              <option value="assessment">Assessments</option>
              <option value="treatment_plan">Treatment Plans</option>
              <option value="discharge">Discharge Summaries</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notes List */}
      <div className="space-y-6">
        {/*filteredNotes*/[].map((note) => {
          const StatusIcon = getStatusIcon(note.status);
          return (
            <div key={note.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {note.client.first_name} {note.client.last_name}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {format(new Date(note.created_at), 'MMM d, yyyy')}
                      <span className="mx-2">•</span>
                      <span className="capitalize">{note.note_type.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getStatusColor(note.status)}`}>
                    <StatusIcon className="w-4 h-4 mr-1" />
                    {note.status.charAt(0).toUpperCase() + note.status.slice(1)}
                  </span>
                  {hasPermission('manage_clinical') && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedNote(note)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-2 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Subjective</h4>
                  <p className="mt-1 text-sm text-gray-600">{note.content.subjective}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Objective</h4>
                  <p className="mt-1 text-sm text-gray-600">{note.content.objective}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Assessment</h4>
                  <p className="mt-1 text-sm text-gray-600">{note.content.assessment}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Plan</h4>
                  <p className="mt-1 text-sm text-gray-600">{note.content.plan}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Note Form Modal */}
      {(showNewNote || selectedNote) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6">
              {selectedNote ? 'Edit Clinical Note' : 'New Clinical Note'}
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Client
                  </label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={selectedNote?.client_id ?? newNote.client_id}
                    onChange={(e) => {
                      if (selectedNote) {
                        setSelectedNote({ ...selectedNote, client_id: e.target.value });
                      } else {
                        setNewNote({ ...newNote, client_id: e.target.value });
                      }
                    }}
                    disabled={!!selectedNote}
                  >
                    <option value="">Select client</option>
                    {/* clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.first_name} {client.last_name}
                      </option>
                    )) */}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Note Type
                  </label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={selectedNote?.note_type ?? newNote.note_type}
                    onChange={(e) => {
                      const value = e.target.value as ClinicalNote['note_type'];
                      if (selectedNote) {
                        setSelectedNote({ ...selectedNote, note_type: value });
                      } else {
                        setNewNote({ ...newNote, note_type: value });
                      }
                    }}
                  >
                    <option value="progress">Progress Note</option>
                    <option value="assessment">Assessment</option>
                    <option value="treatment_plan">Treatment Plan</option>
                    <option value="discharge">Discharge Summary</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Subjective
                </label>
                <textarea
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                  value={selectedNote?.content.subjective ?? newNote.content.subjective}
                  onChange={(e) => {
                    if (selectedNote) {
                      setSelectedNote({
                        ...selectedNote,
                        content: { ...selectedNote.content, subjective: e.target.value }
                      });
                    } else {
                      setNewNote({
                        ...newNote,
                        content: { ...newNote.content, subjective: e.target.value }
                      });
                    }
                  }}
                  placeholder="Patient's reported symptoms, concerns, and progress..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Objective
                </label>
                <textarea
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                  value={selectedNote?.content.objective ?? newNote.content.objective}
                  onChange={(e) => {
                    if (selectedNote) {
                      setSelectedNote({
                        ...selectedNote,
                        content: { ...selectedNote.content, objective: e.target.value }
                      });
                    } else {
                      setNewNote({
                        ...newNote,
                        content: { ...newNote.content, objective: e.target.value }
                      });
                    }
                  }}
                  placeholder="Observable behaviors, measurements, and data..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Assessment
                </label>
                <textarea
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                  value={selectedNote?.content.assessment ?? newNote.content.assessment}
                  onChange={(e) => {
                    if (selectedNote) {
                      setSelectedNote({
                        ...selectedNote,
                        content: { ...selectedNote.content, assessment: e.target.value }
                      });
                    } else {
                      setNewNote({
                        ...newNote,
                        content: { ...newNote.content, assessment: e.target.value }
                      });
                    }
                  }}
                  placeholder="Clinical interpretation and analysis..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Plan
                </label>
                <textarea
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                  value={selectedNote?.content.plan ?? newNote.content.plan}
                  onChange={(e) => {
                    if (selectedNote) {
                      setSelectedNote({
                        ...selectedNote,
                        content: { ...selectedNote.content, plan: e.target.value }
                      });
                    } else {
                      setNewNote({
                        ...newNote,
                        content: { ...newNote.content, plan: e.target.value }
                      });
                    }
                  }}
                  placeholder="Treatment plan and next steps..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowNewNote(false);
                    setSelectedNote(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={selectedNote ? () => handleUpdateNote(selectedNote) : handleSaveNote}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {selectedNote ? 'Update Note' : 'Save Note'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClinicalNotes;