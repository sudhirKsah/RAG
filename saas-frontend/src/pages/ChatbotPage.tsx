import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { ChromePicker } from 'react-color';
import { toast } from 'react-hot-toast';
import { api } from '../lib/api';
import {
  Bot,
  Settings,
  Palette,
  MessageCircle,
  Globe,
  Upload,
  Save,
  Eye,
  Copy,
  ExternalLink,
  Send,
  Loader2,
  Video,
  Info,
  FileText,
} from 'lucide-react';

const aiModels = [
  { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI', description: 'Most capable model' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI', description: 'Fast and efficient' },
  { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google', description: 'Google\'s advanced model' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'Google', description: 'Google\'s fastest model' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'Google', description: 'Google\'s better and fastest model' },
];

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'ne', name: 'Nepali', flag: '🇳🇵' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
];

interface ChatMessage {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

export const ChatbotPage: React.FC = () => {
  const [chatbotId, setChatbotId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState('gpt-3.5-turbo');
  const [selectedLanguages, setSelectedLanguages] = useState(['en']);
  const [companyName, setCompanyName] = useState('Your Company');
  const [welcomeMessage, setWelcomeMessage] = useState('Hi! How can I help you today?');
  const [primaryColor, setPrimaryColor] = useState('#2563eb');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);
  const [videoKeywords, setVideoKeywords] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Live preview chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [sessionId] = useState(`session_${Date.now()}`);

  // Load existing chatbot data on component mount
  useEffect(() => {
    loadChatbotData();
  }, []);

  // Initialize chat with welcome message when chatbot data loads
  useEffect(() => {
    if (chatbotId && chatMessages.length === 0) {
      setChatMessages([{
        id: '1',
        content: welcomeMessage,
        isBot: true,
        timestamp: new Date()
      }]);
    }
  }, [chatbotId, welcomeMessage]);

  const loadChatbotData = async () => {
    try {
      setIsLoading(true);
      const response = await api.getChatbots();
      
      if (response.ok) {
        const result = await response.json();
        const chatbots = result.data.chatbots;
        
        if (chatbots.length > 0) {
          // Load existing chatbot
          const chatbot = chatbots[0];
          setChatbotId(chatbot.id);
          setCompanyName(chatbot.name || 'Your Company');
          setSelectedModel(chatbot.ai_model || 'gpt-3.5-turbo');
          setWelcomeMessage(chatbot.welcome_message || 'Hi! How can I help you today?');
          setPrimaryColor(chatbot.primary_color || '#2563eb');
          setSelectedLanguages(chatbot.supported_languages || ['en']);
          setLogo(chatbot.logo_url || null);
          setVideoKeywords(chatbot.video_keywords || '');
        } else {
          // Create new chatbot
          await createNewChatbot();
        }
      } else {
        throw new Error('Failed to load chatbots');
      }
    } catch (error) {
      console.error('Error loading chatbot data:', error);
      toast.error('Failed to load chatbot data');
    } finally {
      setIsLoading(false);
    }
  };

  const createNewChatbot = async () => {
    try {
      const response = await api.createChatbot({
        name: companyName,
        ai_model: selectedModel,
        welcome_message: welcomeMessage,
        primary_color: primaryColor,
        supported_languages: selectedLanguages,
        logo_url: logo || '',
        video_keywords: videoKeywords
      });

      if (response.ok) {
        const result = await response.json();
        setChatbotId(result.data.chatbot.id);
        toast.success('New chatbot created successfully!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create chatbot');
      }
    } catch (error) {
      console.error('Error creating chatbot:', error);
      toast.error(`Failed to create chatbot: ${error.message}`);
    }
  };

  const handleSaveChanges = async () => {
    if (!chatbotId) {
      await createNewChatbot();
      return;
    }

    try {
      setIsSaving(true);
      const response = await api.updateChatbot(chatbotId, {
        name: companyName,
        ai_model: selectedModel,
        welcome_message: welcomeMessage,
        primary_color: primaryColor,
        supported_languages: selectedLanguages,
        logo_url: logo || '',
        video_keywords: videoKeywords
      });
      
      if (response.ok) {
        toast.success('Chatbot settings saved successfully!');
        
        // Update the welcome message in chat if it changed
        setChatMessages(prev => {
          const updated = [...prev];
          if (updated.length > 0 && updated[0].isBot) {
            updated[0] = {
              ...updated[0],
              content: welcomeMessage
            };
          }
          return updated;
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save chatbot settings');
      }
    } catch (error) {
      console.error('Error saving chatbot:', error);
      toast.error(`Failed to save chatbot settings: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLanguageToggle = (langCode: string) => {
    setSelectedLanguages(prev => {
      if (prev.includes(langCode)) {
        return prev.filter(code => code !== langCode);
      } else {
        return [...prev, langCode];
      }
    });
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogo(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !chatbotId || isSendingMessage) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: currentMessage,
      isBot: false,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    const messageToSend = currentMessage;
    setCurrentMessage('');
    setIsSendingMessage(true);

    try {
      const response = await api.sendMessage(chatbotId, {
        message: messageToSend,
        language: selectedLanguages[0] || 'en',
        session_id: sessionId,
        conversation_history: chatMessages.slice(-10).map(msg => ({
          role: msg.isBot ? 'assistant' : 'user',
          content: msg.content
        }))
      });
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.response || 'Sorry, I encountered an error. Please try again.',
        isBot: true,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        isBot: true,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
      toast.error(`Failed to send message: ${error.message}`);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const chatbotUrl = chatbotId ? `${import.meta.env.VITE_CHATBOT_URL}/chat/${chatbotId}` : '';

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(chatbotUrl);
    toast.success('URL copied to clipboard!');
  };

  const handleCopyEmbedCode = () => {
    const embedCode = `<iframe src="${chatbotUrl}" width="400" height="600" frameborder="0"></iframe>`;
    navigator.clipboard.writeText(embedCode);
    toast.success('Embed code copied to clipboard!');
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Chatbot Configuration</h1>
            <p className="text-gray-600 mt-1">Customize your AI chatbot's appearance and behavior</p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => window.open(chatbotUrl, '_blank')}
              disabled={!chatbotId}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </button>
            <button 
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Settings */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <Settings className="h-5 w-5 text-gray-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Basic Settings</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chatbot Name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your chatbot name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    AI Model
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {aiModels.map(model => (
                      <option key={model.id} value={model.id}>
                        {model.name} - {model.provider}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Welcome Message
                </label>
                <textarea
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your chatbot's welcome message..."
                />
              </div>
            </div>

            {/* Video Agent Settings */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <Video className="h-5 w-5 text-gray-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Video Agent Settings</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video Agent Keywords
                  </label>
                  <textarea
                    value={videoKeywords}
                    onChange={(e) => setVideoKeywords(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter keywords related to your uploaded documents for better video agent responses (e.g., product features, pricing, support policies, company information, services, troubleshooting guides)"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    <FileText className="h-4 w-4 inline mr-1" />
                    These keywords help the video agent find relevant information from your uploaded documents. 
                    Include terms that customers might ask about.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Video Agent Testing</p>
                      <p>
                        To test the video agent functionality, visit your deployed chatbot URL and select the "Video Agent Support" option. 
                        The video agent will use these keywords to provide contextual responses based on your uploaded documents.
                      </p>
                      {chatbotUrl && (
                        <div className="mt-2">
                          <a 
                            href={chatbotUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 underline flex items-center"
                          >
                            Test Video Agent
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Appearance */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <Palette className="h-5 w-5 text-gray-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Appearance</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Logo
                  </label>
                  <div className="flex items-center space-x-4">
                    {logo ? (
                      <img src={logo} alt="Logo" className="w-16 h-16 object-contain border border-gray-200 rounded-lg" />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
                        <Bot className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      <Upload className="h-4 w-4 inline mr-2" />
                      Upload Logo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Color
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setShowColorPicker(!showColorPicker)}
                      className="w-12 h-10 rounded-lg border border-gray-300 shadow-sm"
                      style={{ backgroundColor: primaryColor }}
                    />
                    <span className="text-sm text-gray-600">{primaryColor}</span>
                  </div>
                  {showColorPicker && (
                    <div className="absolute z-10 mt-2">
                      <div
                        className="fixed inset-0"
                        onClick={() => setShowColorPicker(false)}
                      />
                      <ChromePicker
                        color={primaryColor}
                        onChange={(color) => setPrimaryColor(color.hex)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Languages */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <Globe className="h-5 w-5 text-gray-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Supported Languages</h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {languages.map(lang => (
                  <label
                    key={lang.code}
                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedLanguages.includes(lang.code)
                        ? 'border-gray-200 hover:bg-gray-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      checked={selectedLanguages.includes(lang.code)}
                      onChange={() => handleLanguageToggle(lang.code)}
                      className="sr-only"
                    />
                    <span className="text-xl mr-2">{lang.flag}</span>
                    <span className="text-sm font-medium">{lang.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Deployment */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <ExternalLink className="h-5 w-5 text-gray-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Deployment</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chatbot URL
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={chatbotUrl}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                    <button 
                      onClick={handleCopyUrl}
                      className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">Embed Code</h3>
                    <button 
                      onClick={handleCopyEmbedCode}
                      className="text-sm bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  <code className="text-sm text-gray-600 bg-white p-2 rounded border block break-all">
                    {`<iframe src="${chatbotUrl}" width="400" height="600" frameborder="0"></iframe>`}
                  </code>
                </div>
              </div>
            </div>
          </div>

          {/* Live Preview Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6">
              <div className="flex items-center mb-6">
                <MessageCircle className="h-5 w-5 text-gray-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Live Preview</h2>
              </div>
              
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Chatbot Header */}
                <div className="p-4 border-b border-gray-200" style={{ backgroundColor: primaryColor }}>
                  <div className="flex items-center space-x-3">
                    {logo ? (
                      <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
                    ) : (
                      <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium text-white">{companyName}</h3>
                      <p className="text-xs text-white text-opacity-80">Online</p>
                    </div>
                  </div>
                </div>
                
                {/* Chat Messages */}
                <div className="p-4 h-64 overflow-y-auto bg-gray-50 space-y-3">
                  {chatMessages.map((message) => (
                    <div key={message.id} className={`flex items-start space-x-2 ${message.isBot ? '' : 'justify-end'}`}>
                      {message.isBot && (
                        <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot className="h-3 w-3 text-gray-600" />
                        </div>
                      )}
                      <div 
                        className={`p-3 rounded-lg max-w-xs ${
                          message.isBot 
                            ? 'bg-white shadow-sm' 
                            : 'text-white'
                        }`}
                        style={!message.isBot ? { backgroundColor: primaryColor } : {}}
                      >
                        <p className={`text-sm ${message.isBot ? 'text-gray-900' : 'text-white'}`}>
                          {message.content}
                        </p>
                      </div>
                      {!message.isBot && (
                        <div className="w-6 h-6 bg-gray-300 rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                  ))}
                  
                  {isSendingMessage && (
                    <div className="flex items-start space-x-2">
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="h-3 w-3 text-gray-600" />
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-sm max-w-xs">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Chat Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isSendingMessage}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!currentMessage.trim() || isSendingMessage}
                      className="px-4 py-2 rounded-lg text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {isSendingMessage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Supports {selectedLanguages.length} language{selectedLanguages.length !== 1 ? 's' : ''}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Model: {aiModels.find(m => m.id === selectedModel)?.name}
                </p>
                {chatbotId && (
                  <p className="text-xs text-gray-500 mt-1">
                    ID: {chatbotId}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};