// Tavus API integration for video agent - Frontend API wrapper
const API_URL = 'https://backend-final-saas.onrender.com/api';

interface TavusConversationRequest {
  chatbot_id: string;
  language?: string;
  session_id?: string;
  max_duration?: number;
}

interface TavusConversationResponse {
  conversation_id: string;
  conversation_url: string;
  status: string;
  chatbot?: {
    name: string;
    company_name: string;
    welcome_message: string;
  };
  context_length?: number;
}

export const tavusApi = {
  // Create video conversation
  createConversation: async (data: TavusConversationRequest): Promise<TavusConversationResponse> => {
    try {
      const response = await fetch(`${API_URL}/tavus/conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        return result.data.conversation;
      } else {
        throw new Error(result.message || 'Failed to create video conversation');
      }
    } catch (error) {
      console.error('Error creating Tavus conversation:', error);
      throw error;
    }
  },

  // Get conversation status
  getConversationStatus: async (conversationId: string) => {
    try {
      const response = await fetch(`${API_URL}/tavus/conversation/${conversationId}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        return result.data.conversation;
      } else {
        throw new Error(result.message || 'Failed to get conversation status');
      }
    } catch (error) {
      console.error('Error getting conversation status:', error);
      throw error;
    }
  },

  // End conversation
  endConversation: async (conversationId: string) => {
    try {
      const response = await fetch(`${API_URL}/tavus/conversation/${conversationId}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        return result;
      } else {
        throw new Error(result.message || 'Failed to end conversation');
      }
    } catch (error) {
      console.error('Error ending conversation:', error);
      throw error;
    }
  }
};