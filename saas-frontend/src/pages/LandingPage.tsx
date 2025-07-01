import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import white_circle_360x360 from '../assets/white_circle_360x360.png'
import {
  Bot,
  Globe,
  Zap,
  Shield,
  BarChart3,
  Users,
  ArrowRight,
  CheckCircle,
  MessageCircle,
  FileText,
  Code,
  Star,
  Sparkles,
} from 'lucide-react';

const features = [
  {
    icon: Bot,
    title: 'AI-Powered Chatbots',
    description: 'Create intelligent chatbots powered by GPT-4 and Gemini models',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Globe,
    title: 'Multilingual Support',
    description: 'Support for 50+ languages including Hindi, Spanish, and more',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: FileText,
    title: 'Document Training',
    description: 'Upload your documents and train chatbots with your business knowledge',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: Zap,
    title: 'Instant Deployment',
    description: 'Deploy your chatbot with a single click and get a public URL',
    gradient: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Code,
    title: 'API Integration',
    description: 'Easy API integration for developers and custom implementations',
    gradient: 'from-indigo-500 to-purple-500',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Track conversations, usage metrics, and performance insights',
    gradient: 'from-red-500 to-pink-500',
  },
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    company: 'TechCorp Inc.',
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    quote: 'ChatBot Builder transformed our customer support. We went from 24-hour response times to instant replies.',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    company: 'StartupXYZ',
    image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    quote: 'The multilingual support is incredible. Our global customers can now get help in their native language.',
    rating: 5,
  },
  {
    name: 'Emily Rodriguez',
    company: 'HealthPlus',
    image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    quote: 'Training the chatbot with our medical documentation was seamless. It answers complex questions accurately.',
    rating: 5,
  },
];

const stats = [
  { number: '10K+', label: 'Active Users' },
  { number: '50M+', label: 'Messages Processed' },
  { number: '99.9%', label: 'Uptime' },
  { number: '24/7', label: 'Support' },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 120,
    },
  },
};

const floatingVariants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-x-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <motion.header 
        className="relative z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 lg:py-6">
                           <a href="https://bolt.new/" >
  <img 
    src={white_circle_360x360} 
    alt="ChatBot Builder Logo" 
    className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 rounded-full shadow-lg" 
  />
</a>
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
              </div>
              <div>
                <span className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                   ChatBot Builder
                </span>
                <div className="hidden sm:block text-xs text-gray-400 font-medium">
                </div>
              </div>
            </motion.div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link
                to="/login"
                className="text-gray-300 hover:text-white font-medium transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-gray-800"
              >
                Sign In
              </Link>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Get Started
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 lg:py-32 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={itemVariants}
              className="flex items-center justify-center mb-6"
            >
              <div className="flex items-center space-x-2 bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-700">
                <Sparkles className="h-4 w-4 text-yellow-400" />
                <span className="text-sm text-gray-300">Powered by GPT-4 & Gemini</span>
              </div>
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6"
            >
              <span className="block">Build AI Chatbots</span>
              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Without Code
              </span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-lg sm:text-xl lg:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed"
            >
              Create intelligent, multilingual chatbots trained on your business documents. 
              Deploy instantly and provide <span className="text-blue-400 font-semibold">24/7 customer support</span> in any language.
            </motion.p>
            
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 inline-flex items-center shadow-2xl hover:shadow-blue-500/25"
                >
                  Start Building Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </motion.div>
              <motion.button 
                className="border border-gray-600 text-gray-300 px-8 py-4 rounded-xl font-semibold hover:bg-gray-800 hover:border-gray-500 transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Watch Demo
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-4xl mx-auto"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  variants={floatingVariants}
                  animate="animate"
                  style={{ animationDelay: `${index * 0.5}s` }}
                >
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {stat.number}
                  </div>
                  <div className="text-sm sm:text-base text-gray-400 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 lg:py-32 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Everything You Need to Build
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Amazing Chatbots
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
              Powerful features designed for businesses of all sizes
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="group bg-gray-800/50 backdrop-blur-sm p-6 lg:p-8 rounded-2xl border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className={`w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-6 w-6 lg:h-7 lg:w-7 text-white" />
                </div>
                <h3 className="text-xl lg:text-2xl font-semibold mb-3 group-hover:text-blue-400 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-20 lg:py-32 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-lg sm:text-xl text-gray-300">
              Get your chatbot up and running in minutes
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                step: 1,
                title: 'Upload Documents',
                description: 'Upload your business documents, FAQs, and knowledge base',
                icon: FileText,
              },
              {
                step: 2,
                title: 'Customize',
                description: 'Customize your chatbot\'s appearance and train it with AI models',
                icon: Bot,
              },
              {
                step: 3,
                title: 'Deploy & Share',
                description: 'Deploy instantly and share your chatbot URL with customers',
                icon: Globe,
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="text-center group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <motion.div 
                  className="relative w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.8 }}
                >
                  <span className="text-white font-bold text-xl lg:text-2xl">{item.step}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-20 animate-ping"></div>
                </motion.div>
                <h3 className="text-xl lg:text-2xl font-semibold mb-3 group-hover:text-blue-400 transition-colors duration-300">
                  {item.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 sm:py-20 lg:py-32 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Trusted by Businesses
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Worldwide
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-300">
              See what our customers are saying
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-gray-800/50 backdrop-blur-sm p-6 lg:p-8 rounded-2xl border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center mb-6">
                  <motion.img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 lg:w-14 lg:h-14 rounded-full object-cover border-2 border-gray-600"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  />
                  <div className="ml-4">
                    <h4 className="font-semibold text-lg">{testimonial.name}</h4>
                    <p className="text-gray-400 text-sm">{testimonial.company}</p>
                    <div className="flex mt-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-300 italic leading-relaxed">"{testimonial.quote}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 lg:py-32 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Ready to Transform Your
              <span className="block">Customer Support?</span>
            </h2>
            <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Join thousands of businesses using ChatBot Builder to provide instant, 
              intelligent customer support.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/signup"
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 inline-flex items-center shadow-2xl text-lg"
              >
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center mb-4">
                <img 
                  src={white_circle_360x360} 
                  alt="ChatBot Builder" 
                  className="h-8 w-8 rounded-full" 
                />
                <span className="ml-2 text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  ChatBot Builder
                </span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                The easiest way to build intelligent chatbots for your business.
              </p>
            </motion.div>
            
            {[
              {
                title: 'Product',
                links: ['Features', 'Pricing', 'API', 'Documentation'],
              },
              {
                title: 'Company',
                links: ['About', 'Blog', 'Careers', 'Contact'],
              },
              {
                title: 'Support',
                links: ['Help Center', 'Status', 'Security', 'Privacy'],
              },
            ].map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <h3 className="font-semibold mb-4 text-lg">{section.title}</h3>
                <ul className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <p>&copy; 2024 ChatBot Builder. All rights reserved.</p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};