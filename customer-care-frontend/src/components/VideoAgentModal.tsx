import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Video, VideoOff, Mic, MicOff, PhoneOff, Loader2, AlertCircle } from 'lucide-react';
import { tavusApi } from '../lib/tavus';

interface VideoAgentModalProps {
  onClose: () => void;
  chatbotId: string;
  language: string;
}

const VideoAgentModal: React.FC<VideoAgentModalProps> = ({
  onClose,
  chatbotId,
  language
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversationUrl, setConversationUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [chatbotInfo, setChatbotInfo] = useState<any>(null);
  const [isEnding, setIsEnding] = useState(false);
  const hasEndedRef = useRef(false);

  useEffect(() => {
    startVideoConversation();

    // Cleanup function to ensure call is ended
    return () => {
      if (conversationId && !hasEndedRef.current) {
        endConversationSilently();
      }
    };
  }, []);

  // Handle browser refresh/close
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (conversationId && !hasEndedRef.current) {
        endConversationSilently();
        // Show confirmation dialog
        event.preventDefault();
        event.returnValue = 'You have an active video call. Are you sure you want to leave?';
        return event.returnValue;
      }
    };

    const handleUnload = () => {
      if (conversationId && !hasEndedRef.current) {
        endConversationSilently();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
    };
  }, [conversationId]);

  const startVideoConversation = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const response = await tavusApi.createConversation({
        chatbot_id: chatbotId,
        language: language,
        session_id: `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        max_duration: 1800 // 30 minutes
      });

      setConversationId(response.conversation_id);
      setConversationUrl(response.conversation_url);
      setChatbotInfo(response.chatbot);
      setIsConnected(true);

      console.log('Video conversation started:', response);
    } catch (error: any) {
      console.error('Failed to start video conversation:', error);
      setError(error.message || 'Failed to connect to video agent');
    } finally {
      setIsConnecting(false);
    }
  };

  const endConversationSilently = async () => {
    if (!conversationId || hasEndedRef.current) return;

    hasEndedRef.current = true;

    try {
      // Use navigator.sendBeacon for reliable cleanup during page unload
      if (navigator.sendBeacon) {
        const data = JSON.stringify({ conversation_id: conversationId });
        navigator.sendBeacon(`${import.meta.env.VITE_API_URL || 'https://backend-final-saas.onrender.com/api'}/tavus/conversation/${conversationId}`, data);
      } else {
        // Fallback for browsers that don't support sendBeacon
        await fetch(`${import.meta.env.VITE_API_URL || 'https://backend-final-saas.onrender.com/api'}/tavus/conversation/${conversationId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          keepalive: true // Keep request alive during page unload
        });
      }
    } catch (error) {
      console.error('Error ending conversation silently:', error);
    }
  };

  const endConversation = async () => {
    if (!conversationId || hasEndedRef.current || isEnding) return;

    setIsEnding(true);
    hasEndedRef.current = true;

    try {
      await tavusApi.endConversation(conversationId);
      console.log('Video conversation ended successfully');
    } catch (error) {
      console.error('Error ending conversation:', error);
    } finally {
      setIsEnding(false);
      onClose();
    }
  };

  const handleClose = async () => {
    if (conversationId && !hasEndedRef.current) {
      await endConversation();
    } else {
      onClose();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // In a real implementation, this would control the microphone
    console.log('Microphone', isMuted ? 'unmuted' : 'muted');
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    // In a real implementation, this would control the camera
    console.log('Video', isVideoEnabled ? 'disabled' : 'enabled');
  };

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
        onClick={handleClose}
      />

      {/* Video Container */}
      <motion.div
        className="relative w-full max-w-4xl bg-black rounded-2xl shadow-2xl overflow-hidden"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        style={{ aspectRatio: '16/9', height: '80vh' }}
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full animate-pulse ${isConnected ? 'bg-green-500' : isConnecting ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
              <h3 className="font-semibold text-white">
                {chatbotInfo?.name || 'AI Video Agent'}
              </h3>
              <span className="text-sm text-white/80">
                {isConnecting ? 'Connecting...' : isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            <button
              onClick={handleClose}
              disabled={isEnding}
              className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
            >
              {isEnding ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : (
                <X className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Video Content */}
        <div className="w-full h-full relative">
          {isConnecting && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Connecting to AI Agent</h3>
                <p className="text-gray-400">Please wait while we set up your video session...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-center max-w-md">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Connection Failed</h3>
                <p className="text-gray-400 mb-6">{error}</p>
                <div className="space-x-3">
                  <button
                    onClick={startVideoConversation}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={handleClose}
                    className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {isConnected && conversationUrl && (
            window.location.href = conversationUrl
          )}
          {/* Demo Video Placeholder (when Tavus is not available) */}
          {!conversationUrl && !isConnecting && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900">
              <div className="text-center">
                <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Video className="w-16 h-16 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-2">AI Video Agent</h3>
                <p className="text-white/80 mb-6">Demo mode - Video agent would appear here</p>
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 max-w-md">
                  <p className="text-white/90 text-sm">
                    In production, this would show a live video conversation with an AI agent
                    trained on your company's knowledge base.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-6">
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={toggleMute}
              className={`p-4 rounded-full transition-colors ${isMuted
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-white/20 hover:bg-white/30'
                }`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <MicOff className="w-6 h-6 text-white" />
              ) : (
                <Mic className="w-6 h-6 text-white" />
              )}
            </button>

            <button
              onClick={toggleVideo}
              className={`p-4 rounded-full transition-colors ${!isVideoEnabled
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-white/20 hover:bg-white/30'
                }`}
              title={isVideoEnabled ? 'Turn off video' : 'Turn on video'}
            >
              {isVideoEnabled ? (
                <Video className="w-6 h-6 text-white" />
              ) : (
                <VideoOff className="w-6 h-6 text-white" />
              )}
            </button>

            <button
              onClick={endConversation}
              disabled={isEnding}
              className="p-4 bg-red-600 hover:bg-red-700 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="End call"
            >
              {isEnding ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : (
                <PhoneOff className="w-6 h-6 text-white" />
              )}
            </button>
          </div>

          {/* Call Duration */}
          <div className="text-center mt-4">
            <span className="text-white/80 text-sm">
              {isConnected ? 'Call in progress' : 'Not connected'}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default VideoAgentModal;