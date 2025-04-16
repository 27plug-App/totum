import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Search, 
  Send, 
  User, 
  Plus,
  Paperclip,
  Image,
  Smile,
  MoreVertical,
  Check,
  CheckCheck,
  Clock,
  Archive,
  Star,
  Trash2,
  X
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import LoadingSpinner from './LoadingSpinner';
import { format, isToday, isYesterday } from 'date-fns';
import DOMPurify from 'dompurify';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  content: string;
  read: boolean;
  created_at: string;
  sender: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
  recipient: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  avatar_url?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count?: number;
}

function Messages() {
  const { user } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred'>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMessages();
    fetchContacts();
    // const subscription = subscribeToMessages();
    return () => {
      // subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /*const subscribeToMessages = () => {
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `recipient_id=eq.${user?.id}`
      }, payload => {
        handleNewMessage(payload.new as Message);
      })
      .subscribe();

    return subscription;
  };*/

  const handleNewMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
    showSuccess('New message received');
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey(first_name, last_name, avatar_url),
          recipient:users!messages_recipient_id_fkey(first_name, last_name, avatar_url)
        `)
        .or(`sender_id.eq.${user?.id},recipient_id.eq.${user?.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      showError('Failed to fetch messages');
    }
  };

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .neq('id', user?.id)
        .eq('status', 'active');

      if (error) throw error;

      // Add last message and unread count for each contact
      const contactsWithMeta = await Promise.all(
        data.map(async contact => {
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('*')
            .or(`sender_id.eq.${contact.id},recipient_id.eq.${contact.id}`)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact' })
            .eq('sender_id', contact.id)
            .eq('recipient_id', user?.id)
            .eq('read', false);

          return {
            ...contact,
            last_message: lastMessage?.content,
            last_message_time: lastMessage?.created_at,
            unread_count: unreadCount || 0
          };
        })
      );

      setContacts(contactsWithMeta);
      setLoading(false);
    } catch (error) {
      showError('Failed to fetch contacts');
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedContact || !newMessage.trim()) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          sender_id: user?.id,
          recipient_id: selectedContact.id,
          content: DOMPurify.sanitize(newMessage),
          read: false
        }])
        .select(`
          *,
          sender:users!messages_sender_id_fkey(first_name, last_name, avatar_url),
          recipient:users!messages_recipient_id_fkey(first_name, last_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      setMessages(prev => [data, ...prev]);
      setNewMessage('');
      showSuccess('Message sent successfully');
    } catch (error) {
      showError('Failed to send message');
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', messageId);

      if (error) throw error;
      fetchMessages();
    } catch (error) {
      showError('Failed to mark message as read');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      /*const { data, error } = await supabase.storage
        .from('message-attachments')
        .upload(`${Date.now()}-${file.name}`, file);

      if (error) throw error;

      // Add file URL to message
      const fileUrl = data.path;
      setNewMessage(prev => `${prev}\n[File: ${file.name}](${fileUrl})`);*/
    } catch (error) {
      showError('Failed to upload file');
    }
  };

  const formatMessageDate = (date: string) => {
    const messageDate = new Date(date);
    if (isToday(messageDate)) {
      return format(messageDate, 'h:mm a');
    } else if (isYesterday(messageDate)) {
      return 'Yesterday';
    }
    return format(messageDate, 'MMM d');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = 
      filter === 'all' ||
      (filter === 'unread' && contact.unread_count > 0);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-8">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600">HIPAA-compliant secure messaging</p>
          </div>
          <button
            onClick={() => setShowNewMessage(true)}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Message
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
        {/* Contacts List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search messages..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2 mt-4">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filter === 'all'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filter === 'unread'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Unread
              </button>
              <button
                onClick={() => setFilter('starred')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filter === 'starred'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Starred
              </button>
            </div>
          </div>

          <div className="overflow-y-auto h-[calc(100vh-16rem)]">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-200 ${
                  selectedContact?.id === contact.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {contact.avatar_url ? (
                      <img
                        src={contact.avatar_url}
                        alt={`${contact.first_name} ${contact.last_name}`}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {contact.first_name[0]}{contact.last_name[0]}
                        </span>
                      </div>
                    )}
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {contact.first_name} {contact.last_name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {contact.last_message || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {contact.last_message_time && 
                        formatMessageDate(contact.last_message_time)
                      }
                    </p>
                    {contact.unread_count > 0 && (
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-600 text-white text-xs font-medium rounded-full">
                        {contact.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message Thread */}
        <div className="md:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
          {selectedContact ? (
            <>
              {/* Contact Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center">
                  {selectedContact.avatar_url ? (
                    <img
                      src={selectedContact.avatar_url}
                      alt={`${selectedContact.first_name} ${selectedContact.last_name}`}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {selectedContact.first_name[0]}{selectedContact.last_name[0]}
                      </span>
                    </div>
                  )}
                  <div className="ml-3">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedContact.first_name} {selectedContact.last_name}
                    </h2>
                    <p className="text-sm text-gray-500">{selectedContact.role}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <Archive className="w-5 h-5 text-gray-500" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <Star className="w-5 h-5 text-gray-500" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <MoreVertical className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages
                  .filter(msg => 
                    (msg.sender_id === selectedContact.id && msg.recipient_id === user?.id) ||
                    (msg.sender_id === user?.id && msg.recipient_id === selectedContact.id)
                  )
                  .map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-4 ${
                          message.sender_id === user?.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </p>
                        <div className={`flex items-center justify-end mt-2 text-xs ${
                          message.sender_id === user?.id ? 'text-blue-200' : 'text-gray-500'
                        }`}>
                          {formatMessageDate(message.created_at)}
                          {message.sender_id === user?.id && (
                            <span className="ml-2">
                              {message.read ? (
                                <CheckCheck className="w-4 h-4" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-end space-x-4">
                  <div className="flex-1 bg-gray-100 rounded-lg p-2">
                    <textarea
                      placeholder="Type your message..."
                      className="w-full bg-transparent border-0 focus:ring-0 resize-none text-sm"
                      rows={3}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="p-2 hover:bg-gray-200 rounded-full"
                        >
                          <Paperclip className="w-5 h-5 text-gray-500" />
                        </button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                        <button className="p-2 hover:bg-gray-200 rounded-full">
                          <Image className="w-5 h-5 text-gray-500" />
                        </button>
                        <button className="p-2 hover:bg-gray-200 rounded-full">
                          <Smile className="w-5 h-5 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="btn btn-primary px-6"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">
                  Select a conversation
                </h3>
                <p className="text-gray-500">
                  Choose a contact to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Messages;