# ChatBot Builder Backend

A comprehensive backend system for the No-Code Multilingual AI Chatbot Builder platform.

## Features

- **RAG Pipeline**: Document processing and vector storage with Astra DB
- **AI Integration**: Support for OpenAI GPT models and Google Gemini
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
- **AI Models**: OpenAI GPT-4/3.5-turbo, Google Gemini Pro
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

### Installation

1. **Clone and setup**:
```bash
cd backend
npm install
```

2. **Environment Configuration**:
```bash
cp .env.example .env
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

## API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "company_name": "Your Company"
}
```

#### POST /api/auth/login
Login with email and password.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### Document Endpoints

#### POST /api/documents/upload
Upload and process a document.

**Headers**: `Authorization: Bearer <token>`
**Body**: `multipart/form-data` with `document` file

#### GET /api/documents
Get all documents for the authenticated user.

**Headers**: `Authorization: Bearer <token>`

### Chatbot Endpoints

#### POST /api/chatbots
Create a new chatbot.

**Headers**: `Authorization: Bearer <token>`
**Request Body**:
```json
{
  "name": "Support Bot",
  "description": "Customer support chatbot",
  "ai_model": "gpt-4",
  "welcome_message": "Hello! How can I help you?",
  "primary_color": "#2563eb",
  "supported_languages": ["en", "es", "fr"]
}
```

#### GET /api/chatbots
Get all chatbots for the authenticated user.

### Chat Endpoints

#### POST /api/chat/:chatbotId
Send a message to a chatbot (public endpoint).

**Request Body**:
```json
{
  "message": "Hello, I need help",
  "language": "en",
  "session_id": "unique-session-id",
  "conversation_history": [
    {"role": "user", "content": "Previous message"},
    {"role": "assistant", "content": "Previous response"}
  ]
}
```

#### POST /api/chat/:chatbotId/stream
Stream chat response for real-time conversation.

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

### AI Model Integration

- **OpenAI GPT-4/3.5-turbo**: Primary models for chat responses
- **Google Gemini Pro**: Alternative model option
- **Embeddings**: OpenAI text-embedding-3-small for vector generation
- **Multilingual**: Automatic language detection and translation

### Security

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Joi schema validation for all inputs
- **CORS**: Configured for frontend domain
- **File Validation**: Type and size restrictions for uploads

## Deployment

### Environment Variables

```bash
# Server
PORT=3002
NODE_ENV=production

# Database
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Services
OPENAI_API_KEY=your_openai_key
GOOGLE_AI_API_KEY=your_google_ai_key

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
│   ├── services/        # Business logic services
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

### Testing

```bash
npm test
```

### Logging

Logs are written to:
- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only
- Console (development only)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.