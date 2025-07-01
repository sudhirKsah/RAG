# ChatBot Builder Backend

A comprehensive backend system for the No-Code Multilingual AI Chatbot Builder platform with advanced video chat capabilities.

## Features

- **RAG Pipeline**: Document processing and vector storage with Astra DB
- **AI Integration**: Support for OpenAI GPT models and Google Gemini
- **Video Chat AI**: Real-time video conversations with AI agents powered by Tavus
- **Multilingual Support**: 8+ languages with automatic translation
- **Real-time Chat**: WebSocket support for live conversations
- **Analytics**: Comprehensive usage tracking and reporting
- **API Management**: RESTful APIs with authentication and rate limiting
- **Document Processing**: PDF, DOCX, and TXT file support
- **Deployment Tools**: Multiple deployment options and embed codes

## Tech Stack

- **Runtime**: Node.js with Express.js
- **Database**: Supabase (PostgreSQL) for metadata
- **Vector DB**: Astra DB for embeddings storage
- **AI Models**: OpenAI GPT-4/3.5-turbo, Google Gemini Pro/2.0 Flash
- **Video AI**: Tavus for AI video agents and real-time conversations
- **Authentication**: JWT with bcrypt
- **File Storage**: Supabase Storage
- **Real-time**: Socket.io
- **Validation**: Joi
- **Logging**: Winston

## Quick Start

### Prerequisites

- Node.js 18+
- Supabase account
- Astra DB account
- OpenAI API key
- Google AI API key
- Tavus API key (for video chat features)

### Installation

1. **Clone and setup**:
```bash
cd backend
npm install
```

2. **Environment Configuration**:
```bash
setup .env as given below
# Edit .env with your credentials
```

3. **Database Setup**:
```sql
-- Run these SQL commands in your Supabase SQL editor

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  company_name TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  description TEXT,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  content_length INTEGER,
  chunk_count INTEGER,
  file_url TEXT,
  status TEXT DEFAULT 'processing',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chatbots table
CREATE TABLE chatbots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  ai_model TEXT DEFAULT 'gpt-3.5-turbo',
  welcome_message TEXT,
  primary_color TEXT DEFAULT '#2563eb',
  supported_languages TEXT[] DEFAULT ARRAY['en'],
  logo_url TEXT,
  status TEXT DEFAULT 'active',
  video_keywords TEXT,
  public_url TEXT,
  custom_domain TEXT,
  api_key TEXT UNIQUE,
  deployment_settings JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chatbot_id UUID REFERENCES chatbots(id) ON DELETE CASCADE,
  company_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  user_message TEXT NOT NULL,
  bot_response TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  model_used TEXT,
  context_used BOOLEAN DEFAULT FALSE,
  response_time INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversation feedback table
CREATE TABLE conversation_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbots ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own profile" ON profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage own documents" ON documents
  FOR ALL USING (auth.uid() = company_id);

CREATE POLICY "Users can manage own chatbots" ON chatbots
  FOR ALL USING (auth.uid() = company_id);

CREATE POLICY "Public can read active chatbots" ON chatbots
  FOR SELECT USING (status = 'active');

CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (auth.uid() = company_id);

CREATE POLICY "Public can create conversations" ON conversations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can create feedback" ON conversation_feedback
  FOR INSERT WITH CHECK (true);
```

4. **Start Development Server**:
```bash
npm run dev
```

#### DELETE /api/tavus/conversation/:conversationId
End a video conversation.

#### GET /api/tavus/analytics
Get video chat analytics.

**Query Parameters**:
- `period`: `24h`, `7d`, `30d` (default: `7d`)
- `chatbot_id`: Filter by specific chatai (optional)

### Analytics Endpoints

#### GET /api/analytics/overview
Get comprehensive analytics overview.

**Headers**: `Authorization: Bearer <token>`
**Query Parameters**: `period` (24h, 7d, 30d, 90d)

## Architecture

### RAG Pipeline

1. **Document Upload**: Files are uploaded to Supabase Storage
2. **Text Extraction**: PDF/DOCX/TXT content is extracted
3. **Chunking**: Text is split into manageable chunks
4. **Embedding**: OpenAI embeddings are generated for each chunk
5. **Storage**: Embeddings are stored in Astra DB with metadata
6. **Retrieval**: Similar chunks are found using vector similarity
7. **Generation**: AI models generate responses using retrieved context

### Video Chat Integration with Tavus

1. **Conversation Creation**: Client requests video conversation via `/api/tavus/conversation`
2. **Context Preparation**: RAG system provides relevant company knowledge
3. **Tavus API Call**: Backend creates Tavus conversation with company context
4. **Daily.co Integration**: Tavus provides Daily.co room URL for video chat
5. **Real-time Communication**: Client connects to Daily.co room for video chat
6. **AI Agent Interaction**: Tavus AI agent responds with company knowledge
7. **Session Management**: Backend tracks conversation status and analytics

### AI Model Integration

- **OpenAI GPT-4/3.5-turbo**: Primary models for chat responses
- **Google Gemini Pro/2.0 Flash**: Alternative model options with fallback support
- **Tavus AI Video Agents**: Real-time video conversations with AI personas
- **Embeddings**: OpenAI text-embedding-3-small for vector generation
- **Multilingual**: Automatic language detection and translation

### Security

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Joi schema validation for all inputs
- **CORS**: Configured for frontend domain
- **File Validation**: Type and size restrictions for uploads
- **Video Security**: Secure Tavus API integration with proper authentication

## Tavus Integration Details

### Features

- **AI Video Agents**: Create lifelike AI agents for video conversations
- **Real-time Interaction**: Low-latency video chat with AI responses
- **Context Awareness**: AI agents trained on your company's knowledge base
- **Multilingual Support**: Video conversations in multiple languages
- **Session Management**: Track and manage video conversation sessions
- **Analytics**: Comprehensive video chat analytics and insights

### Video Chat Flow

1. **Initialization**: Frontend requests video conversation
2. **Context Building**: Backend prepares company-specific context from RAG
3. **Tavus Creation**: Create Tavus conversation with AI agent
4. **Daily.co Room**: Receive video chat room URL
5. **Client Connection**: Frontend connects to video room
6. **AI Interaction**: Real-time conversation with AI video agent
7. **Session Tracking**: Monitor and log conversation metrics

### Error Handling

- **Fallback Mechanisms**: Graceful degradation to text chat if video fails
- **Retry Logic**: Automatic retry for transient failures
- **Error Logging**: Comprehensive error tracking and monitoring
- **User Feedback**: Clear error messages and recovery options

## Deployment

### Environment Variables

```bash
# Server
PORT=3001
NODE_ENV=production

# Database
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Services
OPENAI_API_KEY=your_openai_key
GOOGLE_AI_API_KEY=your_google_ai_key

# Video Chat
TAVUS_API_KEY=your_tavus_api_key
TAVUS_REPLICA_ID=your_tavus_replica_id

# Vector Database
ASTRA_DB_APPLICATION_TOKEN=your_astra_token
ASTRA_DB_API_ENDPOINT=your_astra_endpoint

# Security
JWT_SECRET=your_jwt_secret
```

### Production Deployment

1. **Build**: `npm run build`
2. **Start**: `npm start`
3. **Health Check**: `GET /health`

## Development

### Project Structure

```
backend/
├── src/
│   ├── config/          # Database and service configurations
│   ├── middleware/      # Express middleware
│   ├── routes/          # API route handlers
│   │   ├── auth.js      # Authentication routes
│   │   ├── documents.js # Document management
│   │   ├── chatbots.js  # ChatAI configuration
│   │   ├── chat.js      # Text chat endpoints
│   │   ├── tavus.js     # Video chat endpoints
│   │   ├── analytics.js # Analytics and reporting
│   │   └── deployment.js # Deployment management
│   ├── services/        # Business logic services
│   │   ├── aiService.js     # AI model integration
│   │   ├── ragService.js    # RAG pipeline
│   │   └── documentService.js # Document processing
│   ├── schemas/         # Validation schemas
│   ├── utils/           # Utility functions
│   └── server.js        # Main server file
├── logs/                # Application logs
├── .env.example         # Environment template
└── package.json
```

### Key Services

- **AIService**: Handles OpenAI and Gemini API interactions
- **RAGService**: Manages vector storage and retrieval
- **DocumentService**: Processes file uploads and text extraction
- **TavusService**: Manages video chat conversations and AI agents

