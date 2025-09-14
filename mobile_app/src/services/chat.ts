import { getApiBaseUrl } from './api';

export interface ChatRequest {
  message: string;
  patientId?: string;
}

export interface ChatResponse {
  success: boolean;
  reply: string;
  error?: string;
}

export class ChatService {
  static async sendMessage(message: string, patientId?: string): Promise<ChatResponse> {
    try {
      const baseUrl = getApiBaseUrl().replace('/api', ''); // Remove /api since we'll add it in the endpoint
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          patientId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        reply: data.reply || data.message || 'I received your message.',
        error: undefined,
      };
    } catch (error) {
      console.error('ChatService.sendMessage error:', error);
      return {
        success: false,
        reply: 'Sorry, I\'m having trouble connecting right now.',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  static async getChatHistory(patientId: string): Promise<{ success: boolean; messages?: any[]; error?: string }> {
    try {
      const baseUrl = getApiBaseUrl().replace('/api', ''); // Remove /api since we'll add it in the endpoint
      const response = await fetch(`${baseUrl}/api/chat/history/${patientId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        messages: data.messages || [],
      };
    } catch (error) {
      console.error('ChatService.getChatHistory error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}