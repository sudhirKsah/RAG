# Karnali Customer Support Portal

A beautiful, responsive customer support interface that provides both text and video chat capabilities with AI agents. This portal serves as the public-facing ChatAI interface that customers interact with.

## 🌟 Features

- **Immersive 3D Interface** - Stunning visual experience with animated backgrounds
- **Text Chat** - Real-time messaging with AI agents
- **Video Chat** - Face-to-face conversations with AI video agents powered by Tavus
- **Multilingual Support** - 8+ languages with seamless switching
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Real-time Analytics** - Live connection status and performance metrics
- **Customizable Branding** - Adapts to ChatAI configuration and company branding

## 🛠️ Tech Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Lucide React** for icons
- **Daily.co** for video chat infrastructure
- **Tavus AI** for video agent capabilities
- **WebSocket** for real-time communication

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend server running
- Tavus API key (for video chat)

### Installation

```bash
# Clone the repository
git clone https://github.com/sudhirKsah/rag.git
cd rag/customer-support-portal

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

The application will be available at `http://localhost:5174`

## 📁 Project Structure

```
customer-support-portal/
├── src/
│   ├── components/          # React components
│   │   ├── ChatModal.tsx           # Text chat interface
│   │   ├── VideoAgentModal.tsx     # Video chat interface
│   │   ├── ChatOptionsModal.tsx    # Chat type selection
│   │   ├── CustomerSupportPage.tsx # Main landing page
│   │   ├── FloatingElements.tsx    # Animated background
│   │   ├── LoadingSpinner.tsx      # Loading animation
│   │   └── ErrorBoundary.tsx       # Error handling
│   ├── lib/                # Utilities and API
│   │   ├── api.ts          # API client for backend
│   │   └── tavus.ts        # Tavus API integration
│   ├── data/               # Static data
│   │   └── companyData.ts  # Company information
│   ├── types/              # TypeScript types
│   │   └── index.ts        # Type definitions
│   ├── App.tsx             # Main app component
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── public/                # Static assets
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 🎨 Components

### CustomerSupportPage
The main landing page that showcases the AI support capabilities with:
- Animated 3D background elements
- Company branding and information
- Chat initiation options
- Real-time backend status

### ChatModal
Text-based chat interface featuring:
- Real-time messaging
- Language selection
- Message history
- Typing indicators
- Feedback system
- Responsive design

### VideoAgentModal
Video chat interface with:
- Tavus AI video agent integration
- Daily.co video infrastructure
- Real-time video streaming
- Audio/video controls
- Connection status monitoring
- Error handling and fallbacks

### ChatOptionsModal
Modal for selecting chat type:
- Text chat option
- Video chat option
- Feature comparison
- Backend status indication

## 🌐 API Integration

### Backend API
Connects to the main Karnali backend for:
- ChatAI configuration
- Message processing
- Analytics tracking
- Health checks

### Tavus API
Integrates with Tavus for video chat:
- Conversation creation
- Video agent management
- Real-time video streaming
- Session management

## 🎯 Key Features

### Multi-language Support
- Automatic language detection
- Real-time language switching
- Localized UI elements
- Cultural context preservation

### Real-time Communication
- WebSocket connections
- Live typing indicators
- Instant message delivery
- Connection status monitoring

### Video Chat Capabilities
- HD video quality
- Low latency streaming
- Audio/video controls
- Screen sharing support
- Recording capabilities

### Analytics Integration
- User interaction tracking
- Performance monitoring
- Error reporting
- Usage analytics

## 🎨 Styling and Theming

### Tailwind CSS Configuration
Custom design system with:
- Glassmorphism effects
- Gradient animations
- Responsive breakpoints
- Dark mode support

### Animation System
Framer Motion animations for:
- Page transitions
- Component interactions
- Loading states
- Micro-interactions

### Responsive Design
Optimized for:
- Desktop (1920px+)
- Laptop (1024px+)
- Tablet (768px+)
- Mobile (320px+)

## 🔧 Configuration

### ChatAI Customization
The portal adapts to ChatAI configuration:
- Company branding
- Color schemes
- Logo integration
- Welcome messages
- Language preferences

### Performance Optimization
- Code splitting
- Lazy loading
- Image optimization
- Bundle size optimization
- Caching strategies

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Deploy to Vercel
vercel

# Set environment variables in dashboard
```

### Netlify
```bash
# Build and deploy
npm run build
# Upload dist folder to Netlify
```

## 🔒 Security

### Data Protection
- No sensitive data storage
- Secure API communication
- HTTPS enforcement
- CORS configuration

### Privacy Compliance
- GDPR compliance
- Cookie management
- Data retention policies
- User consent handling

## 🐛 Troubleshooting

### Common Issues

1. **Video Chat Not Working**
   - Check Tavus API key
   - Verify network connectivity
   - Check browser permissions

2. **Backend Connection Failed**
   - Verify API URL
   - Check CORS settings
   - Confirm backend status

3. **Styling Issues**
   - Clear browser cache
   - Check Tailwind compilation
   - Verify CSS imports


## 📈 Performance

- **First Contentful Paint** - < 1.5s
- **Largest Contentful Paint** - < 2.5s
- **Cumulative Layout Shift** - < 0.1
- **First Input Delay** - < 100ms

---

**Experience the future of customer support with Karnali's AI-powered portal.**