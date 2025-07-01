import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Bot,
  User,
  Globe,
  Minimize2,
  Maximize2,
  RefreshCw,
} from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  language?: string;
}

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'ne', name: 'नेपाली', flag: '🇳🇵' },
];

export const PublicChatPage: React.FC = () => {
  const { chatbotId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isMinimized, setIsMinimized] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock chatbot configuration
  const chatbotConfig = {
    companyName: 'TechCorp Support',
    logo: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    primaryColor: '#2563eb',
    welcomeMessage: 'Hi! I\'m your AI assistant. How can I help you today?',
  };

  useEffect(() => {
    // Add welcome message
    setMessages([
      {
        id: '1',
        text: chatbotConfig.welcomeMessage,
        sender: 'bot',
        timestamp: new Date(),
      },
    ]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      language: selectedLanguage,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputMessage, selectedLanguage),
        sender: 'bot',
        timestamp: new Date(),
        language: selectedLanguage,
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const getBotResponse = (message: string, language: string): string => {
    const responses = {
      en: [
        "I understand you're asking about our services. Let me help you with that information.",
        "That's a great question! Based on our documentation, here's what I can tell you...",
        "I'd be happy to assist you with that. Here's the information you need:",
        "Thank you for your question. According to our knowledge base, the answer is:",
      ],
      es: [
        "Entiendo que estás preguntando sobre nuestros servicios. Permíteme ayudarte con esa información.",
        "¡Esa es una gran pregunta! Basándome en nuestra documentación, esto es lo que puedo decirte...",
        "Estaré encantado de ayudarte con eso. Aquí está la información que necesitas:",
      ],
      fr: [
        "Je comprends que vous posez des questions sur nos services. Laissez-moi vous aider avec ces informations.",
        "C'est une excellente question ! D'après notre documentation, voici ce que je peux vous dire...",
        "Je serais ravi de vous aider avec cela. Voici les informations dont vous avez besoin :",
      ],
      hi: [
        "मैं समझता हूं कि आप हमारी सेवाओं के बारे में पूछ रहे हैं। मुझे उस जानकारी के साथ आपकी मदद करने दें।",
        "यह एक बेहतरीन सवाल है! हमारे दस्तावेज़ीकरण के आधार पर, यहाँ है जो मैं आपको बता सकता हूँ...",
      ],
      ne: [
        "म बुझ्छु कि तपाईं हाम्रो सेवाहरूको बारेमा सोध्दै हुनुहुन्छ। मलाई त्यो जानकारीको साथ तपाईंलाई मद्दत गर्न दिनुहोस्।",
        "त्यो एक राम्रो प्रश्न हो! हाम्रो कागजातको आधारमा, यहाँ के छ जुन म तपाईंलाई भन्न सक्छु...",
      ],
    };

    const langResponses = responses[language as keyof typeof responses] || responses.en;
    return langResponses[Math.floor(Math.random() * langResponses.length)];
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <motion.button
          onClick={() => setIsMinimized(false)}
          className="flex items-center space-x-2 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-lg hover:shadow-xl transition-shadow"
          style={{ borderColor: chatbotConfig.primaryColor }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <img
            src={chatbotConfig.logo}
            alt={chatbotConfig.companyName}
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="font-medium text-gray-900">{chatbotConfig.companyName}</span>
          <Maximize2 className="h-4 w-4 text-gray-600" />
        </motion.button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div
          className="p-4 text-white relative"
          style={{ backgroundColor: chatbotConfig.primaryColor }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={chatbotConfig.logo}
                alt={chatbotConfig.companyName}
                className="w-10 h-10 rounded-full object-cover border-2 border-white border-opacity-20"
              />
              <div>
                <h1 className="font-semibold">{chatbotConfig.companyName}</h1>
                <p className="text-xs text-white text-opacity-80">
                  {isTyping ? 'Typing...' : 'Online'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <button
                  onClick={() => setShowLanguageSelector(!showLanguageSelector)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                >
                  <Globe className="h-5 w-5" />
                </button>
                <AnimatePresence>
                  {showLanguageSelector && (
                    <motion.div
                      className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[120px] z-10"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setSelectedLanguage(lang.code);
                            setShowLanguageSelector(false);
                          }}
                          className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 ${
                            selectedLanguage === lang.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                          }`}
                        >
                          <span>{lang.flag}</span>
                          <span className="text-sm">{lang.name}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <button
                onClick={() => setIsMinimized(true)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
              >
                <Minimize2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className={`flex items-start space-x-2 max-w-xs ${
                  message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.sender === 'user' 
                      ? 'bg-gray-300' 
                      : 'bg-gray-100'
                  }`}>
                    {message.sender === 'user' ? (
                      <User className="h-4 w-4 text-gray-600" />
                    ) : (
                      <Bot className="h-4 w-4 text-gray-600" />
                    )}
                  </div>
                  <div className={`rounded-lg px-3 py-2 ${
                    message.sender === 'user'
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`} style={{
                    backgroundColor: message.sender === 'user' ? chatbotConfig.primaryColor : undefined
                  }}>
                    <p className="text-sm">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-white text-opacity-70' : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isTyping && (
            <motion.div
              className="flex justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-start space-x-2 max-w-xs">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-gray-600" />
                </div>
                <div className="bg-gray-100 rounded-lg px-3 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="px-4 py-2 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{ backgroundColor: chatbotConfig.primaryColor }}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Powered by ChatBot Builder
          </p>
        </div>
      </motion.div>
    </div>
  );
};