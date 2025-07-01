// API configuration for customer support portal
const API_URL = 'https://backend-final-saas.onrender.com/api';

// Helper function to handle API errors
const handleApiError = async (response: Response) => {
  if (!response.ok) {
    let errorMessage = 'API request failed';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }
  return response;
};

export const api = {
  // Send message to chatbot
  sendMessage: async (chatbotId: string, data: { 
    message: string; 
    language?: string; 
    session_id?: string; 
    conversation_history?: any[] 
  }) => {
    try {
      const response = await fetch(`${API_URL}/chat/${chatbotId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          message: data.message,
          language: data.language || 'en',
          session_id: data.session_id || `session_${Date.now()}`,
          conversation_history: data.conversation_history || []
        }),
      });
      
      await handleApiError(response);
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to get response from chatbot');
      }
    } catch (error) {
      console.error('API Error - sendMessage:', error);
      throw error;
    }
  },

  // Get chatbot status
  getChatbotStatus: async (chatbotId: string) => {
    try {
      const response = await fetch(`${API_URL}/chat/${chatbotId}/status`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      await handleApiError(response);
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to get chatbot status');
      }
    } catch (error) {
      console.error('API Error - getChatbotStatus:', error);
      throw error;
    }
  },

  // Submit feedback
  submitFeedback: async (data: { conversation_id: string; rating: number; comment?: string }) => {
    try {
      const response = await fetch(`${API_URL}/chat/feedback`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data),
      });
      
      await handleApiError(response);
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('API Error - submitFeedback:', error);
      throw error;
    }
  },

  // Get available chatbots (for demo purposes)
  getChatbots: async () => {
    try {
      const response = await fetch(`${API_URL}/chatbots`, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json',
          'Authorization': 'Bearer demo-token' // This would need proper auth in production
        }
      });
      
      await handleApiError(response);
      const result = await response.json();
      
      if (result.success) {
        return result.data.chatbots;
      } else {
        throw new Error(result.message || 'Failed to get chatbots');
      }
    } catch (error) {
      console.error('API Error - getChatbots:', error);
      throw error;
    }
  },

  // Health check
  healthCheck: async () => {
    try {
      const response = await fetch(`${API_URL.replace('/api', '')}/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      await handleApiError(response);
      return await response.json();
    } catch (error) {
      console.error('API Error - healthCheck:', error);
      throw error;
    }
  },

  // Tavus API methods
  tavus: {
    // Create video conversation
    createConversation: async (chatbotId: string, data: {
      language?: string;
      session_id?: string;
      max_duration?: number;
    }) => {
      try {
        const response = await fetch(`${API_URL}/tavus/conversation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            chatbot_id: chatbotId,
            language: data.language || 'en',
            session_id: data.session_id,
            max_duration: data.max_duration || 1800
          }),
        });

        await handleApiError(response);
        const result = await response.json();

        if (result.success) {
          return result.data;
        } else {
          throw new Error(result.message || 'Failed to create video conversation');
        }
      } catch (error) {
        console.error('API Error - createConversation:', error);
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

        await handleApiError(response);
        const result = await response.json();

        if (result.success) {
          return result.data;
        } else {
          throw new Error(result.message || 'Failed to get conversation status');
        }
      } catch (error) {
        console.error('API Error - getConversationStatus:', error);
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

        await handleApiError(response);
        const result = await response.json();

        if (result.success) {
          return result;
        } else {
          throw new Error(result.message || 'Failed to end conversation');
        }
      } catch (error) {
        console.error('API Error - endConversation:', error);
        throw error;
      }
    },

    // Get video analytics
    getAnalytics: async (period: string = '7d', chatbotId?: string) => {
      try {
        const params = new URLSearchParams({ period });
        if (chatbotId) params.append('chatbot_id', chatbotId);

        const response = await fetch(`${API_URL}/tavus/analytics?${params}`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });

        await handleApiError(response);
        const result = await response.json();

        if (result.success) {
          return result.data;
        } else {
          throw new Error(result.message || 'Failed to get video analytics');
        }
      } catch (error) {
        console.error('API Error - getVideoAnalytics:', error);
        throw error;
      }
    }
  }
};