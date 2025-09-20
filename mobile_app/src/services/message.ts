import { getApiBaseUrl } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Message {
  _id: string;
  sender: {
    _id: string;
    name: string;
    email: string;
    userType: 'doctor' | 'patient';
  };
  receiver: {
    _id: string;
    name: string;
    email: string;
    userType: 'doctor' | 'patient';
  };
  senderType: 'doctor' | 'patient';
  receiverType: 'doctor' | 'patient';
  content: string;
  messageType: 'text' | 'image' | 'file' | 'appointment_update';
  attachments?: {
    filename: string;
    url: string;
    fileType: string;
    fileSize: number;
  }[];
  relatedAppointment?: string;
  isRead: boolean;
  readAt?: string;
  status: 'sent' | 'delivered' | 'read';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  subject?: string;
  conversationId: string;
  replyTo?: {
    _id: string;
    content: string;
    sender: string;
    createdAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  conversationId: string;
  otherUser: {
    _id: string;
    name: string;
    email: string;
    userType: 'doctor' | 'patient';
    specialization?: string;
  };
  lastMessage: Message;
  unreadCount: number;
}

export interface SendMessageRequest {
  receiverId: string;
  content: string;
  messageType?: 'text' | 'image' | 'file' | 'appointment_update';
  subject?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  relatedAppointment?: string;
}

export interface ConversationQuery {
  page?: number;
  limit?: number;
}

class MessageService {
  private async getAuthHeaders() {
    const token = await AsyncStorage.getItem('@auth_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }
    return response.json();
  }

  // Send a new message
  async sendMessage(messageData: SendMessageRequest): Promise<{ success: boolean; data: Message; message: string }> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/messages/send`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(messageData),
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  }

  // Get conversation with another user
  async getConversation(
    otherUserId: string, 
    query: ConversationQuery = {}
  ): Promise<{ success: boolean; data: { messages: Message[]; pagination: any } }> {
    try {
      const queryParams = new URLSearchParams();
      if (query.page) queryParams.append('page', query.page.toString());
      if (query.limit) queryParams.append('limit', query.limit.toString());

      const url = `${getApiBaseUrl()}/messages/conversation/${otherUserId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: await this.getAuthHeaders(),
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Get conversation error:', error);
      throw error;
    }
  }

  // Get all conversations for current user
  async getConversations(): Promise<{ success: boolean; data: Conversation[] }> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/messages/conversations`, {
        method: 'GET',
        headers: await this.getAuthHeaders(),
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Get conversations error:', error);
      throw error;
    }
  }

  // Mark message as read
  async markAsRead(messageId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/messages/${messageId}/read`, {
        method: 'PATCH',
        headers: await this.getAuthHeaders(),
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Mark as read error:', error);
      throw error;
    }
  }

  // Delete message
  async deleteMessage(messageId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/messages/${messageId}`, {
        method: 'DELETE',
        headers: await this.getAuthHeaders(),
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Delete message error:', error);
      throw error;
    }
  }

  // Reply to a message
  async replyToMessage(
    messageId: string, 
    replyData: { content: string; messageType?: 'text' | 'image' | 'file' }
  ): Promise<{ success: boolean; data: Message; message: string }> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/messages/${messageId}/reply`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(replyData),
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Reply to message error:', error);
      throw error;
    }
  }

  // Get unread message count
  async getUnreadCount(): Promise<{ success: boolean; data: { unreadCount: number } }> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/messages/unread-count`, {
        method: 'GET',
        headers: await this.getAuthHeaders(),
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Get unread count error:', error);
      throw error;
    }
  }

  // Get doctors for a patient (for starting new conversations)
  async getAvailableDoctors(): Promise<{ success: boolean; data: any[] }> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/doctors`, {
        method: 'GET',
        headers: await this.getAuthHeaders(),
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Get available doctors error:', error);
      throw error;
    }
  }

  // Get patients for a doctor (for starting new conversations)
  async getMyPatients(): Promise<{ success: boolean; data: any[] }> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/doctor/patients`, {
        method: 'GET',
        headers: await this.getAuthHeaders(),
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Get my patients error:', error);
      throw error;
    }
  }

  // Get available contacts for messaging (doctors/patients with appointment history)
  async getAvailableContacts(): Promise<{ success: boolean; data: { contacts: any[]; count: number } }> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/messages/available-contacts`, {
        method: 'GET',
        headers: await this.getAuthHeaders(),
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Get available contacts error:', error);
      throw error;
    }
  }
}

export const messageService = new MessageService();
export default messageService;