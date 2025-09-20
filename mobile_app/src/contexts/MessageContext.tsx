import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { messageService, Message, Conversation } from '../services/message';
import { useAuth } from './AuthContext';

interface MessageContextType {
  conversations: Conversation[];
  currentConversation: Message[];
  currentOtherUser: any;
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchConversations: () => Promise<void>;
  fetchConversation: (otherUserId: string, page?: number) => Promise<void>;
  sendMessage: (receiverId: string, content: string, messageType?: string, subject?: string) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  replyToMessage: (messageId: string, content: string) => Promise<void>;
  getUnreadCount: () => Promise<void>;
  clearCurrentConversation: () => void;
  setCurrentOtherUser: (user: any) => void;
  refreshConversations: () => Promise<void>;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

interface MessageProviderProps {
  children: ReactNode;
}

export const MessageProvider: React.FC<MessageProviderProps> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Message[]>([]);
  const [currentOtherUser, setCurrentOtherUser] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { patient, isAuthenticated } = useAuth();

  // Fetch all conversations
  const fetchConversations = useCallback(async () => {
    if (!isAuthenticated || !patient) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const response = await messageService.getConversations();
      
      if (response.success) {
        setConversations(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch conversations');
      console.error('Fetch conversations error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, patient]);

  // Fetch conversation with specific user
  const fetchConversation = async (otherUserId: string, page: number = 1) => {
    if (!isAuthenticated || !patient) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await messageService.getConversation(otherUserId, { page, limit: 50 });
      
      if (response.success) {
        if (page === 1) {
          setCurrentConversation(response.data.messages);
        } else {
          // Append older messages for pagination
          setCurrentConversation(prev => [...response.data.messages, ...prev]);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch conversation');
      console.error('Fetch conversation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Send a new message
  const sendMessage = async (
    receiverId: string, 
    content: string, 
    messageType: string = 'text',
    subject?: string
  ) => {
    if (!isAuthenticated || !patient) return;

    try {
      setError(null);
      const response = await messageService.sendMessage({
        receiverId,
        content,
        messageType: messageType as any,
        subject
      });
      
      if (response.success) {
        // Add the new message to current conversation if it's the same conversation
        if (currentOtherUser && (currentOtherUser._id === receiverId || patient._id === receiverId)) {
          setCurrentConversation(prev => [...prev, response.data]);
        }
        
        // Refresh conversations to update last message and unread counts
        await fetchConversations();
        await getUnreadCount();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
      console.error('Send message error:', err);
      throw err; // Re-throw to handle in UI
    }
  };

  // Mark message as read
  const markAsRead = async (messageId: string) => {
    try {
      setError(null);
      const response = await messageService.markAsRead(messageId);
      
      if (response.success) {
        // Update the message in current conversation
        setCurrentConversation(prev => 
          prev.map(msg => 
            msg._id === messageId 
              ? { ...msg, isRead: true, readAt: new Date().toISOString(), status: 'read' as const }
              : msg
          )
        );
        
        // Update unread count
        await getUnreadCount();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to mark message as read');
      console.error('Mark as read error:', err);
    }
  };

  // Delete message
  const deleteMessage = async (messageId: string) => {
    try {
      setError(null);
      const response = await messageService.deleteMessage(messageId);
      
      if (response.success) {
        // Remove message from current conversation
        setCurrentConversation(prev => prev.filter(msg => msg._id !== messageId));
        
        // Refresh conversations
        await fetchConversations();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete message');
      console.error('Delete message error:', err);
      throw err;
    }
  };

  // Reply to a message
  const replyToMessage = async (messageId: string, content: string) => {
    try {
      setError(null);
      const response = await messageService.replyToMessage(messageId, { content });
      
      if (response.success) {
        // Add the reply to current conversation
        setCurrentConversation(prev => [...prev, response.data]);
        
        // Refresh conversations
        await fetchConversations();
        await getUnreadCount();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send reply');
      console.error('Reply message error:', err);
      throw err;
    }
  };

  // Get unread message count
  const getUnreadCount = useCallback(async () => {
    if (!isAuthenticated || !patient) return;

    try {
      const response = await messageService.getUnreadCount();
      
      if (response.success) {
        setUnreadCount(response.data.unreadCount);
      }
    } catch (err: any) {
      console.error('Get unread count error:', err);
      // Don't set error state for this as it's a background operation
    }
  }, [isAuthenticated, patient]);

  // Clear current conversation
  const clearCurrentConversation = () => {
    setCurrentConversation([]);
    setCurrentOtherUser(null);
  };

  // Refresh conversations
  const refreshConversations = async () => {
    await Promise.all([
      fetchConversations(),
      getUnreadCount()
    ]);
  };

  // Auto-fetch conversations and unread count when authenticated
  useEffect(() => {
    if (isAuthenticated && patient) {
      fetchConversations();
      getUnreadCount();
      
      // Set up periodic refresh for unread count (every 30 seconds)
      const interval = setInterval(() => {
        getUnreadCount();
      }, 30000);
      
      return () => clearInterval(interval);
    } else {
      // Clear state when not authenticated
      setConversations([]);
      setCurrentConversation([]);
      setCurrentOtherUser(null);
      setUnreadCount(0);
    }
  }, [isAuthenticated, patient, fetchConversations, getUnreadCount]);

  const value: MessageContextType = {
    conversations,
    currentConversation,
    currentOtherUser,
    unreadCount,
    isLoading,
    error,
    
    fetchConversations,
    fetchConversation,
    sendMessage,
    markAsRead,
    deleteMessage,
    replyToMessage,
    getUnreadCount,
    clearCurrentConversation,
    setCurrentOtherUser,
    refreshConversations,
  };

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessage = (): MessageContextType => {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
};

export default MessageContext;