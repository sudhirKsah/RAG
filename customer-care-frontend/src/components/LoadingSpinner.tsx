import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Sparkles } from 'lucide-react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        {/* Animated Logo */}
        <motion.div
          className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Bot className="w-10 h-10 text-white" />
        </motion.div>

        {/* Loading Text */}
        <motion.h2
          className="text-2xl font-bold text-white mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Initializing Support Portal
        </motion.h2>

        {/* Animated Dots */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>

        {/* Loading Progress */}
        <div className="w-64 mx-auto">
          <div className="bg-white/10 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          </div>
        </div>

        {/* Sparkles */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 2) * 40}%`,
              }}
              animate={{
                scale: [0, 1, 0],
                rotate: [0, 180, 360],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;