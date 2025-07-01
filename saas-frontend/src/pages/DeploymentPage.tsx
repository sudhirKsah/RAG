import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import {
  Globe,
  Copy,
  ExternalLink,
  Check,
  Code,
  Smartphone,
  Monitor,
  Zap,
  Shield,
  Settings,
} from 'lucide-react';

const deploymentMethods = [
  {
    id: 'embed',
    name: 'Website Embed',
    description: 'Add a chat widget to your website',
    icon: Code,
    popular: true,
  },
  {
    id: 'standalone',
    name: 'Standalone Page',
    description: 'Full-page chatbot experience',
    icon: Monitor,
    popular: false,
  },
  {
    id: 'api',
    name: 'API Integration',
    description: 'Integrate via REST API',
    icon: Zap,
    popular: false,
  },
  {
    id: 'mobile',
    name: 'Mobile App',
    description: 'Native mobile integration',
    icon: Smartphone,
    popular: false,
  },
];

const embedOptions = [
  { id: 'bubble', name: 'Chat Bubble', description: 'Floating chat bubble in corner' },
  { id: 'inline', name: 'Inline Widget', description: 'Embedded directly in page' },
  { id: 'popup', name: 'Popup Modal', description: 'Opens in modal overlay' },
  { id: 'fullscreen', name: 'Fullscreen', description: 'Takes up entire screen' },
];

export const DeploymentPage: React.FC = () => {
  const [selectedMethod, setSelectedMethod] = useState('embed');
  const [selectedEmbed, setSelectedEmbed] = useState('bubble');
  const [copied, setCopied] = useState(false);
  const [customDomain, setCustomDomain] = useState('');

  const chatbotUrl = 'https://chat.yourcompany.com';
  const embedCode = `<script>
  (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "https://widget.chatbotbuilder.com/widget.js";
    js.setAttribute('data-chatbot-id', 'your-chatbot-id');
    js.setAttribute('data-position', '${selectedEmbed}');
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'chatbot-widget'));
</script>`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Deployment</h1>
            <p className="text-gray-600 mt-1">Deploy your chatbot and share it with the world</p>
          </div>
          <div className="flex space-x-3">
            <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Settings className="h-4 w-4 mr-2 inline" />
              Settings
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <Globe className="h-4 w-4 mr-2 inline" />
              Deploy Now
            </button>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <h2 className="text-xl font-semibold text-gray-900">Deployment Status</h2>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Live
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600">URL</p>
              <p className="font-medium text-gray-900">{chatbotUrl}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Last Updated</p>
              <p className="font-medium text-gray-900">2 hours ago</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Version</p>
              <p className="font-medium text-gray-900">v1.2.3</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Deployment Methods */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Deployment Methods</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {deploymentMethods.map((method) => (
                  <motion.div
                    key={method.id}
                    className={`relative p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedMethod === method.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedMethod(method.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {method.popular && (
                      <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                        Popular
                      </span>
                    )}
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        selectedMethod === method.id ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <method.icon className={`h-5 w-5 ${
                          selectedMethod === method.id ? 'text-blue-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{method.name}</h3>
                        <p className="text-sm text-gray-600">{method.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Embed Configuration */}
            {selectedMethod === 'embed' && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Embed Configuration</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Widget Style
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {embedOptions.map((option) => (
                        <label
                          key={option.id}
                          className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedEmbed === option.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="embed-style"
                            value={option.id}
                            checked={selectedEmbed === option.id}
                            onChange={(e) => setSelectedEmbed(e.target.value)}
                            className="sr-only"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{option.name}</p>
                            <p className="text-sm text-gray-600">{option.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Embed Code
                    </label>
                    <div className="relative">
                      <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto border">
                        <code>{embedCode}</code>
                      </pre>
                      <button
                        onClick={() => copyToClipboard(embedCode)}
                        className="absolute top-2 right-2 bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-50 transition-colors flex items-center"
                      >
                        {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Custom Domain */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Custom Domain</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Domain Name
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      placeholder="chat.yourcompany.com"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Verify
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Add a CNAME record pointing to chatbot.yourcompany.com
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links & Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Links</h2>
              <div className="space-y-3">
                <a
                  href={chatbotUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-gray-900">Live Chatbot</span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </a>
                
                <button
                  onClick={() => copyToClipboard(chatbotUrl)}
                  className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Copy className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-gray-900">Copy URL</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Security</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">SSL Certificate</span>
                  </div>
                  <span className="text-sm text-green-600">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">CORS Protection</span>
                  </div>
                  <span className="text-sm text-green-600">Enabled</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">Rate Limiting</span>
                  </div>
                  <span className="text-sm text-green-600">Active</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Performance</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Uptime</span>
                    <span className="font-medium">99.9%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '99.9%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Response Time</span>
                    <span className="font-medium">1.2s</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};