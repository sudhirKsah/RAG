const API_URL = import.meta.env.VITE_API_URL || 'https://backend-final-saas.onrender.com/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to create headers with auth
const createHeaders = (includeAuth = true) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

export const api = {
  // Auth endpoints
  register: (data: { email: string; password: string; company_name: string }) =>
    fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: createHeaders(false),
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: createHeaders(false),
      body: JSON.stringify(data),
    }),

  getProfile: () =>
    fetch(`${API_URL}/auth/profile`, {
      method: 'GET',
      headers: createHeaders(),
    }),

  updateProfile: (data: any) =>
    fetch(`${API_URL}/auth/profile`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify(data),
    }),

  changePassword: (data: { current_password: string; new_password: string }) =>
    fetch(`${API_URL}/auth/change-password`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(data),
    }),

  // Document endpoints
  uploadDocument: (file: File) => {
    const formData = new FormData();
    formData.append('document', file);
    const token = getAuthToken();
    return fetch(`${API_URL}/documents/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
  },

  getDocuments: (limit = 50, offset = 0) =>
    fetch(`${API_URL}/documents?limit=${limit}&offset=${offset}`, {
      method: 'GET',
      headers: createHeaders(),
    }),

  getDocument: (id: string) =>
    fetch(`${API_URL}/documents/${id}`, {
      method: 'GET',
      headers: createHeaders(),
    }),

  deleteDocument: (id: string) =>
    fetch(`${API_URL}/documents/${id}`, {
      method: 'DELETE',
      headers: createHeaders(),
    }),

  reprocessDocument: (id: string) =>
    fetch(`${API_URL}/documents/${id}/reprocess`, {
      method: 'POST',
      headers: createHeaders(),
    }),

  getDocumentStats: () =>
    fetch(`${API_URL}/documents/stats/overview`, {
      method: 'GET',
      headers: createHeaders(),
    }),

  bulkUploadDocuments: (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append('documents', file));
    const token = getAuthToken();
    return fetch(`${API_URL}/documents/bulk-upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
  },

  // Chatbot endpoints
  createChatbot: (data: any) =>
    fetch(`${API_URL}/chatbots`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(data),
    }),

  getChatbots: () =>
    fetch(`${API_URL}/chatbots`, {
      method: 'GET',
      headers: createHeaders(),
    }),

  getChatbot: (id: string) =>
    fetch(`${API_URL}/chatbots/${id}`, {
      method: 'GET',
      headers: createHeaders(),
    }),

  updateChatbot: (id: string, data: any) =>
    fetch(`${API_URL}/chatbots/${id}`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify(data),
    }),

  deleteChatbot: (id: string) =>
    fetch(`${API_URL}/chatbots/${id}`, {
      method: 'DELETE',
      headers: createHeaders(),
    }),

  toggleChatbotStatus: (id: string, status: 'active' | 'inactive') =>
    fetch(`${API_URL}/chatbots/${id}/status`, {
      method: 'PATCH',
      headers: createHeaders(),
      body: JSON.stringify({ status }),
    }),

  getChatbotAnalytics: (id: string, period = '7d') =>
    fetch(`${API_URL}/chatbots/${id}/analytics?period=${period}`, {
      method: 'GET',
      headers: createHeaders(),
    }),

  generateApiKey: (id: string) =>
    fetch(`${API_URL}/chatbots/${id}/api-key`, {
      method: 'POST',
      headers: createHeaders(),
    }),

  // Chat endpoints (public)
  sendMessage: async (chatbotId: string, data: { message: string; language?: string; session_id?: string; conversation_history?: any[] }) => {
    const response = await fetch(`${API_URL}/chat/${chatbotId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to send message');
    }
    
    const result = await response.json();
    return result.data;
  },

  streamMessage: (chatbotId: string, message: any) =>
    fetch(`${API_URL}/chat/${chatbotId}/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    }),

  getConversations: (chatbotId: string, sessionId: string, limit = 50, offset = 0) =>
    fetch(`${API_URL}/chat/${chatbotId}/conversations/${sessionId}?limit=${limit}&offset=${offset}`, {
      method: 'GET',
    }),

  submitFeedback: (data: { conversation_id: string; rating: number; comment?: string }) =>
    fetch(`${API_URL}/chat/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  getChatbotStatus: (chatbotId: string) =>
    fetch(`${API_URL}/chat/${chatbotId}/status`, {
      method: 'GET',
    }),

  // Analytics endpoints
  getAnalyticsOverview: (period = '7d') =>
    fetch(`${API_URL}/analytics/overview?period=${period}`, {
      method: 'GET',
      headers: createHeaders(),
    }),

  getConversationAnalytics: (period = '7d', chatbotId?: string) => {
    const params = new URLSearchParams({ period });
    if (chatbotId) params.append('chatbot_id', chatbotId);
    return fetch(`${API_URL}/analytics/conversations?${params}`, {
      method: 'GET',
      headers: createHeaders(),
    });
  },

  getRealtimeAnalytics: () =>
    fetch(`${API_URL}/analytics/realtime`, {
      method: 'GET',
      headers: createHeaders(),
    }),

  exportAnalytics: (period = '30d', format = 'json') =>
    fetch(`${API_URL}/analytics/export?period=${period}&format=${format}`, {
      method: 'GET',
      headers: createHeaders(),
    }),

  // Deployment endpoints
  getDeploymentInfo: (chatbotId: string) =>
    fetch(`${API_URL}/deployment/${chatbotId}`, {
      method: 'GET',
      headers: createHeaders(),
    }),

  updateDeployment: (chatbotId: string, data: any) =>
    fetch(`${API_URL}/deployment/${chatbotId}`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify(data),
    }),

  getEmbedCode: (chatbotId: string, platform: string, position = 'bottom-right', theme = 'light') =>
    fetch(`${API_URL}/deployment/${chatbotId}/embed/${platform}?position=${position}&theme=${theme}`, {
      method: 'GET',
      headers: createHeaders(),
    }),

  testDeployment: (chatbotId: string, testMessage = 'Hello, this is a test message') =>
    fetch(`${API_URL}/deployment/${chatbotId}/test`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({ test_message: testMessage }),
    }),

  getDeploymentAnalytics: (chatbotId: string, period = '7d') =>
    fetch(`${API_URL}/deployment/${chatbotId}/analytics?period=${period}`, {
      method: 'GET',
      headers: createHeaders(),
    }),
};