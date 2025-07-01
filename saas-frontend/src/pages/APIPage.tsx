import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import {
  Code,
  Copy,
  Key,
  Book,
  Play,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  Shield,
} from 'lucide-react';

const endpoints = [
  {
    method: 'POST',
    path: '/api/v1/chat',
    description: 'Send a message to the chatbot',
    params: ['message', 'language', 'session_id'],
  },
  {
    method: 'GET',
    path: '/api/v1/conversations',
    description: 'Get conversation history',
    params: ['limit', 'offset', 'session_id'],
  },
  {
    method: 'POST',
    path: '/api/v1/feedback',
    description: 'Submit feedback for a response',
    params: ['conversation_id', 'rating', 'comment'],
  },
  {
    method: 'GET',
    path: '/api/v1/status',
    description: 'Check chatbot status',
    params: [],
  },
];

const codeExamples = {
  javascript: `// JavaScript Example
const response = await fetch('https://api.chatbotbuilder.com/v1/chat', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: 'Hello, how can you help me?',
    language: 'en',
    session_id: 'unique-session-id'
  })
});

const data = await response.json();
console.log(data.response);`,
  
  python: `# Python Example
import requests

url = 'https://api.chatbotbuilder.com/v1/chat'
headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}
data = {
    'message': 'Hello, how can you help me?',
    'language': 'en',
    'session_id': 'unique-session-id'
}

response = requests.post(url, headers=headers, json=data)
result = response.json()
print(result['response'])`,
  
  curl: `# cURL Example
curl -X POST https://api.chatbotbuilder.com/v1/chat \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": "Hello, how can you help me?",
    "language": "en",
    "session_id": "unique-session-id"
  }'`,
};

export const APIPage: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [apiKey, setApiKey] = useState('sk-1234567890abcdef1234567890abcdef');
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [testMessage, setTestMessage] = useState('Hello, how can you help me?');
  const [testResponse, setTestResponse] = useState('');
  const [testing, setTesting] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateNewApiKey = () => {
    const newKey = 'sk-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setApiKey(newKey);
  };

  const testAPI = async () => {
    setTesting(true);
    // Simulate API call
    setTimeout(() => {
      setTestResponse('Hello! I\'m your AI assistant. I can help you with questions about your products, services, and general support. What would you like to know?');
      setTesting(false);
    }, 2000);
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'text-green-600 bg-green-50';
      case 'POST':
        return 'text-blue-600 bg-blue-50';
      case 'PUT':
        return 'text-orange-600 bg-orange-50';
      case 'DELETE':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">API Integration</h1>
            <p className="text-gray-600 mt-1">Integrate your chatbot using our REST API</p>
          </div>
          <div className="flex space-x-3">
            <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
              <Book className="h-4 w-4 mr-2" />
              Documentation
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
              <Play className="h-4 w-4 mr-2" />
              Test API
            </button>
          </div>
        </div>

        {/* API Key Management */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <Key className="h-5 w-5 text-gray-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">API Key</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your API Key
              </label>
              <div className="flex items-center space-x-3">
                <div className="flex-1 relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <button
                  onClick={() => copyToClipboard(apiKey)}
                  className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                >
                  {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={generateNewApiKey}
                  className="bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors flex items-center"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Regenerate
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Keep your API key secure and never share it publicly. Include it in the Authorization header as a Bearer token.
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-yellow-600 mr-2" />
                <p className="text-sm text-yellow-800">
                  <strong>Security Note:</strong> Your API key provides access to your chatbot. Regenerating it will invalidate the current key immediately.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* API Endpoints */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">API Endpoints</h2>
              <div className="space-y-4">
                {endpoints.map((endpoint, index) => (
                  <motion.div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getMethodColor(endpoint.method)}`}>
                        {endpoint.method}
                      </span>
                      <code className="text-sm font-mono text-gray-900">{endpoint.path}</code>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{endpoint.description}</p>
                    {endpoint.params.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-1">Parameters:</p>
                        <div className="flex flex-wrap gap-1">
                          {endpoint.params.map((param, paramIndex) => (
                            <span
                              key={paramIndex}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-mono"
                            >
                              {param}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* API Testing */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Test API</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Message
                  </label>
                  <input
                    type="text"
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter a test message..."
                  />
                </div>
                
                <button
                  onClick={testAPI}
                  disabled={testing}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {testing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Send Test Request
                    </>
                  )}
                </button>

                {testResponse && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Response
                    </label>
                    <div className="bg-gray-50 p-3 rounded-lg border">
                      <p className="text-sm text-gray-900">{testResponse}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Code Examples */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Code Examples</h2>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="curl">cURL</option>
              </select>
            </div>
            
            <div className="relative">
              <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto border max-h-96">
                <code>{codeExamples[selectedLanguage as keyof typeof codeExamples]}</code>
              </pre>
              <button
                onClick={() => copyToClipboard(codeExamples[selectedLanguage as keyof typeof codeExamples])}
                className="absolute top-2 right-2 bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-50 transition-colors flex items-center"
              >
                {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        {/* Usage Stats */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">API Usage</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">1,234</div>
              <div className="text-sm text-gray-600">Requests Today</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">98.5%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">145ms</div>
              <div className="text-sm text-gray-600">Avg Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">5,000</div>
              <div className="text-sm text-gray-600">Monthly Limit</div>
            </div>
          </div>
        </div>

        {/* Rate Limits */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Rate Limits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Current Plan Limits</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Requests per minute</span>
                  <span className="font-medium">100</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Requests per hour</span>
                  <span className="font-medium">1,000</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Requests per day</span>
                  <span className="font-medium">10,000</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Usage This Hour</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Used</span>
                  <span className="font-medium">45 / 1,000</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '4.5%' }}></div>
                </div>
                <p className="text-xs text-gray-500">Resets in 32 minutes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};