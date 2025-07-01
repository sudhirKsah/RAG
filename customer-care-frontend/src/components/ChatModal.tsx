import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minimize2, Bot, Send, User, ThumbsUp, ThumbsDown, Globe, AlertCircle, CheckCircle } from 'lucide-react';
import { ChatMessage } from '../types';
import { api } from '../lib/api';
import ReactMarkdown from 'react-markdown';

interface ChatModalProps {
  onClose: () => void;
  backendStatus: 'connected' | 'disconnected' | 'checking';
  currentChatbotId?: string;
}

const ChatModal: React.FC<ChatModalProps> = ({ onClose, backendStatus, currentChatbotId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: "Hello! I'm Alex, your AI support assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [sessionId] = useState(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      let botResponse: string;
      
      if (backendStatus === 'connected' && currentChatbotId && currentChatbotId !== 'demo-chatbot') {
        // Try to use real backend
        console.log('Sending message to backend:', {
          chatbotId: currentChatbotId,
          message: messageToSend,
          language: selectedLanguage,
          sessionId
        });

        const response = await api.sendMessage(currentChatbotId, {
          message: messageToSend,
          language: selectedLanguage,
          session_id: sessionId,
          conversation_history: messages.slice(-10).map(msg => ({
            role: msg.sender === 'bot' ? 'assistant' : 'user',
            content: msg.content
          }))
        });
        
        botResponse = response.response || 'I apologize, but I encountered an issue processing your request.';
        console.log('Received response from backend:', botResponse);
      } else {
        // Fallback to demo responses
        console.log('Using demo response (backend not connected or demo mode)');
        botResponse = getDemoResponse(messageToSend);
      }

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Fallback to demo response on error
      const fallbackResponse = getDemoResponse(selectedLanguage);
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `${fallbackResponse}\n\n*Note: This is a demo response as the backend connection failed.*`,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const getDemoResponse = (language: string): string => {
    const responses = {
      en: [
        "I understand your concern. Let me help you with that right away.",
        "That's a great question! Based on our knowledge base, here's what I can tell you...",
        "I've found several solutions that might help. Would you like me to walk you through them?",
        "Thank you for providing those details. I'm processing your request now.",
        "I can definitely assist you with that. Let me gather the relevant information.",
        "That's an interesting case. I'm analyzing our database to find the best solution for you.",
        "I appreciate your patience. I'm connecting to our advanced AI systems to provide you with the most accurate answer."
      ],
      es: [
        "Entiendo tu preocupación. Te ayudo con eso de inmediato.",
        "¡Esa es una gran pregunta! Basándome en nuestra base de conocimientos, esto es lo que puedo decirte...",
        "He encontrado varias soluciones que podrían ayudar. ¿Te gustaría que te las explique?"
      ],
      fr: [
        "Je comprends votre préoccupation. Laissez-moi vous aider avec cela tout de suite.",
        "C'est une excellente question ! D'après notre base de connaissances, voici ce que je peux vous dire...",
        "J'ai trouvé plusieurs solutions qui pourraient aider. Voulez-vous que je vous les explique ?"
      ],
      de: [
        "Ich verstehe Ihr Anliegen. Lassen Sie mich Ihnen sofort dabei helfen.",
        "Das ist eine großartige Frage! Basierend auf unserer Wissensdatenbank kann ich Ihnen Folgendes sagen...",
        "Ich habe mehrere Lösungen gefunden, die helfen könnten. Soll ich sie Ihnen erklären?"
      ],
      hi: [
        "मैं आपकी चिंता समझता हूं। मुझे तुरंत इसमें आपकी मदद करने दें।",
        "यह एक बेहतरीन सवाल है! हमारे ज्ञान आधार के आधार पर, यहाँ है जो मैं आपको बता सकता हूँ...",
        "मुझे कई समाधान मिले हैं जो मदद कर सकते हैं। क्या आप चाहेंगे कि मैं उन्हें समझाऊं?"
      ],
      ne: [
        "म तपाईंको चिन्ता बुझ्छु। मलाई तुरुन्तै यसमा तपाईंलाई मद्दत गर्न दिनुहोस्।",
        "यो एक राम्रो प्रश्न हो! हाम्रो ज्ञान आधारको आधारमा, यहाँ के छ जुन म तपाईंलाई भन्न सक्छु...",
        "मैले धेरै समाधानहरू फेला पारेको छु जसले मद्दत गर्न सक्छ। के तपाईं चाहनुहुन्छ कि म तिनीहरूलाई व्याख्या गरूं?"
      ],
      zh: [
        "我理解您的担忧。让我立即帮助您解决这个问题。",
        "这是一个很好的问题！根据我们的知识库，我可以告诉您以下内容...",
        "我找到了几个可能有帮助的解决方案。您希望我为您详细说明吗？"
      ],
      ja: [
        "ご心配をお察しします。すぐにお手伝いさせていただきます。",
        "それは素晴らしい質問ですね！私たちの知識ベースに基づいて、以下のことをお伝えできます...",
        "お役に立てそうな解決策をいくつか見つけました。詳しく説明いたしましょうか？"
      ]
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

  const handleFeedback = async (messageId: string, rating: number) => {
    try {
      if (backendStatus === 'connected' && currentChatbotId !== 'demo-chatbot') {
        await api.submitFeedback({
          conversation_id: messageId,
          rating,
          comment: rating <= 2 ? 'User was not satisfied with the response' : 'User found the response helpful'
        });
        console.log('Feedback submitted successfully');
      } else {
        console.log('Demo mode: Feedback would be submitted in real mode');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'ne', name: 'नेपाली', flag: '🇳🇵' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' }
  ];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Chat Container */}
      <motion.div
        className={`relative w-full max-w-lg bg-black/80 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
          isMinimized ? 'h-16' : 'h-[700px]'
        }`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">AI Assistant</h3>
              <div className="flex items-center space-x-2">
                {backendStatus === 'connected' ? (
                  <>
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-400">Connected & Learning</span>
                  </>
                ) : backendStatus === 'checking' ? (
                  <>
                    <div className="w-3 h-3 border border-yellow-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-yellow-400">Connecting...</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3 text-orange-500" />
                    <span className="text-xs text-orange-400">Demo Mode</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLanguageSelector(!showLanguageSelector)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Globe className="w-4 h-4 text-white/60" />
              </button>
              <AnimatePresence>
                {showLanguageSelector && (
                  <motion.div
                    className="absolute top-full right-0 mt-2 bg-black/90 backdrop-blur-md border border-white/20 rounded-lg shadow-lg py-2 min-w-[140px] z-10"
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
                        className={`w-full px-3 py-2 text-left hover:bg-white/10 flex items-center space-x-2 transition-colors ${
                          selectedLanguage === lang.code ? 'bg-blue-500/20 text-blue-300' : 'text-white/80'
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
            
            <motion.button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Minimize2 className="w-4 h-4 text-white/60" />
            </motion.button>
            <motion.button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-4 h-4 text-white/60" />
            </motion.button>
          </div>
        </div>

        {/* Chat Messages */}
        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              className="flex-1 overflow-y-auto p-4 space-y-4 h-[500px]"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 500 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Backend Status Message */}
              {backendStatus === 'disconnected' && (
                <motion.div
                  className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 mb-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-orange-400" />
                    <p className="text-orange-400 text-sm">
                      Demo mode active. Start backend for full AI functionality.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Chatbot ID Display */}
              {currentChatbotId && currentChatbotId !== 'demo-chatbot' && (
                <motion.div
                  className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-400" />
                    <p className="text-blue-400 text-sm">
                      Connected to chatbot: <code className="bg-blue-500/20 px-1 rounded">{currentChatbotId}</code>
                    </p>
                  </div>
                </motion.div>
              )}

              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={`flex items-start space-x-2 max-w-[80%] ${
                    message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.sender === 'user' 
                        ? 'bg-gradient-to-br from-green-500 to-teal-600' 
                        : 'bg-gradient-to-br from-blue-500 to-purple-600'
                    }`}>
                      {message.sender === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    
                    <div className="flex flex-col">
                      <div className={`px-4 py-3 rounded-2xl ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg'
                          : 'bg-white/10 text-white border border-white/20'
                      }`}>
                      <ReactMarkdown
                        components={{
                          p: ({ node, ...props }) => (
                            <p className="text-sm leading-relaxed whitespace-pre-wrap" {...props} />
                          ),
                          // If messages can have `code`, `strong`, etc., add them here
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                        <span className="text-xs opacity-60 mt-1 block">
                          {message.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      
                      {/* Feedback buttons for bot messages */}
                      {message.sender === 'bot' && (
                        <div className="flex items-center space-x-2 mt-2 ml-2">
                          <button
                            onClick={() => handleFeedback(message.id, 5)}
                            className="p-1 hover:bg-white/10 rounded-full transition-colors"
                            title="Helpful"
                          >
                            <ThumbsUp className="w-3 h-3 text-white/60 hover:text-green-400" />
                          </button>
                          <button
                            onClick={() => handleFeedback(message.id, 1)}
                            className="p-1 hover:bg-white/10 rounded-full transition-colors"
                            title="Not helpful"
                          >
                            <ThumbsDown className="w-3 h-3 text-white/60 hover:text-red-400" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  className="flex justify-start"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="flex items-start space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white/10 border border-white/20 px-4 py-3 rounded-2xl">
                      <div className="typing-indicator">
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Section */}
        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              className="p-4 border-t border-white/10 bg-black/40"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-end space-x-3">
                <div className="flex-1">
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                    rows={1}
                    style={{ minHeight: '44px', maxHeight: '120px' }}
                  />
                </div>
                
                <motion.button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>
              
              <p className="text-xs text-white/40 mt-2 text-center">
                {backendStatus === 'connected' 
                  ? `Powered by advanced AI • Chatbot: ${currentChatbotId?.substring(0, 8)}...` 
                  : 'Demo mode • Connect backend for full functionality'
                }
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default ChatModal;