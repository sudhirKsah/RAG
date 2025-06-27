import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../utils/logger.js';

// Initialize AI clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

export class AIService {
  constructor() {
    this.models = {
      'gpt-4': 'gpt-4',
      'gpt-3.5-turbo': 'gpt-3.5-turbo',
      'gemini-pro': 'gemini-pro'
    };
  }

  // Generate embeddings using OpenAI
  async generateEmbeddings(text) {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      logger.error('Error generating embeddings:', error);
      throw new Error('Failed to generate embeddings');
    }
  }

  // Generate chat response using specified model
  async generateResponse(model, messages, context = '', language = 'en') {
    try {
      const systemPrompt = this.buildSystemPrompt(context, language);
      const fullMessages = [
        { role: 'system', content: systemPrompt },
        ...messages
      ];

      if (model.startsWith('gpt')) {
        return await this.generateOpenAIResponse(model, fullMessages);
      } else if (model === 'gemini-pro') {
        return await this.generateGeminiResponse(fullMessages);
      } else {
        throw new Error(`Unsupported model: ${model}`);
      }
    } catch (error) {
      logger.error('Error generating AI response:', error);
      throw new Error('Failed to generate response');
    }
  }

  // Generate response using OpenAI
  async generateOpenAIResponse(model, messages) {
    const response = await openai.chat.completions.create({
      model: this.models[model],
      messages,
      temperature: 0.7,
      max_tokens: 1000,
      stream: false
    });

    return {
      content: response.choices[0].message.content,
      usage: response.usage
    };
  }

  // Generate response using Gemini
  async generateGeminiResponse(messages) {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // Convert messages to Gemini format
    const prompt = messages.map(msg => {
      if (msg.role === 'system') return `System: ${msg.content}`;
      if (msg.role === 'user') return `User: ${msg.content}`;
      if (msg.role === 'assistant') return `Assistant: ${msg.content}`;
      return msg.content;
    }).join('\n\n');

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return {
      content: response.text(),
      usage: { total_tokens: 0 } // Gemini doesn't provide token usage
    };
  }

  // Build system prompt with context and language
  buildSystemPrompt(context, language) {
    const languageInstructions = {
      'en': 'Respond in English.',
      'es': 'Responde en español.',
      'fr': 'Répondez en français.',
      'de': 'Antworten Sie auf Deutsch.',
      'hi': 'हिंदी में उत्तर दें।',
      'ne': 'नेपालीमा जवाफ दिनुहोस्।',
      'zh': '用中文回答。',
      'ja': '日本語で答えてください。'
    };

    const basePrompt = `You are a helpful AI assistant for a business. You should provide accurate, helpful, and professional responses based on the company's documentation and knowledge base.

${languageInstructions[language] || languageInstructions['en']}

If you have relevant context from the company's documents, use it to provide accurate answers. If you don't have specific information, politely say so and offer to help in other ways.

Keep responses concise but informative. Be friendly and professional.`;

    if (context) {
      return `${basePrompt}

Relevant company information:
${context}

Use this information to answer the user's question accurately.`;
    }

    return basePrompt;
  }

  // Stream response for real-time chat
  async generateStreamResponse(model, messages, context = '', language = 'en') {
    try {
      const systemPrompt = this.buildSystemPrompt(context, language);
      const fullMessages = [
        { role: 'system', content: systemPrompt },
        ...messages
      ];

      if (model.startsWith('gpt')) {
        return await openai.chat.completions.create({
          model: this.models[model],
          messages: fullMessages,
          temperature: 0.7,
          max_tokens: 1000,
          stream: true
        });
      } else {
        // For non-streaming models, return regular response
        const response = await this.generateResponse(model, messages, context, language);
        return response;
      }
    } catch (error) {
      logger.error('Error generating stream response:', error);
      throw new Error('Failed to generate stream response');
    }
  }

  // Translate text to specified language
  async translateText(text, targetLanguage) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Translate the following text to ${targetLanguage}. Only return the translation, no additional text.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      });

      return response.choices[0].message.content;
    } catch (error) {
      logger.error('Error translating text:', error);
      throw new Error('Failed to translate text');
    }
  }

  // Detect language of text
  async detectLanguage(text) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Detect the language of the following text. Return only the language code (e.g., en, es, fr, de, hi, ne, zh, ja).'
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.1,
        max_tokens: 10
      });

      return response.choices[0].message.content.trim().toLowerCase();
    } catch (error) {
      logger.error('Error detecting language:', error);
      return 'en'; // Default to English
    }
  }
}

export const aiService = new AIService();