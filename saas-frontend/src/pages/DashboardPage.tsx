import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { Link } from 'react-router-dom';
import {
  FileText,
  Bot,
  MessageCircle,
  TrendingUp,
  Users,
  Globe,
  Plus,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { api } from '../lib/api';

interface DashboardStats {
  documents: number;
  chatbots: number;
  conversations: number;
  languages: number;
}

interface RecentActivity {
  id: string;
  type: 'document' | 'chatbot' | 'conversation';
  title: string;
  description: string;
  time: string;
  icon: any;
}

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    documents: 0,
    chatbots: 0,
    conversations: 0,
    languages: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch documents
      const documentsResponse = await api.getDocuments(10, 0);
      let documentsCount = 0;
      if (documentsResponse.ok) {
        const documentsResult = await documentsResponse.json();
        documentsCount = documentsResult.data.documents.length;
      }

      // Fetch chatbots
      const chatbotsResponse = await api.getChatbots();
      let chatbotsCount = 0;
      if (chatbotsResponse.ok) {
        const chatbotsResult = await chatbotsResponse.json();
        chatbotsCount = chatbotsResult.data.chatbots.length;
      }

      // Fetch analytics overview
      const analyticsResponse = await api.getAnalyticsOverview();
      let conversationsCount = 0;
      if (analyticsResponse.ok) {
        const analyticsResult = await analyticsResponse.json();
        conversationsCount = analyticsResult.data.analytics.overview.total_conversations || 0;
      }

      setStats({
        documents: documentsCount,
        chatbots: chatbotsCount,
        conversations: conversationsCount,
        languages: 5, // Default supported languages
      });

      // Mock recent activity for now
      setRecentActivity([
        {
          id: '1',
          type: 'document',
          title: 'New document uploaded',
          description: 'Customer Support FAQ.pdf',
          time: '2 hours ago',
          icon: FileText,
        },
        {
          id: '2',
          type: 'chatbot',
          title: 'Chatbot updated',
          description: 'Support Bot - Added Hindi language',
          time: '1 day ago',
          icon: Bot,
        },
        {
          id: '3',
          type: 'conversation',
          title: 'High conversation volume',
          description: `${conversationsCount} conversations today`,
          time: '2 days ago',
          icon: MessageCircle,
        },
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsConfig = [
    {
      name: 'Total Documents',
      value: stats.documents.toString(),
      change: '+2 this week',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      link: '/documents',
    },
    {
      name: 'Active Chatbots',
      value: stats.chatbots.toString(),
      change: '+1 this month',
      icon: Bot,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      link: '/chatbot',
    },
    {
      name: 'Conversations',
      value: stats.conversations.toString(),
      change: '+23% this week',
      icon: MessageCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      link: '/analytics',
    },
    {
      name: 'Languages',
      value: stats.languages.toString(),
      change: '+2 this month',
      icon: Globe,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      link: '/chatbot',
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your chatbots.</p>
          </div>
          <div className="flex space-x-3">
            <Link
              to="/analytics"
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              View Analytics
            </Link>
            <Link
              to="/chatbot"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Chatbot
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsConfig.map((stat, index) => (
            <motion.div
              key={stat.name}
              className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => window.location.href = stat.link}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-1">{stat.change}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link to="/documents">
                  <motion.div
                    className="border border-gray-200 rounded-lg p-6 hover:border-blue-200 hover:bg-blue-50 transition-colors cursor-pointer group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Upload Documents</h3>
                    <p className="text-sm text-gray-600">Add new documents to train your chatbot</p>
                  </motion.div>
                </Link>

                <Link to="/chatbot">
                  <motion.div
                    className="border border-gray-200 rounded-lg p-6 hover:border-green-200 hover:bg-green-50 transition-colors cursor-pointer group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Bot className="h-5 w-5 text-green-600" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Create Chatbot</h3>
                    <p className="text-sm text-gray-600">Build a new AI chatbot from scratch</p>
                  </motion.div>
                </Link>

                <Link to="/deployment">
                  <motion.div
                    className="border border-gray-200 rounded-lg p-6 hover:border-purple-200 hover:bg-purple-50 transition-colors cursor-pointer group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Globe className="h-5 w-5 text-purple-600" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Deploy Chatbot</h3>
                    <p className="text-sm text-gray-600">Make your chatbot live and accessible</p>
                  </motion.div>
                </Link>

                <Link to="/analytics">
                  <motion.div
                    className="border border-gray-200 rounded-lg p-6 hover:border-orange-200 hover:bg-orange-50 transition-colors cursor-pointer group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-orange-600" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">View Analytics</h3>
                    <p className="text-sm text-gray-600">Monitor performance and user interactions</p>
                  </motion.div>
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    className="flex items-start space-x-3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <activity.icon className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-1 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {activity.time}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <Link
                to="/analytics"
                className="w-full mt-6 text-sm text-blue-600 hover:text-blue-700 font-medium block text-center"
              >
                View All Activity
              </Link>
            </div>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Performance Overview</h2>
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">98.5%</div>
              <div className="text-sm text-gray-600">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">1.2s</div>
              <div className="text-sm text-gray-600">Avg Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">94%</div>
              <div className="text-sm text-gray-600">Customer Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};