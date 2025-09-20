import ApiService from './api.js';

class MessageService {
  // Get all conversations for the authenticated user
  async getConversations() {
    try {
      console.log('💬 MessageService: Fetching conversations...');
      const response = await ApiService.getConversations();
      console.log('📋 MessageService: Conversations response:', response);
      return response.success ? response.data : response;
    } catch (error) {
      console.error('❌ MessageService: Error fetching conversations:', error);
      throw error;
    }
  }

  // Send a new message
  async sendMessage(messageData) {
    try {
      console.log('💬 MessageService: Sending message...');
      const response = await ApiService.sendMessage(messageData);
      console.log('📤 MessageService: Send message response:', response);
      return response.success ? response.data : response;
    } catch (error) {
      console.error('❌ MessageService: Error sending message:', error);
      throw error;
    }
  }

  // Mark a message as read
  async markMessageAsRead(messageId) {
    try {
      console.log('💬 MessageService: Marking message as read...', messageId);
      const response = await ApiService.markMessageAsRead(messageId);
      console.log('✅ MessageService: Mark read response:', response);
      return response.success ? response.data : response;
    } catch (error) {
      console.error('❌ MessageService: Error marking message as read:', error);
      throw error;
    }
  }

  // Delete a message
  async deleteMessage(messageId) {
    try {
      console.log('💬 MessageService: Deleting message...', messageId);
      const response = await ApiService.deleteMessage(messageId);
      console.log('🗑️ MessageService: Delete response:', response);
      return response.success ? response.data : response;
    } catch (error) {
      console.error('❌ MessageService: Error deleting message:', error);
      throw error;
    }
  }

  // Reply to a message
  async replyToMessage(messageId, replyData) {
    try {
      console.log('💬 MessageService: Replying to message...', messageId);
      const response = await ApiService.replyToMessage(messageId, replyData);
      console.log('↩️ MessageService: Reply response:', response);
      return response.success ? response.data : response;
    } catch (error) {
      console.error('❌ MessageService: Error replying to message:', error);
      throw error;
    }
  }
}

export default new MessageService();