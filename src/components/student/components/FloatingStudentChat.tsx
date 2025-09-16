'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, X, Maximize2, Minimize2, Circle, Clock, CheckCheck } from "lucide-react";
import { API_BASE_URL } from "@/config/api";

interface ChatMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  message: string;
  message_type: string;
  created_at: string;
  is_read: boolean;
}

interface ChatContact {
  id: string;
  name: string;
  type: string;
  last_message?: string;
  unread_count: number;
  created_at: string;
  updated_at: string;
  participant?: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    status: string;
    lastSeen?: string;
  };
}

interface FloatingStudentChatProps {
  chatContacts: ChatContact[];
  chatMessages: {[key: string]: ChatMessage[]};
  selectedChat: string | null;
  setSelectedChat: (chatId: string | null) => void;
  newMessage: string;
  setNewMessage: (message: string) => void;
  handleSendMessage: () => void;
}

export function FloatingStudentChat({
  chatContacts,
  chatMessages,
  selectedChat,
  setSelectedChat,
  newMessage,
  setNewMessage,
  handleSendMessage
}: FloatingStudentChatProps) {
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // State for chat widget visibility and size
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // State for contact filtering
  const [contactSearchTerm, setContactSearchTerm] = useState('');

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, selectedChat]);

  // Filter contacts based on search term
  const displayContacts = chatContacts.filter(contact => 
    contact.name.toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
    contact.participant?.name.toLowerCase().includes(contactSearchTerm.toLowerCase())
  );

  // Get contact display info
  const getContactDisplayInfo = (contact: ChatContact) => {
    if (contact.participant) {
      return {
        name: contact.participant.name,
        role: contact.participant.role,
        avatar: contact.participant.avatar || '👤',
        status: contact.participant.status,
        lastSeen: contact.participant.lastSeen
      };
    }
    return {
      name: contact.name,
      role: 'Admin',
      avatar: '👨‍💼',
      status: 'active',
      lastSeen: null
    };
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  // Format message preview
  const formatMessagePreview = (message: string) => {
    if (message.length > 50) {
      return message.substring(0, 50) + '...';
    }
    return message;
  };

  // Calculate total unread messages
  const totalUnread = displayContacts.reduce((sum, contact) => sum + contact.unread_count, 0);

  return (
    <>
      {/* Floating Chat Button */}
      {!isChatOpen && (
        <div className="fixed bottom-10 right-6 z-50">
          <Button
            onClick={() => setIsChatOpen(true)}
            className="h-16 w-16 rounded-full bg-green-600 hover:bg-green-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110"
            size="icon"
          >
            <MessageSquare className="h-7 w-7" />
            {totalUnread > 0 && (
              <Badge className="absolute -top-3 -right-3 h-7 w-7 rounded-full bg-red-500 text-xs font-bold border-2 border-white">
                {totalUnread > 99 ? '99+' : totalUnread}
              </Badge>
            )}
          </Button>
          <div className="absolute -top-12 right-0 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            Admin Chat
          </div>
        </div>
      )}

      {/* Floating Chat Widget */}
      {isChatOpen && (
        <div className={`fixed z-50 transition-all duration-300 ${
          isExpanded 
            ? 'bottom-10 right-6 w-[calc(100vw-2rem)] sm:w-[600px] h-[calc(100vh-12rem)] max-h-[800px]' 
            : 'bottom-10 right-6 w-[calc(100vw-3rem)] sm:w-[450px] h-[calc(100vh-12rem)] max-h-[700px]'
        } sm:bottom-10 sm:right-6 bottom-8 right-4`}>
          <Card className="h-full shadow-2xl border-0">
            <CardHeader className="bg-green-600 text-white p-4 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-white text-base">
                  <MessageSquare className="h-5 w-5" />
                  Admin Chat
                  {totalUnread > 0 && (
                    <Badge className="bg-white text-green-600 text-xs">
                      {totalUnread}
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-white hover:bg-green-700"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-white hover:bg-green-700"
                    onClick={() => setIsChatOpen(false)}
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
                    <div className="relative">
                      <Input 
                        placeholder="Search conversations..." 
                        value={contactSearchTerm}
                        onChange={(e) => setContactSearchTerm(e.target.value)}
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>
                  <ScrollArea className="flex-1">
                    {displayContacts.length === 0 ? (
                      <div className="p-6 text-center text-muted-foreground">
                        <MessageSquare className="h-8 w-8 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No conversations yet</p>
                        <p className="text-xs mt-1">Start chatting with admin support</p>
                      </div>
                    ) : (
                      displayContacts.map((contact) => {
                        const contactInfo = getContactDisplayInfo(contact);
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
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg">
                                  {contactInfo.avatar}
                                </div>
                                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                                  contactInfo.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                                }`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {contactInfo.name}
                                  </p>
                                  {contact.unread_count > 0 && (
                                    <Badge className="bg-green-600 text-white text-xs">
                                      {contact.unread_count}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 truncate">
                                  {contactInfo.role}
                                </p>
                                {contact.last_message && (
                                  <p className="text-xs text-gray-600 truncate mt-1">
                                    {formatMessagePreview(contact.last_message)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </ScrollArea>
                </div>

                {/* Chat Messages Area */}
                <div className="flex-1 flex flex-col">
                  {selectedChat ? (
                    <>
                      {/* Chat Header */}
                      <div className="p-4 border-b bg-white">
                        {(() => {
                          const contact = chatContacts.find(c => c.id === selectedChat);
                          if (!contact) return null;
                          const contactInfo = getContactDisplayInfo(contact);
                          return (
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                                  {contactInfo.avatar}
                                </div>
                                <div className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white ${
                                  contactInfo.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                                }`} />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{contactInfo.name}</p>
                                <p className="text-xs text-gray-500">{contactInfo.role}</p>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Messages */}
                      <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                          {chatMessages[selectedChat]?.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${message.sender_role === 'admin' || message.sender_role === 'super_admin' ? 'justify-start' : 'justify-end'}`}
                            >
                              <div className={`max-w-[70%] ${message.sender_role === 'admin' || message.sender_role === 'super_admin' ? 'order-1' : 'order-2'}`}>
                                <div className={`rounded-lg px-3 py-2 ${
                                  message.sender_role === 'admin' || message.sender_role === 'super_admin'
                                    ? 'bg-gray-100 text-gray-900'
                                    : 'bg-green-600 text-white'
                                }`}>
                                  <p className="text-sm">{message.message}</p>
                                </div>
                                <div className={`flex items-center gap-2 mt-1 text-xs text-gray-500 ${
                                  message.sender_role === 'admin' || message.sender_role === 'super_admin' ? 'justify-start' : 'justify-end'
                                }`}>
                                  <span>{formatTimestamp(message.created_at)}</span>
                                  {message.is_read && (
                                    <CheckCheck className="h-3 w-3 text-green-500" />
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                        </div>
                      </ScrollArea>

                      {/* Message Input */}
                      <div className="p-4 border-t bg-white">
                        <div className="flex gap-2">
                          <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            className="flex-1"
                          />
                          <Button
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim()}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">Select a conversation to start chatting</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
