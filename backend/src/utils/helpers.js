import crypto from 'crypto';

// Generate unique session ID
export const generateSessionId = () => {
  return `session_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
};

// Generate API key
export const generateApiKey = () => {
  return `cb_${crypto.randomBytes(16).toString('hex')}`;
};

// Sanitize text for safe storage and display
export const sanitizeText = (text) => {
  if (typeof text !== 'string') return '';
  
  return text
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
    .substring(0, 10000); // Limit length
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Generate random color
export const generateRandomColor = () => {
  const colors = [
    '#2563eb', '#7c3aed', '#dc2626', '#059669', 
    '#d97706', '#0891b2', '#be185d', '#4338ca'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Calculate response time
export const calculateResponseTime = (startTime) => {
  return Date.now() - startTime;
};

// Truncate text with ellipsis
export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Parse language code to full name
export const getLanguageName = (code) => {
  const languages = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'hi': 'Hindi',
    'ne': 'Nepali',
    'zh': 'Chinese',
    'ja': 'Japanese'
  };
  return languages[code] || 'Unknown';
};

// Validate URL format
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Generate slug from text
export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
};

// Deep clone object
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Retry function with exponential backoff
export const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  for (let i = 0;  i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const delay = baseDelay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Rate limiting helper
export const createRateLimiter = (windowMs, maxRequests) => {
  const requests = new Map();
  
  return (identifier) => {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old requests
    for (const [key, timestamps] of requests.entries()) {
      requests.set(key, timestamps.filter(time => time > windowStart));
      if (requests.get(key).length === 0) {
        requests.delete(key);
      }
    }
    
    // Check current requests
    const userRequests = requests.get(identifier) || [];
    if (userRequests.length >= maxRequests) {
      return false; // Rate limit exceeded
    }
    
    // Add current request
    userRequests.push(now);
    requests.set(identifier, userRequests);
    
    return true; // Request allowed
  };
};