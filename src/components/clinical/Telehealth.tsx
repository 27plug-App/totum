import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Video,
  Mic,
  MicOff,
  VideoOff,
  Share,
  MessageSquare,
  Phone,
  Settings,
  Users,
  X,
  Calendar,
  User
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import LoadingSpinner from '../LoadingSpinner';
import { format } from 'date-fns';
import { z } from 'zod';

// Validation schema
const telehealthSessionSchema = z.object({
  appointment_id: z.string().uuid('Invalid appointment ID').optional(),
  client_id: z.string().uuid('Invalid client ID'),
  provider_id: z.string().uuid('Invalid provider ID'),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().optional().nullable(),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).default('scheduled'),
  meeting_url: z.string().min(1, 'Meeting URL is required')
});

type TelehealthSession = z.infer<typeof telehealthSessionSchema> & {
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

function Telehealth() {
  const { user } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const [activeSession, setActiveSession] = useState<TelehealthSession | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showNewSession, setShowNewSession] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [sessionDate, setSessionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [sessionTime, setSessionTime] = useState<string>('09:00');
  const [duration, setDuration] = useState<number>(60);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Query hooks
  /*const { data: sessions = [], loading, error, mutate } = useSupabaseQuery<TelehealthSession>({
    query: supabase
      .from('telehealth_sessions')
      .select(`
        *,
        client:clients(first_name, last_name),
        provider:users(first_name, last_name)
      `)
      .order('start_time', { ascending: true }),
    key: 'telehealth-sessions'
  });

  const { data: clients = [] } = useSupabaseQuery({
    query: supabase
      .from('clients')
      .select('id, first_name, last_name')
      .eq('status', 'active'),
    key: 'active-clients'
  });*/

  useEffect(() => {
    // Initialize WebRTC when session starts
    if (activeSession) {
      initializeWebRTC();
    }

    return () => {
      // Cleanup WebRTC when session ends
      cleanupWebRTC();
    };
  }, [activeSession]);

  const initializeWebRTC = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Initialize WebRTC peer connection here
      // This is a placeholder - actual WebRTC implementation would go here
    } catch (error) {
      showError('Failed to access camera and microphone');
    }
  };

  const cleanupWebRTC = () => {
    if (localVideoRef.current?.srcObject) {
      const tracks = (localVideoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const toggleAudio = () => {
    if (localVideoRef.current?.srcObject) {
      const audioTrack = (localVideoRef.current.srcObject as MediaStream)
        .getAudioTracks()[0];
      audioTrack.enabled = !audioEnabled;
      setAudioEnabled(!audioEnabled);
    }
  };

  const toggleVideo = () => {
    if (localVideoRef.current?.srcObject) {
      const videoTrack = (localVideoRef.current.srcObject as MediaStream)
        .getVideoTracks()[0];
      videoTrack.enabled = !videoEnabled;
      setVideoEnabled(!videoEnabled);
    }
  };

  const handleCreateSession = async () => {
    if (!selectedClient || !sessionDate || !sessionTime) {
      showError('Please fill in all required fields');
      return;
    }

    try {
      const startTime = new Date(`${sessionDate}T${sessionTime}`);
      const endTime = new Date(startTime.getTime() + duration * 60000);

      const validatedData = telehealthSessionSchema.parse({
        client_id: selectedClient,
        provider_id: user?.id,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: 'scheduled',
        meeting_url: `https://meet.totum.healthcare/${crypto.randomUUID()}`
      });

      const { data, error } = await supabase
        .from('telehealth_sessions')
        .insert([validatedData])
        .select(`
          *,
          client:clients(first_name, last_name),
          provider:users(first_name, last_name)
        `)
        .single();

      if (error) throw error;

      mutate(prev => [...(prev || []), data]);
      setShowNewSession(false);
      setSelectedClient('');
      setSessionDate(new Date().toISOString().split('T')[0]);
      setSessionTime('09:00');
      setDuration(60);
      showSuccess('Session scheduled successfully');
    } catch (error) {
      if (error instanceof z.ZodError) {
        showError(error.errors[0].message);
      } else {
        showError('Failed to schedule session');
      }
    }
  };

  const endCall = async () => {
    if (!activeSession) return;

    try {
      const { error } = await supabase
        .from('telehealth_sessions')
        .update({
          end_time: new Date().toISOString(),
          status: 'completed'
        })
        .eq('id', activeSession.id);

      if (error) throw error;

      cleanupWebRTC();
      setActiveSession(null);
      showSuccess('Call ended successfully');
    } catch (error) {
      showError('Failed to end call');
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
          <h3 className="text-lg font-medium text-gray-900">Error Loading Sessions</h3>
          <p className="text-gray-500">Please try again later</p>
        </div>
      </div>
    );
  }*/

  if (activeSession) {
    return (
      <div className="fixed inset-0 bg-black">
        <div className="h-full flex flex-col">
          {/* Video Area */}
          <div className="flex-1 relative">
            <video
              ref={remoteVideoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
            />
            <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden">
              <video
                ref={localVideoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
            </div>
          </div>

          {/* Controls */}
          <div className="bg-gray-900 p-4">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleAudio}
                  className={`p-3 rounded-full ${
                    audioEnabled ? 'bg-gray-700' : 'bg-red-600'
                  }`}
                >
                  {audioEnabled ? (
                    <Mic className="w-6 h-6 text-white" />
                  ) : (
                    <MicOff className="w-6 h-6 text-white" />
                  )}
                </button>
                <button
                  onClick={toggleVideo}
                  className={`p-3 rounded-full ${
                    videoEnabled ? 'bg-gray-700' : 'bg-red-600'
                  }`}
                >
                  {videoEnabled ? (
                    <Video className="w-6 h-6 text-white" />
                  ) : (
                    <VideoOff className="w-6 h-6 text-white" />
                  )}
                </button>
                <button className="p-3 rounded-full bg-gray-700">
                  <Share className="w-6 h-6 text-white" />
                </button>
                <button className="p-3 rounded-full bg-gray-700">
                  <MessageSquare className="w-6 h-6 text-white" />
                </button>
              </div>

              <button
                onClick={endCall}
                className="p-3 rounded-full bg-red-600 hover:bg-red-700"
              >
                <Phone className="w-6 h-6 text-white" />
              </button>

              <div className="flex items-center space-x-4">
                <button className="p-3 rounded-full bg-gray-700">
                  <Users className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={() => setShowSettings(true)}
                  className="p-3 rounded-full bg-gray-700"
                >
                  <Settings className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Telehealth</h1>
            <p className="text-gray-600">Manage virtual appointments and sessions</p>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowSettings(true)}
              className="btn btn-secondary"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </button>
            <button 
              onClick={() => setShowNewSession(true)}
              className="btn btn-primary"
            >
              <Video className="w-4 h-4 mr-2" />
              New Session
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/*sessions*/[].map((session) => (
          <div key={session.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {session.client.first_name} {session.client.last_name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {format(new Date(session.start_time), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                session.status === 'scheduled' 
                  ? 'bg-blue-100 text-blue-800'
                  : session.status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }` }>
                {session.status}
              </span>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button 
                className="btn btn-secondary"
                onClick={() => {/* Handle reschedule */}}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Reschedule
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => setActiveSession(session)}
                disabled={session.status !== 'scheduled'}
              >
                <Video className="w-4 h-4 mr-2" />
                Join Session
              </button>
            </div>
          </div>
        ))}
      </div> 

      {/* New Session Modal */}
      {showNewSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Schedule New Session</h2>
              <button
                onClick={() => setShowNewSession(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Client
                </label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                >
                  <option value="">Select client</option>
                  {/* clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.first_name} {client.last_name}
                    </option>
                  )) */}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Time
                </label>
                <input
                  type="time"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={sessionTime}
                  onChange={(e) => setSessionTime(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Duration (minutes)
                </label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                >
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                  <option value="90">90 minutes</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowNewSession(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSession}
                  disabled={!selectedClient || !sessionDate || !sessionTime}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Schedule Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Add settings options here */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Camera
                </label>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <option>Default Camera</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Microphone
                </label>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <option>Default Microphone</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Speaker
                </label>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <option>Default Speaker</option>
                </select>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Telehealth;

{/*


*/}