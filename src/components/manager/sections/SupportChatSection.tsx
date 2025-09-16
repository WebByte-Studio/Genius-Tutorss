'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Search, 
  Send, 
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  Shield
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Permission {
  [key: string]: boolean;
}

interface ChatContact {
  id: string;
  name: string;
  email: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: 'online' | 'offline' | 'away';
}

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
  isFromUser: boolean;
}

interface SupportChatSectionProps {
  permissions: Permission;
}

export function SupportChatSection({ permissions }: SupportChatSectionProps) {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch chat contacts based on permissions
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        const mockContacts: ChatContact[] = [
          {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            lastMessage: 'I need help with my account',
            lastMessageTime: '2 minutes ago',
            unreadCount: 2,
            status: 'online'
          },
          {
            id: '2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            lastMessage: 'Thank you for the help!',
            lastMessageTime: '1 hour ago',
            unreadCount: 0,
            status: 'offline'
          },
          {
            id: '3',
            name: 'Bob Johnson',
            email: 'bob@example.com',
            lastMessage: 'How do I reset my password?',
            lastMessageTime: '3 hours ago',
            unreadCount: 1,
            status: 'away'
          }
        ];
        setContacts(mockContacts);
      } catch (error) {
        console.error('Error fetching contacts:', error);
        toast({
          title: 'Error',
          description: 'Failed to load support contacts',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    if (permissions['support.view']) {
      fetchContacts();
    }
  }, [permissions, toast]);

  // Fetch messages for selected contact
  useEffect(() => {
    if (selectedContact) {
      const fetchMessages = async () => {
        // TODO: Replace with actual API call
        const mockMessages: ChatMessage[] = [
          {
            id: '1',
            sender: selectedContact.name,
            message: 'Hello, I need help with my account',
            timestamp: '2 minutes ago',
            isFromUser: true
          },
          {
            id: '2',
            sender: 'Support Agent',
            message: 'Hello! I\'d be happy to help you. What seems to be the issue?',
            timestamp: '1 minute ago',
            isFromUser: false
          },
          {
            id: '3',
            sender: selectedContact.name,
            message: 'I can\'t log in to my account',
            timestamp: 'Just now',
            isFromUser: true
          }
        ];
        setMessages(mockMessages);
      };

      fetchMessages();
    }
  }, [selectedContact]);

  // Filter contacts based on search
  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle sending message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return;

    if (!permissions['support.create']) {
      toast({
        title: 'Access Denied',
        description: 'You don\'t have permission to send messages',
        variant: 'destructive'
      });
      return;
    }

    try {
      const message: ChatMessage = {
        id: Date.now().toString(),
        sender: 'Support Agent',
        message: newMessage,
        timestamp: 'Just now',
        isFromUser: false
      };

      setMessages(prev => [...prev, message]);
      setNewMessage('');

      // Update contact's last message
      setContacts(prev => prev.map(contact =>
        contact.id === selectedContact.id
          ? { ...contact, lastMessage: newMessage, lastMessageTime: 'Just now', unreadCount: 0 }
          : contact
      ));

      toast({
        title: 'Success',
        description: 'Message sent successfully',
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      });
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (!permissions['support.view']) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Shield className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">Access Denied</h3>
        <p className="text-gray-500 text-center">
          You don't have permission to view support chat.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Support Chat</h2>
          <p className="text-gray-600">
            Handle customer support inquiries. You have {permissions['support.create'] ? 'reply' : 'view'} permissions.
          </p>
        </div>
        <Badge variant="outline">
          {contacts.filter(c => c.unreadCount > 0).length} unread conversations
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Contacts List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1 max-h-[500px] overflow-y-auto">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 border-l-4 transition-colors ${
                    selectedContact?.id === contact.id
                      ? 'bg-green-50 border-l-green-500'
                      : 'border-l-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(contact.status)} rounded-full border-2 border-white`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-sm truncate">{contact.name}</h3>
                        <span className="text-xs text-gray-500">{contact.lastMessageTime}</span>
                      </div>
                      <p className="text-xs text-gray-600 truncate">{contact.lastMessage}</p>
                      {contact.unreadCount > 0 && (
                        <Badge variant="default" className="text-xs mt-1">
                          {contact.unreadCount} new
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-2 flex flex-col">
          {selectedContact ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(selectedContact.status)} rounded-full border-2 border-white`} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{selectedContact.name}</h3>
                      <p className="text-sm text-gray-500">{selectedContact.email}</p>
                    </div>
                  </div>
                  <Badge variant={selectedContact.status === 'online' ? 'default' : 'secondary'}>
                    {selectedContact.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0 flex flex-col">
                {/* Messages */}
                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isFromUser ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.isFromUser
                            ? 'bg-gray-100 text-gray-900'
                            : 'bg-green-600 text-white'
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        <p className={`text-xs mt-1 ${message.isFromUser ? 'text-gray-500' : 'text-green-100'}`}>
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Message Input */}
                {permissions['support.create'] && (
                  <div className="p-4 border-t">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="flex-1"
                      />
                      <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Select a conversation to start chatting</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
