'use client';

/**
 * EnhancedStudentSupport Component
 * 
 * This component provides a chat interface for students and tutors to communicate
 * exclusively with administrators. It ensures that:
 * - Students and tutors can only chat with admins
 * - No direct communication between students/tutors is possible
 * - All conversations are admin-moderated for support purposes
 */

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Send, Phone, Video, MoreVertical, Search, Plus, UserPlus, Circle, Clock, CheckCheck, ChevronLeft, RefreshCw, Users, X } from "lucide-react";
import { API_BASE_URL } from "@/config/api";

interface ChatMessage {
  id: string;
  sender_id: string; // User ID (student/tutor) or admin ID
  sender_name: string; // User name or admin name
  sender_role: string; // User role (student/tutor) or admin role
  message: string; // Message content
  message_type: string; // Message type (text, etc.)
  created_at: string; // Message creation timestamp
  is_read: boolean; // Whether message has been read
}

interface ChatContact {
  id: string; // Admin conversation ID
  name: string; // Admin conversation name
  type: string; // Always 'direct' for admin conversations
  last_message?: string; // Last message in admin conversation
  unread_count: number; // Unread messages from admin
  created_at: string; // Conversation creation timestamp
  updated_at: string; // Last message timestamp
}

interface AdminUser {
  id: string; // Admin user ID
  full_name: string; // Admin full name
  email: string; // Admin email address
  role: string; // Admin role (admin, super_admin, manager)
  avatar_url?: string; // Admin avatar image URL
  status: string; // Admin account status (active, etc.)
  created_at: string; // Admin account creation timestamp
}

interface EnhancedStudentSupportProps {
  selectedChat: string | null; // Admin conversation ID
  setSelectedChat: (chatId: string | null) => void; // Set admin conversation ID
  newMessage: string; // Message to send to admin
  setNewMessage: (message: string) => void; // Set message for admin
}

export function EnhancedStudentSupport({
  selectedChat, // Currently selected admin conversation
  setSelectedChat, // Function to select admin conversation
  newMessage, // Message to send to admin
  setNewMessage // Function to set message for admin
}: EnhancedStudentSupportProps) {
  const { toast } = useToast(); // For admin conversation notifications
  const messagesEndRef = useRef<HTMLDivElement>(null); // For admin conversations only
  
  // State for admin display functionality (admin-only communication)
  const [showAdminListDialog, setShowAdminListDialog] = useState(false);
  const [adminSearchTerm, setAdminSearchTerm] = useState('');
  const [adminSearchResults, setAdminSearchResults] = useState<AdminUser[]>([]);
  const [isSearchingAdmins, setIsSearchingAdmins] = useState(false);
  
  // State for messaging (admin conversations only)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatContacts, setChatContacts] = useState<ChatContact[]>([]);
  const [chatMessages, setChatMessages] = useState<{[key: string]: ChatMessage[]}>({});
  const [allAdmins, setAllAdmins] = useState<AdminUser[]>([]);

  // State for contact filtering (admin conversations only)
  const [contactSearchTerm, setContactSearchTerm] = useState('');

  // Scroll to bottom when messages change (admin conversations only)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, selectedChat]);

  // Load chats on component mount and set up auto-refresh (only admin conversations)
  useEffect(() => {
    loadStudentChats();
    loadAllAdmins();
    
    // Set up auto-refresh for chat list every 10 seconds
    const chatListInterval = setInterval(() => {
      loadStudentChats();
      loadAllAdmins();
    }, 10000);
    
    return () => {
      clearInterval(chatListInterval);
    };
  }, []);

  // Load messages when chat is selected and set up auto-refresh (admin conversations only)
  useEffect(() => {
    if (selectedChat) {
      loadChatMessages(selectedChat);
      
      // Set up auto-refresh for messages every 3 seconds when chat is active
      const messagesInterval = setInterval(() => {
        loadChatMessages(selectedChat);
      }, 3000);
      
      return () => {
        clearInterval(messagesInterval);
      };
    }
  }, [selectedChat]);

  // Search admins when search term changes (admin-only communication)
  useEffect(() => {
    if (adminSearchTerm.length >= 2) {
      searchAdmins();
    } else {
      setAdminSearchResults([]);
    }
  }, [adminSearchTerm]);

  // Function to load all admin users (only admins can be contacted by students/tutors)
  const loadAllAdmins = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/support-messaging/admins`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAllAdmins(data.data || []);
      }
    } catch (error) {
      console.error('Error loading admins:', error);
    }
  };

  // Function to load student/tutor chats (only with admins)
  const loadStudentChats = async () => {
    try {
      setIsChatLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/support-messaging/chats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const formattedContacts = data.data?.map((chat: any) => ({
          id: chat.id,
          name: chat.name,
          type: chat.type,
          last_message: chat.last_message || 'No messages yet',
          unread_count: chat.unread_count || 0,
          created_at: chat.created_at,
          updated_at: chat.updated_at
        })) || [];
        
        setChatContacts(formattedContacts);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Function to load messages for a specific chat
  const loadChatMessages = async (chatId: string) => {
    try {
      setIsLoadingMessages(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/support-messaging/chats/${chatId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const formattedMessages = data.data?.messages?.map((msg: any) => ({
          id: msg.id,
          sender_id: msg.sender_id,
          sender_name: msg.sender_name,
          sender_role: msg.sender_role,
          message: msg.message,
          message_type: msg.message_type,
          created_at: msg.created_at,
          is_read: msg.is_read
        })) || [];
        
        setChatMessages(prev => ({
          ...prev,
          [chatId]: formattedMessages
        }));
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Function to search admins (only admins can be contacted by students/tutors)
  const searchAdmins = async () => {
    try {
      setIsSearchingAdmins(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        search: adminSearchTerm,
        limit: '10'
      });

      const response = await fetch(`${API_BASE_URL}/support-messaging/admins?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAdminSearchResults(data.data || []);
      }
    } catch (error) {
      console.error('Error searching admins:', error);
    } finally {
      setIsSearchingAdmins(false);
    }
  };

  // Function to start chat with an admin (restricted to admin-only communication)
  // Students and tutors can only chat with administrators, not with each other
  const startChatWithAdmin = async (admin: AdminUser) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/support-messaging/chats/start-with-admin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          adminId: admin.id
        })
      });

      if (response.ok) {
        const data = await response.json();
        const newChatId = data.data.chatId;
        
        // Add to chat contacts
        const newContact: ChatContact = {
          id: newChatId,
          name: `Chat with ${admin.full_name}`,
          type: 'direct',
          last_message: 'Chat started',
          unread_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setChatContacts(prev => {
          const exists = prev.find(c => c.id === newChatId);
          if (exists) {
            return prev;
          }
          return [...prev, newContact];
        });
        
        // Initialize empty messages
        setChatMessages(prev => ({
          ...prev,
          [newChatId]: []
        }));
        
        // Select the new chat
        setSelectedChat(newChatId);
        setShowAdminListDialog(false);
        setAdminSearchTerm('');
        setAdminSearchResults([]);
        
        toast({
          title: "Chat started",
          description: `Started conversation with ${admin.full_name}`,
        });
      } else {
        throw new Error('Failed to start chat');
      }
    } catch (error) {
      console.error('Error starting chat with admin:', error);
      toast({
        title: "Error",
        description: "Failed to start chat. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Function to send message (admin conversations only)
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    // Optimistically add the message to UI
    const tempMessage: ChatMessage = {
      id: `temp_${Date.now()}`,
      sender_id: 'current_user',
      sender_name: 'You',
      sender_role: 'student',
      message: messageText,
      message_type: 'text',
      created_at: new Date().toISOString(),
      is_read: false
    };

    setChatMessages(prev => ({
      ...prev,
      [selectedChat]: [...(prev[selectedChat] || []), tempMessage]
    }));

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/support-messaging/chats/${selectedChat}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: messageText
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Replace temporary message with the actual sent message
        setChatMessages(prev => ({
          ...prev,
          [selectedChat]: prev[selectedChat]?.map(msg => 
            msg.id === tempMessage.id 
              ? data.data
              : msg
          ) || []
        }));
        
        // Update contact's last message
        setChatContacts(prev => prev.map(contact => 
          contact.id === selectedChat 
            ? { ...contact, last_message: messageText, updated_at: new Date().toISOString() }
            : contact
        ));
        
        // Refresh chat list to get updated timestamps
        await loadStudentChats();
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove the temporary message on error
      setChatMessages(prev => ({
        ...prev,
        [selectedChat]: prev[selectedChat]?.filter(msg => msg.id !== tempMessage.id) || []
      }));
      
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Filter contacts based on search term (all contacts are admin conversations)
  const filteredContacts = chatContacts.filter(contact => 
    contact.name.toLowerCase().includes(contactSearchTerm.toLowerCase())
  );

  // Filter admins based on search term (only admins are available for students/tutors to contact)
  const filteredAdmins = allAdmins.filter(admin => 
    admin.full_name.toLowerCase().includes(adminSearchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(adminSearchTerm.toLowerCase())
  );

  // Get contact avatar based on type (all contacts are admin conversations)
  const getContactAvatar = (contact: ChatContact) => {
    switch (contact.type) {
      case 'direct':
        return '👨‍💼';
      default:
        return '👨‍💼';
    }
  };

  // Get contact role display (all contacts are admin conversations)
  const getContactRole = (contact: ChatContact) => {
    switch (contact.type) {
      case 'direct':
        return 'Admin Chat';
      default:
        return 'Admin Chat';
    }
  };

  // Get admin role display (only admins can be contacted by students/tutors)
  const getAdminRoleDisplay = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'admin':
        return 'Administrator';
      case 'manager':
        return 'Manager';
      default:
        return role;
    }
  };

  // Get admin role badge variant (only admins can be contacted by students/tutors)
  const getAdminRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'default';
      case 'admin':
        return 'secondary';
      case 'manager':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-10 right-6 z-50">
        <Button
          onClick={() => setShowAdminListDialog(true)}
          className="h-16 w-16 rounded-full bg-green-600 hover:bg-green-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110"
          size="icon"
        >
          <MessageSquare className="h-7 w-7" />
          {filteredContacts.some(contact => contact.unread_count > 0) && (
            <Badge className="absolute -top-3 -right-3 h-7 w-7 rounded-full bg-red-500 text-xs font-bold border-2 border-white">
              {filteredContacts.reduce((sum, contact) => sum + contact.unread_count, 0)}
            </Badge>
          )}
        </Button>
        <div className="absolute -top-12 right-0 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          Admin Support Chat
        </div>
      </div>

      {/* Floating Chat Widget */}
      {showAdminListDialog && (
        <div className="fixed z-50 bottom-10 right-6 w-[calc(100vw-2rem)] sm:w-[600px] h-[calc(100vh-12rem)] max-h-[800px]">
          <Card className="h-full shadow-2xl border-0">
            <CardHeader className="bg-green-600 text-white p-4 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-white text-base">
                  <MessageSquare className="h-5 w-5" />
                  Admin Support Chat
                  {filteredContacts.some(contact => contact.unread_count > 0) && (
                    <Badge className="bg-white text-green-600 text-xs">
                      {filteredContacts.reduce((sum, contact) => sum + contact.unread_count, 0)}
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-white hover:bg-green-700"
                    onClick={() => setShowAdminListDialog(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0 flex flex-col h-full">
              <div className="flex flex-1">
                {/* Chat List Sidebar */}
                <div className="w-2/5 border-r flex flex-col bg-gray-50">
                  <div className="p-4 border-b bg-white">
                    <div className="flex items-center gap-2 mb-3">
                      <Button
                        onClick={() => setShowAdminListDialog(true)}
                        size="icon"
                        className="bg-green-600 hover:bg-green-700 text-white h-8 w-8"
                        title="Start New Chat"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input 
                        placeholder="Search conversations..." 
                        value={contactSearchTerm}
                        onChange={(e) => setContactSearchTerm(e.target.value)}
                        className="pl-9 h-9 text-sm"
                      />
                    </div>
                  </div>
                  <ScrollArea className="flex-1">
                    {filteredContacts.length === 0 ? (
                      <div className="p-6 text-center text-muted-foreground">
                        <MessageSquare className="h-8 w-8 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No conversations yet</p>
                        <p className="text-xs mt-1">Start a new chat to begin messaging</p>
                      </div>
                    ) : (
                      filteredContacts.map((contact) => {
                        const contactInfo = {
                          name: contact.name,
                          role: getContactRole(contact),
                          avatar: getContactAvatar(contact),
                          isOnline: true
                        };
                        return (
                          <div
                            key={contact.id}
                            onClick={() => setSelectedChat(contact.id)}
                            className={`p-4 border-b cursor-pointer hover:bg-white transition-colors ${
                              selectedChat === contact.id ? 'bg-white border-l-4 border-l-green-500' : ''
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg">
                                  {contactInfo.avatar}
                                </div>
                                {contactInfo.isOnline && (
                                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="font-medium text-sm truncate">{contactInfo.name}</h4>
                                  {contact.unread_count > 0 && (
                                    <Badge className="bg-green-600 text-xs px-2 py-0.5 h-5">
                                      {contact.unread_count}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground truncate">{contact.last_message || 'No messages yet'}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(contact.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </ScrollArea>
                </div>

                {/* Chat Window */}
                <div className="flex-1 flex flex-col bg-white">
                  {selectedChat ? (
                    <>
                      {/* Chat Header */}
                      <div className="p-4 border-b flex items-center justify-between bg-white">
                        <div className="flex items-center gap-3">
                          {(() => {
                            const contact = filteredContacts.find(c => c.id === selectedChat);
                            const contactInfo = contact ? {
                              name: contact.name,
                              role: getContactRole(contact),
                              avatar: getContactAvatar(contact),
                              isOnline: true
                            } : { name: 'Unknown', role: 'Unknown', avatar: '👤', isOnline: false };
                            return (
                              <>
                                <div className="relative">
                                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl">
                                    {contactInfo.avatar}
                                  </div>
                                  {contactInfo.isOnline && (
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                  )}
                                </div>
                                <div>
                                  <h3 className="font-medium text-base">{contactInfo.name}</h3>
                                  <p className="text-sm text-muted-foreground">{contactInfo.role}</p>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Messages */}
                      <ScrollArea className="flex-1 p-4 pb-2">
                        <div className="space-y-3">
                          {isLoadingMessages ? (
                            <div className="flex items-center justify-center h-full">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                            </div>
                          ) : chatMessages[selectedChat]?.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                              <div>
                                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p className="text-sm">No messages yet</p>
                                <p className="text-xs mt-1">Start the conversation by sending a message</p>
                              </div>
                            </div>
                          ) : (
                            chatMessages[selectedChat]?.map((message) => {
                              const isOwn = message.sender_id === 'current_user' || message.sender_role === 'student';
                              return (
                                <div
                                  key={message.id}
                                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                >
                                  <div
                                    className={`max-w-[75%] px-4 py-3 rounded-2xl relative ${
                                      isOwn
                                        ? 'bg-green-600 text-white rounded-br-md'
                                        : 'bg-gray-100 text-gray-900 rounded-bl-md'
                                    }`}
                                  >
                                    {!isOwn && (
                                      <p className="text-xs font-medium mb-1 text-gray-600">
                                        {message.sender_name}
                                      </p>
                                    )}
                                    <p className="text-sm leading-relaxed">{message.message}</p>
                                    <div className={`text-xs mt-2 flex items-center justify-between gap-2 ${
                                      isOwn ? 'text-green-100' : 'text-gray-500'
                                    }`}>
                                      <span>
                                        {new Date(message.created_at).toLocaleTimeString([], { 
                                          hour: '2-digit', 
                                          minute: '2-digit' 
                                        })}
                                      </span>
                                      {isOwn && (
                                        <div className="flex items-center">
                                          {message.is_read ? (
                                            <CheckCheck className="h-4 w-4 text-blue-300" />
                                          ) : (
                                            <span className="text-xs">✓</span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                          <div ref={messagesEndRef} />
                        </div>
                      </ScrollArea>

                      {/* Message Input */}
                      <div className="p-4 pt-3 pb-12 sm:pb-8 border-t bg-white">
                        <div className="flex items-center gap-3">
                          <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                              }
                            }}
                            disabled={isLoadingMessages}
                            className="flex-1 h-10 text-sm"
                          />
                          <Button
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim() || isLoadingMessages}
                            className="bg-green-600 hover:bg-green-700 h-10 w-10"
                            size="icon"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Welcome Screen */
                    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-green-50 to-gray-50">
                      <div className="text-center max-w-sm mx-auto p-6">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <MessageSquare className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">
                          Admin Support Chat
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">
                          Select a conversation from the sidebar or start a new chat to begin messaging with administrators.
                        </p>
                        <div className="space-y-3">
                          <Button 
                            onClick={() => setShowAdminListDialog(true)}
                            className="w-full bg-green-600 hover:bg-green-700 h-10 text-sm"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Start New Chat
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* User Search Dialog */}
      <Dialog open={showAdminListDialog} onOpenChange={setShowAdminListDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Start New Conversation with Admin
            </DialogTitle>
            <DialogDescription>
              Choose an administrator to start a conversation with. Students and tutors can only chat with administrators for support.
              <br />
              <span className="text-xs text-muted-foreground mt-2 block">
                🔒 Security: Direct communication between students/tutors is not allowed. All conversations are admin-moderated.
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="admin-search">Search Administrators</Label>
              <Input
                id="admin-search"
                placeholder="Search by name or email..."
                value={adminSearchTerm}
                onChange={(e) => setAdminSearchTerm(e.target.value)}
              />
            </div>
            <ScrollArea className="h-96">
              {isSearchingAdmins ? (
                <div className="flex items-center justify-center p-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                </div>
              ) : filteredAdmins.length === 0 ? (
                <div className="text-center p-4 text-muted-foreground">
                  {adminSearchTerm.length >= 2 ? 'No administrators found' : 'Loading administrators...'}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAdmins.map((admin) => (
                    <div
                      key={admin.id}
                      className="flex items-center gap-4 p-4 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        {admin.avatar_url ? (
                          <img src={admin.avatar_url} alt={admin.full_name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-green-600 font-medium text-lg">
                            {admin.full_name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-base">{admin.full_name}</h3>
                          <Badge variant={getAdminRoleBadgeVariant(admin.role)} className="text-xs">
                            {getAdminRoleDisplay(admin.role)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{admin.email}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-green-600 text-xs flex items-center gap-1">
                              <Circle className="h-3 w-3 fill-green-600" />
                              Available
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Member since {new Date(admin.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              startChatWithAdmin(admin);
                            }}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Start Chat
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowAdminListDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
