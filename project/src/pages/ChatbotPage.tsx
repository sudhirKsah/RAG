import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { ChromePicker } from 'react-color';
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
} from 'lucide-react';

const aiModels = [
  { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI', description: 'Most capable model' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI', description: 'Fast and efficient' },
  { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google', description: 'Google\'s advanced model' },
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

export const ChatbotPage: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [selectedLanguages, setSelectedLanguages] = useState(['en']);
  const [companyName, setCompanyName] = useState('Your Company');
  const [welcomeMessage, setWelcomeMessage] = useState('Hi! How can I help you today?');
  const [primaryColor, setPrimaryColor] = useState('#2563eb');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);

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

  const chatbotUrl = `https://chat.${companyName.toLowerCase().replace(/\s+/g, '')}.com`;

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
            <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
              <Save className="h-4 w-4 mr-2" />
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
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
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
                    <button className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Embed Code</h3>
                  <code className="text-sm text-gray-600 bg-white p-2 rounded border block">
                    {`<iframe src="${chatbotUrl}" width="400" height="600"></iframe>`}
                  </code>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
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
                <div className="p-4 h-64 overflow-y-auto bg-gray-50">
                  <div className="mb-4">
                    <div className="flex items-start space-x-2">
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="h-3 w-3 text-gray-600" />
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-sm max-w-xs">
                        <p className="text-sm text-gray-900">{welcomeMessage}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-start space-x-2 justify-end">
                      <div className="p-3 rounded-lg max-w-xs" style={{ backgroundColor: primaryColor }}>
                        <p className="text-sm text-white">Hello! I need help with your product.</p>
                      </div>
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex-shrink-0"></div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-start space-x-2">
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="h-3 w-3 text-gray-600" />
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-sm max-w-xs">
                        <p className="text-sm text-gray-900">I'd be happy to help! What specific information are you looking for?</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Chat Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      disabled
                    />
                    <button
                      className="px-4 py-2 rounded-lg text-white text-sm"
                      style={{ backgroundColor: primaryColor }}
                      disabled
                    >
                      Send
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};