import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import white_circle_360x360 from '../assets/white_circle_360x360.png';

import { 
  Brain, 
  Users, 
  Headphones, 
  Mail, 
  Sparkles,
  ArrowRight,
  MessageCircle,
  Video,
  AlertCircle,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import Spline from '@splinetool/react-spline';
import { companyData } from '../data/companyData';
import { ContactOption } from '../types';
import ChatModal from './ChatModal';
import VideoAgentModal from './VideoAgentModal';
import ChatOptionsModal from './ChatOptionsModal';
import FloatingElements from './FloatingElements';
import LoadingSpinner from './LoadingSpinner';
import { api } from '../lib/api';

const CustomerSupportPage: React.FC = () => {
  const { chatbotId } = useParams<{ chatbotId?: string }>();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [showChatOptions, setShowChatOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [backgroundError, setBackgroundError] = useState(false);
  const [robotError, setRobotError] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [currentChatbot, setCurrentChatbot] = useState<any>(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 120
      }
    }
  };

  // Check backend connection and load chatbot
  useEffect(() => {
    const checkBackendConnection = async () => {
      try {
        setBackendStatus('checking');
        
        // First check if backend is healthy
        await api.healthCheck();
        console.log('Backend health check passed');
        
        // If we have a chatbot ID from URL, try to get that specific chatbot
        if (chatbotId) {
          try {
            const chatbotStatus = await api.getChatbotStatus(chatbotId);
            console.log('Chatbot status:', chatbotStatus);
            
            // Set the current chatbot from URL parameter
            setCurrentChatbot({
              id: chatbotId,
              name: chatbotStatus.chatbot?.name || 'AI Assistant',
              status: chatbotStatus.status || 'active'
            });
            
            console.log('Loaded specific chatbot from URL:', chatbotId);
          } catch (chatbotError) {
            console.warn('Could not load specific chatbot:', chatbotError);
            
            // Set a default chatbot for demo purposes
            setCurrentChatbot({
              id: chatbotId,
              name: 'AI Assistant',
              status: 'active'
            });
          }
        } else {
          // No specific chatbot ID, set demo chatbot
          setCurrentChatbot({
            id: 'demo-chatbot',
            name: 'AI Assistant',
            status: 'active'
          });
        }
        
        setBackendStatus('connected');
        console.log('Backend connection established');
        
      } catch (error) {
        console.warn('Backend connection failed:', error);
        setBackendStatus('disconnected');
        
        // Set demo chatbot for offline mode
        setCurrentChatbot({
          id: chatbotId || 'demo-chatbot',
          name: 'AI Assistant',
          status: 'demo'
        });
      }
    };

    checkBackendConnection();
  }, [chatbotId]);

  // Auto-open chat options if we have a chatbot ID in URL
  useEffect(() => {
    if (chatbotId && currentChatbot && backendStatus !== 'checking') {
      // Small delay to let the page load first
      const timer = setTimeout(() => {
        setShowChatOptions(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [chatbotId, currentChatbot, backendStatus]);

  // Initialize loading timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);


  // Contact options
  const contactOptions: ContactOption[] = [
    {
      icon: MessageCircle,
      title: "Text Chat Support",
      description: backendStatus === 'connected' 
        ? currentChatbot 
          ? `Chat with ${currentChatbot.name} - Intelligent responses powered by advanced AI`
          : "Instant intelligent responses with human-like understanding"
        : "Demo mode - Connect backend for full AI functionality",
      gradient: "from-blue-500 via-purple-500 to-pink-500",
      badge: backendStatus === 'connected' 
        ? currentChatbot ? "Live AI" : "Connected" 
        : "Demo Mode",
      badgeColor: backendStatus === 'connected' 
        ? "bg-gradient-to-r from-green-500 to-emerald-500" 
        : "bg-gradient-to-r from-yellow-500 to-orange-500"
    },
    {
      icon: Video,
      title: "Video Agent Support",
      description: "Talk face-to-face with our AI video agent powered by Tavus technology",
      gradient: "from-purple-500 via-pink-500 to-red-500",
      badge: "AI Video",
      badgeColor: "bg-gradient-to-r from-purple-500 to-pink-500"
    },
    {
      icon: Headphones,
      title: "Expert Human Support",
      description: "Connect with our specialized support engineers",
      gradient: "from-green-500 via-teal-500 to-cyan-500",
      badge: "Premium",
      badgeColor: "bg-gradient-to-r from-green-500 to-teal-500"
    },
    {
      icon: Mail,
      title: "Priority Email",
      description: "Detailed support with comprehensive documentation",
      gradient: "from-orange-500 via-red-500 to-pink-500"
    }
  ];

  // Fallback Background Component
  const FallbackBackground = () => (
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20 animate-pulse" />
      <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-black/40 to-black/80" />
      {/* Animated particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 2}s`
          }}
        />
      ))}
    </div>
  );

  // Fallback Robot Component
  const FallbackRobot = () => (
    <div className="h-96 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center">
      <motion.div
        className="relative"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center relative overflow-hidden">
          {/* Robot face */}
          <div className="relative z-10">
          <a href="https://bolt.new/" target="_blank" rel="noopener noreferrer">
              <img 
                src={white_circle_360x360} 
                alt="ChatBot Builder Logo" 
                className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 rounded-full shadow-lg" 
              />
            </a>          </div>
          
          {/* Animated glow */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-cyan-400/30 to-pink-400/30 rounded-3xl"
            animate={{
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Pulse rings */}
          <motion.div
            className="absolute inset-0 border-2 border-white/20 rounded-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0, 1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
        
        {/* Status indicator */}
        <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full border-2 border-black animate-pulse flex items-center justify-center ${
          backendStatus === 'connected' ? 'bg-green-500' : 
          backendStatus === 'checking' ? 'bg-yellow-500' : 'bg-red-500'
        }`}>
          <div className="w-2 h-2 bg-white rounded-full" />
        </div>
      </motion.div>
    </div>
  );

  // Backend Status Indicator
  const BackendStatusIndicator = () => (
    <motion.div
      className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
        backendStatus === 'connected' ? 'bg-green-500/20 text-green-400' :
        backendStatus === 'checking' ? 'bg-yellow-500/20 text-yellow-400' :
        'bg-red-500/20 text-red-400'
      }`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {backendStatus === 'connected' ? (
        <>
          <CheckCircle className="w-4 h-4" />
          <span>Backend Connected</span>
        </>
      ) : backendStatus === 'checking' ? (
        <>
          <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          <span>Connecting...</span>
        </>
      ) : (
        <>
          <AlertCircle className="w-4 h-4" />
          <span>Demo Mode</span>
        </>
      )}
    </motion.div>
  );

  const handleContactOptionClick = (option: ContactOption) => {
    if (option.title === "Text Chat Support") {
      setIsChatOpen(true);
    } else if (option.title === "Video Agent Support") {
      setIsVideoOpen(true);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background 3D Scene with Fallback */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/80 z-10" />
        {!backgroundError ? (
          <Spline 
          scene="https://prod.spline.design/4FeHLcZkkabLyUkg/scene.splinecode" 
          onError={() => setBackgroundError(true)}
          />
        ) : (
          <FallbackBackground />
        )}
      </div>

      {/* Floating Elements */}
      <FloatingElements />

      {/* Main Content */}
      <motion.div
        className="relative z-20 min-h-screen"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.header 
          className="px-6 py-8"
          variants={itemVariants}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <a href="https://bolt.new/" target="_blank" rel="noopener noreferrer">
              <img 
                src={white_circle_360x360} 
                alt="ChatBot Builder Logo" 
                className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 rounded-full shadow-lg" 
              />
            </a>                </div>
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-black animate-pulse ${
                  backendStatus === 'connected' ? 'bg-green-500' : 
                  backendStatus === 'checking' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">
                  {currentChatbot?.name || companyData.companyName}
                </h1>
                <p className="text-white/60 text-sm">
                  {chatbotId ? 'AI Support Assistant' : 'Next-Gen Support Center'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <BackendStatusIndicator />
              {chatbotId && (
                <div className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded-full">
                  ID: {chatbotId.substring(0, 8)}...
                </div>
              )}
              <motion.button
                onClick={() => setShowChatOptions(true)}
                className="gradient-button px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 shadow-lg hover:shadow-glow-blue transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Brain className="w-5 h-5" />
                <span>Get Support</span>
              </motion.button>
            </div>
          </div>
        </motion.header>

        {/* Hero Section */}
        <motion.section 
          className="px-6 py-16 text-center"
          variants={itemVariants}
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
              <span className="text-white/80 text-lg">
                {backendStatus === 'connected' ? 'AI Online' : 'Demo Mode'}
              </span>
              <div className="flex items-center space-x-1 text-white/60">
                <Users className="w-4 h-4" />
                <span className="text-sm">{companyData.activeUsers} active</span>
              </div>
            </div>
            
            <motion.h2 
              className="text-6xl md:text-7xl font-bold mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <span className="gradient-text">Support</span>
              <br />
              <span className="text-white">Reimagined</span>
            </motion.h2>
            
            <motion.p 
              className="text-xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed"
              variants={itemVariants}
            >
              Experience the future of customer support with our{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent font-semibold">
                AI-powered platform
              </span>{' '}
              that evolves with every interaction.
            </motion.p>

            {/* Chatbot-specific information */}
            {chatbotId && currentChatbot && (
              <motion.div
                className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-8 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-blue-400" />
                  <p className="text-blue-400">
                    Connected to <strong>{currentChatbot.name}</strong>
                  </p>
                  <ExternalLink className="w-4 h-4 text-blue-400/60" />
                </div>
              </motion.div>
            )}

            {/* Backend Status Message */}
            {backendStatus === 'disconnected' && (
              <motion.div
                className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-8 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                <p className="text-yellow-400 text-sm">
                  <AlertCircle className="w-4 h-4 inline mr-2" />
                  Running in demo mode. Start the backend server for full AI functionality.
                </p>
              </motion.div>
            )}
          </div>
        </motion.section>

        {/* Main Content Grid */}
        <motion.section 
          className="px-6 py-16"
          variants={itemVariants}
        >
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Options */}
              <div className="space-y-6">
                <h3 className="text-3xl font-bold text-white mb-8">
                  Choose Your Support Experience
                </h3>
                
                {contactOptions.map((option) => (
                  <motion.div
                    key={option.title}
                    className="glass-card p-6 group cursor-pointer relative overflow-hidden"
                    variants={itemVariants}
                    whileHover={{ 
                      scale: 1.02,
                      transition: { type: "spring", stiffness: 300 }
                    }}
                    onClick={() => handleContactOptionClick(option)}
                  >
                    {option.badge && (
                      <div className={`absolute top-4 right-4 ${option.badgeColor} px-3 py-1 rounded-full text-xs font-semibold text-white`}>
                        {option.badge}
                      </div>
                    )}
                    
                    <div className="flex items-start space-x-4">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${option.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <option.icon className="w-7 h-7 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                          {option.title}
                        </h4>
                        <p className="text-white/70 leading-relaxed">
                          {option.description}
                        </p>
                      </div>
                      
                      <motion.div
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        whileHover={{ x: 5 }}
                      >
                        <ArrowRight className="w-5 h-5 text-white/60" />
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* 3D Robot Section with Fallback */}
              <motion.div
                className="glass-card p-8 text-center"
                variants={itemVariants}
              >
                <div className="mb-6">
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <div className={`w-3 h-3 rounded-full animate-pulse ${
                      backendStatus === 'connected' ? 'bg-green-500' : 
                      backendStatus === 'checking' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <span className="text-white/80 font-medium">
                      {backendStatus === 'connected' ? 'AI Assistant Active' : 
                       backendStatus === 'checking' ? 'AI Assistant Loading' : 'AI Assistant Demo'}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Meet {currentChatbot?.name || 'Alex'}
                  </h3>
                  <p className="text-white/60">
                    Your intelligent support companion
                  </p>
                  
                  {chatbotId && (
                    <p className="text-sm text-blue-400 mt-2">
                      Chatbot ID: {chatbotId}
                    </p>
                  )}
                </div>

                {/* 3D Robot Container with Fallback */}
                <div className="mb-6">
                  {!robotError ? (
                    <div className="h-96 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                      <Spline 
                        scene="https://prod.spline.design/u4g2Ifqg6oNbZzfn/scene.splinecode"
                        onError={() => setRobotError(true)}
                      />
                    </div>
                  ) : (
                    <FallbackRobot />
                  )}
                </div>

                <motion.button
                  onClick={() => setShowChatOptions(true)}
                  className="w-full gradient-button py-4 rounded-xl font-semibold flex items-center justify-center space-x-2 shadow-lg hover:shadow-glow-purple transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Start Conversation</span>
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.section>
      </motion.div>

      {/* Chat Options Modal */}
      <AnimatePresence>
        {showChatOptions && (
          <ChatOptionsModal
            onClose={() => setShowChatOptions(false)}
            onSelectTextChat={() => {
              setShowChatOptions(false);
              setIsChatOpen(true);
            }}
            onSelectVideoChat={() => {
              setShowChatOptions(false);
              setIsVideoOpen(true);
            }}
            backendStatus={backendStatus}
          />
        )}
      </AnimatePresence>

      {/* Text Chat Modal */}
      <AnimatePresence>
        {isChatOpen && (
          <ChatModal 
            onClose={() => setIsChatOpen(false)} 
            backendStatus={backendStatus}
            currentChatbotId={chatbotId || currentChatbot?.id}
          />
        )}
      </AnimatePresence>

      {/* Video Agent Modal */}
      <AnimatePresence>
        {isVideoOpen && (
          <VideoAgentModal
            onClose={() => setIsVideoOpen(false)}
            chatbotId={chatbotId || currentChatbot?.id || 'demo'}
            language="en"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomerSupportPage;