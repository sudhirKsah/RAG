import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Video, X, Bot, Users } from 'lucide-react';

interface ChatOptionsModalProps {
  onClose: () => void;
  onSelectTextChat: () => void;
  onSelectVideoChat: () => void;
  backendStatus: 'connected' | 'disconnected' | 'checking';
}

const ChatOptionsModal: React.FC<ChatOptionsModalProps> = ({
  onClose,
  onSelectTextChat,
  onSelectVideoChat,
  backendStatus
}) => {
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

      {/* Modal Container */}
      <motion.div
        className="relative w-full max-w-md bg-black/80 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Choose Support Type</h2>
              <p className="text-white/70 text-sm mt-1">How would you like to get help today?</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>
        </div>

        {/* Options */}
        <div className="p-6 space-y-4">
          {/* Text Chat Option */}
          <motion.button
            onClick={onSelectTextChat}
            className="w-full p-6 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all duration-300 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                  Text Chat
                </h3>
                <p className="text-white/70 text-sm mt-1">
                  Chat with our AI assistant via text messages
                </p>
                <div className="flex items-center mt-2">
                  <Bot className="w-4 h-4 text-blue-400 mr-1" />
                  <span className="text-xs text-blue-400">
                    {backendStatus === 'connected' ? 'AI Powered' : 'Demo Mode'}
                  </span>
                </div>
              </div>
            </div>
          </motion.button>

          {/* Video Chat Option */}
          <motion.button
            onClick={onSelectVideoChat}
            className="w-full p-6 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all duration-300 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Video className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                  Video Agent
                </h3>
                <p className="text-white/70 text-sm mt-1">
                  Talk face-to-face with our AI video agent
                </p>
                <div className="flex items-center mt-2">
                  <Users className="w-4 h-4 text-purple-400 mr-1" />
                  <span className="text-xs text-purple-400">
                    Powered by Tavus AI
                  </span>
                </div>
              </div>
            </div>
          </motion.button>

          {/* Features Comparison */}
          <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
            <h4 className="text-sm font-medium text-white mb-3">Features</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-white/70">Response Speed</span>
                <div className="flex space-x-4">
                  <span className="text-blue-400">Fast</span>
                  <span className="text-purple-400">Real-time</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Interaction Type</span>
                <div className="flex space-x-4">
                  <span className="text-blue-400">Text</span>
                  <span className="text-purple-400">Voice & Video</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Best For</span>
                <div className="flex space-x-4">
                  <span className="text-blue-400">Quick Q&A</span>
                  <span className="text-purple-400">Complex Issues</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ChatOptionsModal;