import express from 'express';
import { supabase } from '../config/database.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get deployment information for a chatbot
router.get('/:chatbotId', async (req, res) => {
  try {
    const { chatbotId } = req.params;
    const companyId = req.user.id;

    const { data: chatbot, error } = await supabase
      .from('chatbots')
      .select('*')
      .eq('id', chatbotId)
      .eq('company_id', companyId)
      .single();

    if (error || !chatbot) {
      return res.status(404).json({
        success: false,
        message: 'Chatbot not found'
      });
    }

    const deploymentInfo = {
      chatbot_id: chatbot.id,
      public_url: chatbot.public_url,
      embed_code: generateEmbedCode(chatbot),
      api_endpoint: `${req.protocol}://${req.get('host')}/api/chat/${chatbot.id}`,
      api_key: chatbot.api_key,
      status: chatbot.status,
      custom_domain: chatbot.custom_domain,
      deployment_config: {
        name: chatbot.name,
        welcome_message: chatbot.welcome_message,
        primary_color: chatbot.primary_color,
        logo_url: chatbot.logo_url,
        supported_languages: chatbot.supported_languages
      }
    };

    res.json({
      success: true,
      data: { deployment: deploymentInfo }
    });
  } catch (error) {
    logger.error('Get deployment info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get deployment information',
      error: error.message
    });
  }
});

// Update deployment configuration
router.put('/:chatbotId', async (req, res) => {
  try {
    const { chatbotId } = req.params;
    const companyId = req.user.id;
    const { custom_domain, deployment_settings } = req.body;

    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (custom_domain) {
      updateData.custom_domain = custom_domain;
      updateData.public_url = `https://${custom_domain}`;
    }

    if (deployment_settings) {
      updateData.deployment_settings = deployment_settings;
    }

    const { data: chatbot, error } = await supabase
      .from('chatbots')
      .update(updateData)
      .eq('id', chatbotId)
      .eq('company_id', companyId)
      .select()
      .single();

    if (error) throw error;

    if (!chatbot) {
      return res.status(404).json({
        success: false,
        message: 'Chatbot not found'
      });
    }

    logger.info(`Deployment updated for chatbot: ${chatbotId}`);

    res.json({
      success: true,
      message: 'Deployment configuration updated successfully',
      data: { chatbot }
    });
  } catch (error) {
    logger.error('Update deployment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update deployment configuration',
      error: error.message
    });
  }
});

// Generate embed code for different platforms
router.get('/:chatbotId/embed/:platform', async (req, res) => {
  try {
    const { chatbotId, platform } = req.params;
    const { position = 'bottom-right', theme = 'light' } = req.query;
    const companyId = req.user.id;

    const { data: chatbot, error } = await supabase
      .from('chatbots')
      .select('*')
      .eq('id', chatbotId)
      .eq('company_id', companyId)
      .single();

    if (error || !chatbot) {
      return res.status(404).json({
        success: false,
        message: 'Chatbot not found'
      });
    }

    let embedCode = '';

    switch (platform) {
      case 'website':
        embedCode = generateWebsiteEmbedCode(chatbot, position, theme);
        break;
      case 'wordpress':
        embedCode = generateWordPressEmbedCode(chatbot);
        break;
      case 'shopify':
        embedCode = generateShopifyEmbedCode(chatbot);
        break;
      case 'react':
        embedCode = generateReactEmbedCode(chatbot);
        break;
      case 'iframe':
        embedCode = generateIframeEmbedCode(chatbot);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Unsupported platform'
        });
    }

    res.json({
      success: true,
      data: {
        platform,
        embed_code: embedCode,
        chatbot_id: chatbotId,
        configuration: {
          position,
          theme
        }
      }
    });
  } catch (error) {
    logger.error('Generate embed code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate embed code',
      error: error.message
    });
  }
});

// Test deployment
router.post('/:chatbotId/test', async (req, res) => {
  try {
    const { chatbotId } = req.params;
    const { test_message = 'Hello, this is a test message' } = req.body;
    const companyId = req.user.id;

    // Verify chatbot exists and is active
    const { data: chatbot, error } = await supabase
      .from('chatbots')
      .select('*')
      .eq('id', chatbotId)
      .eq('company_id', companyId)
      .single();

    if (error || !chatbot) {
      return res.status(404).json({
        success: false,
        message: 'Chatbot not found'
      });
    }

    if (chatbot.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Chatbot is not active'
      });
    }

    // Test the chatbot by sending a test message
    const testResponse = await fetch(`${req.protocol}://${req.get('host')}/api/chat/${chatbotId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: test_message,
        language: 'en',
        session_id: `test_${Date.now()}`
      })
    });

    const testResult = await testResponse.json();

    const deploymentTest = {
      chatbot_id: chatbotId,
      test_message,
      test_response: testResult,
      status: testResult.success ? 'passed' : 'failed',
      response_time: Date.now() - req.startTime,
      tested_at: new Date().toISOString(),
      public_url: chatbot.public_url,
      api_endpoint: `${req.protocol}://${req.get('host')}/api/chat/${chatbotId}`
    };

    logger.info(`Deployment test for chatbot ${chatbotId}: ${deploymentTest.status}`);

    res.json({
      success: true,
      data: { test_result: deploymentTest }
    });
  } catch (error) {
    logger.error('Test deployment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test deployment',
      error: error.message
    });
  }
});

// Get deployment analytics
router.get('/:chatbotId/analytics', async (req, res) => {
  try {
    const { chatbotId } = req.params;
    const { period = '7d' } = req.query;
    const companyId = req.user.id;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    // Get deployment analytics
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('chatbot_id', chatbotId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (error) throw error;

    const analytics = {
      total_interactions: conversations.length,
      unique_users: new Set(conversations.map(c => c.session_id)).size,
      avg_response_time: conversations.reduce((sum, c) => sum + (c.response_time || 0), 0) / conversations.length || 0,
      success_rate: conversations.filter(c => c.context_used).length / conversations.length * 100 || 0,
      languages_used: [...new Set(conversations.map(c => c.language))],
      peak_hours: {},
      daily_interactions: {}
    };

    // Calculate peak hours and daily interactions
    conversations.forEach(conv => {
      const date = new Date(conv.created_at);
      const hour = date.getHours();
      const day = date.toISOString().split('T')[0];

      analytics.peak_hours[hour] = (analytics.peak_hours[hour] || 0) + 1;
      analytics.daily_interactions[day] = (analytics.daily_interactions[day] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        analytics,
        period,
        chatbot_id: chatbotId
      }
    });
  } catch (error) {
    logger.error('Get deployment analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get deployment analytics',
      error: error.message
    });
  }
});

// Helper functions for generating embed codes
function generateEmbedCode(chatbot) {
  return `<script>
  (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "${process.env.FRONTEND_URL}/widget.js";
    js.setAttribute('data-chatbot-id', '${chatbot.id}');
    js.setAttribute('data-name', '${chatbot.name}');
    js.setAttribute('data-color', '${chatbot.primary_color}');
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'chatbot-widget'));
</script>`;
}

function generateWebsiteEmbedCode(chatbot, position, theme) {
  return `<!-- ChatBot Widget -->
<script>
  window.ChatBotConfig = {
    chatbotId: '${chatbot.id}',
    position: '${position}',
    theme: '${theme}',
    primaryColor: '${chatbot.primary_color}',
    name: '${chatbot.name}',
    welcomeMessage: '${chatbot.welcome_message}'
  };
</script>
<script src="${process.env.FRONTEND_URL}/widget.js" async></script>`;
}

function generateWordPressEmbedCode(chatbot) {
  return `<!-- Add this to your WordPress theme's footer.php or use a plugin like "Insert Headers and Footers" -->
<script>
  (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "${process.env.FRONTEND_URL}/widget.js";
    js.setAttribute('data-chatbot-id', '${chatbot.id}');
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'chatbot-widget'));
</script>`;
}

function generateShopifyEmbedCode(chatbot) {
  return `<!-- Add this to your Shopify theme's theme.liquid file before </body> -->
<script>
  window.ChatBotConfig = {
    chatbotId: '${chatbot.id}',
    position: 'bottom-right',
    primaryColor: '${chatbot.primary_color}',
    name: '${chatbot.name}'
  };
</script>
<script src="${process.env.FRONTEND_URL}/widget.js" async></script>`;
}

function generateReactEmbedCode(chatbot) {
  return `// Install: npm install @chatbot-builder/react-widget
import { ChatBotWidget } from '@chatbot-builder/react-widget';

function App() {
  return (
    <div>
      {/* Your app content */}
      <ChatBotWidget
        chatbotId="${chatbot.id}"
        primaryColor="${chatbot.primary_color}"
        position="bottom-right"
        name="${chatbot.name}"
        welcomeMessage="${chatbot.welcome_message}"
      />
    </div>
  );
}`;
}

function generateIframeEmbedCode(chatbot) {
  return `<iframe
  src="${chatbot.public_url}"
  width="400"
  height="600"
  frameborder="0"
  style="border: none; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);"
  title="${chatbot.name} - AI Assistant">
</iframe>`;
}

export default router;