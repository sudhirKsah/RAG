const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

export const api = {
  // Auth endpoints
  register: (data: {email, password, company_name}) => fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  
  login: (data) => fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  
  // Document endpoints
  uploadDocument: (file, token) => {
    const formData = new FormData();
    formData.append('document', file);
    return fetch(`${API_URL}/documents/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
  },
  
  // Chatbot endpoints
  createChatbot: (data, token) => fetch(`${API_URL}/chatbots`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  }),
  
  // Chat endpoint
  sendMessage: (chatbotId, message) => fetch(`${API_URL}/chat/${chatbotId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message)
  })
};
