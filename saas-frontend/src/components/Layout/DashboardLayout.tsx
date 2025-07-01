import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import black_circle_360x360 from "../../assets/black_circle_360x360.png"
import {
  LayoutDashboard,
  FileText,
  Bot,
  BarChart3,
  Globe,
  Code,
  Settings,
  Menu,
  X,
  LogOut,
  Building2,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Documents', path: '/documents', icon: FileText },
  { name: 'Chatbot', path: '/chatbot', icon: Bot },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Deployment', path: '/deployment', icon: Globe },
  { name: 'API', path: '/api', icon: Code },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <motion.div
        className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: sidebarOpen ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <motion.div
          className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl"
          initial={{ x: -256 }}
          animate={{ x: sidebarOpen ? 0 : -256 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
            <div className="flex items-center">
              <a href="https://bolt.new/" target="_blank" rel="noopener noreferrer">
                <img 
                  src={black_circle_360x360} 
                  alt="ChatBot Builder Logo" 
                  className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 rounded-full shadow-lg" 
                />
              </a>

              <span className="ml-2 text-xl font-bold text-gray-900">ChatBot Builder</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{profile?.company_name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sign Out
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-6 border-b border-gray-200">
 <a href="https://bolt.new/" target="_blank" rel="noopener noreferrer">
                <img 
                  src={black_circle_360x360} 
                  alt="ChatBot Builder Logo" 
                  className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 rounded-full shadow-lg" 
                />
              </a>            
            <span className="ml-2 text-xl font-bold text-gray-900">ChatBot Builder</span>
          </div>
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{profile?.company_name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="flex h-16 items-center justify-between bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-500 hover:text-gray-600"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Welcome back, {profile?.company_name}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};