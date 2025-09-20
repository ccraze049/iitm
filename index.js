// Required Libraries
const { Telegraf } = require("telegraf");
const mongoose = require("mongoose");
const axios = require("axios");
const { franc } = require("franc");
const express = require("express");
const fs = require("fs");
const path = require("path");

// --- CONFIGURATION (Environment-aware setup) ---
const TELEGRAM_TOKEN = "7673072912:AAE2jkuvfU69hy4Z0nz-qmySf2uXkb5vw1E";
const GEMINI_API_KEY = "AIzaSyAnBwpxQlkdh1ekLSRj-bZ0XWanzOqrGNw";
const GEMINI_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const MONGO_URI =
  "mongodb+srv://codeyogiai_db_user:EbyqKN8BUbfcrqcZ@iitm.qpgyazn.mongodb.net/?retryWrites=true&w=majority&appName=Iitm";

// Environment detection
const IS_PRODUCTION = process.env.NODE_ENV === 'production' || process.env.RENDER || process.env.RAILWAY_STATIC_URL;
const WEBHOOK_URL = process.env.WEBHOOK_URL || process.env.RENDER_EXTERNAL_URL;
const USE_WEBHOOK = IS_PRODUCTION && WEBHOOK_URL;

// --- EXPRESS SERVER SETUP ---
const app = express();
const PORT = 5000;

// Store logs in memory
let botLogs = [];
const MAX_LOGS = 500;

// Custom logger function
function logMessage(level, message) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message
  };
  
  botLogs.unshift(logEntry);
  if (botLogs.length > MAX_LOGS) {
    botLogs.pop();
  }
  
  // Also log to console
  console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
}

// Express routes
app.get('/', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>IIT Madras Bot Logs</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { 
                font-family: 'Courier New', monospace; 
                margin: 0; 
                padding: 20px; 
                background: #1a1a1a; 
                color: #00ff00; 
            }
            .header { 
                background: #333; 
                padding: 15px; 
                border-radius: 5px; 
                margin-bottom: 20px; 
                text-align: center;
            }
            .log-container { 
                background: #222; 
                padding: 15px; 
                border-radius: 5px; 
                height: 70vh; 
                overflow-y: auto; 
                border: 1px solid #444;
            }
            .log-entry { 
                margin-bottom: 8px; 
                padding: 5px; 
                border-left: 3px solid #00ff00;
                padding-left: 10px;
            }
            .log-error { border-left-color: #ff4444; color: #ff6666; }
            .log-warn { border-left-color: #ffaa00; color: #ffcc66; }
            .log-info { border-left-color: #0088ff; color: #66aaff; }
            .timestamp { color: #888; font-size: 0.9em; }
            .refresh-btn {
                background: #00ff00;
                color: #000;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                margin: 10px 0;
                font-weight: bold;
            }
            .refresh-btn:hover { background: #00cc00; }
            .stats {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                color: #ccc;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🤖 IIT Madras AI Telegram Bot - Live Logs</h1>
            <button class="refresh-btn" onclick="window.location.reload()">🔄 Refresh Logs</button>
        </div>
        
        <div class="stats">
            <span>Total Logs: ${botLogs.length}</span>
            <span>Last Updated: ${new Date().toLocaleString()}</span>
        </div>
        
        <div class="log-container">
            ${botLogs.map(log => `
                <div class="log-entry log-${log.level.toLowerCase()}">
                    <span class="timestamp">[${new Date(log.timestamp).toLocaleString()}]</span>
                    <span class="level">[${log.level.toUpperCase()}]</span>
                    <span class="message">${log.message}</span>
                </div>
            `).join('')}
        </div>
        
        <script>
            // Auto refresh every 10 seconds
            setTimeout(() => window.location.reload(), 10000);
        </script>
    </body>
    </html>
  `;
  
  res.send(html);
});

app.get('/api/logs', (req, res) => {
  res.json(botLogs);
});

// Webhook endpoint for production
if (USE_WEBHOOK) {
  app.use(express.json());
  app.post(`/webhook/${TELEGRAM_TOKEN}`, (req, res) => {
    try {
      bot.handleUpdate(req.body);
      res.sendStatus(200);
    } catch (error) {
      logMessage('error', `Webhook error: ${error.message}`);
      res.sendStatus(500);
    }
  });
  
  logMessage('info', 'Webhook endpoint configured for production');
}

// Start Express server
app.listen(PORT, '0.0.0.0', () => {
  logMessage('info', `Express server started on http://0.0.0.0:${PORT}`);
  logMessage('info', `Environment: ${IS_PRODUCTION ? 'Production' : 'Development'}`);
  logMessage('info', `Bot mode: ${USE_WEBHOOK ? 'Webhook' : 'Polling'}`);
});


// --- MongoDB Setup ---
mongoose
  .connect(MONGO_URI)
  .then(() => logMessage('info', "MongoDB Connected"))
  .catch((err) => logMessage('error', `MongoDB connection error: ${err.message}`));

// Optional: Test Gemini API on startup (disabled for production)
// setTimeout(() => callGemini("Test").then(r => console.log("API OK:", r.substring(0,20))), 2000);

// User Schema
const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  username: String,
  firstName: String,
  lastName: String,
  preferredLanguage: { type: String, enum: ['hindi', 'english'], default: null },
  registeredAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
});
const User = mongoose.model("User", userSchema);

// Message Schema
const messageSchema = new mongoose.Schema({
  userId: String,
  question: String,
  answer: String,
  timestamp: { type: Date, default: Date.now },
});
// Add index for better performance
messageSchema.index({ userId: 1, timestamp: -1 });
const Message = mongoose.model("Message", messageSchema);

// --- Language Detection ---
const detectLanguage = (text) => {
  const langCode = franc(text);
  if (langCode === "hin") return "Hindi";
  return "English";
};

// --- Telegram Formatting Helper ---
const formatForTelegram = (text) => {
  // Convert standard markdown to Telegram-compatible format
  let formatted = text
    // Convert ** bold to * bold for Telegram
    .replace(/\*\*(.*?)\*\*/g, '*$1*')
    // Convert * bullet points to • for better display
    .replace(/^\s*\*\s+/gm, '• ')
    // Clean up excessive newlines
    .replace(/\n{3,}/g, '\n\n')
    // Escape special characters that might interfere with Telegram markdown
    .replace(/([_`\[\]])/g, '\\$1');
  
  return formatted.trim();
};

// --- Gemini API Handler ---
async function callGemini(prompt) {
  try {
    const response = await axios.post(
      GEMINI_BASE_URL,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY,
        },
        timeout: 60000,
      },
    );
    
    const aiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (aiResponse) {
      return aiResponse;
    } else {
      return "मुझे इसका उत्तर नहीं पता।";
    }
  } catch (error) {
    logMessage('error', `Gemini API Error: ${error.response?.status || error.message}`);
    return "मुझे इसका उत्तर नहीं पता।";
  }
}

// --- Bot Initialization ---
const bot = new Telegraf(TELEGRAM_TOKEN);

// Add proper bot error handling to prevent conflicts
bot.catch((err) => {
  logMessage('error', `Bot error: ${err.message}`);
});

// --- User Registration Helper ---
async function registerUser(ctx) {
  const { id, username, first_name, last_name } = ctx.from;
  try {
    const user = await User.findOneAndUpdate(
      { userId: String(id) },
      { 
        username: username || "",
        firstName: first_name || "",
        lastName: last_name || "",
        isActive: true 
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    logMessage('info', `User registered: ${first_name} (${id})`);
    return user;
  } catch (error) {
    logMessage('error', `User registration error: ${error.message}`);
    return null;
  }
}

// --- Registration Check Middleware ---
async function ensureRegistered(ctx, next) {
  const text = ctx.message?.text;
  if (!text || text.startsWith('/start')) return next();
  
  const userId = String(ctx.from.id);
  const exists = await User.exists({ userId, isActive: true });
  if (!exists) {
    return ctx.reply(
      "कृपया पहले /start कमांड भेजें। 🚀\n\n" +
      "Please send /start command first to register and begin chatting!"
    );
  }
  return next();
}

bot.use(ensureRegistered);

// --- /start Command Handler ---
bot.start(async (ctx) => {
  try {
    const user = await registerUser(ctx);
    if (!user) {
      return ctx.reply("रजिस्ट्रेशन में समस्या हुई। कृपया दोबारा कोशिश करें।");
    }

    const firstName = user.firstName || "Friend";
    const isExisting = await Message.exists({ userId: String(ctx.from.id) });

    if (isExisting && user.preferredLanguage) {
      // Returning user with language preference set
      const welcomeMsg = user.preferredLanguage === 'hindi' 
        ? `👋 स्वागत है ${firstName}!\n\nIIT मद्रास के बारे में कोई भी सवाल पूछें! 📚`
        : `👋 Welcome back ${firstName}!\n\nAsk me anything about IIT Madras! 📚`;
      
      await ctx.reply(welcomeMsg);
    } else {
      // New user or user without language preference - show language selection
      const welcomeText = 
        `🎉 स्वागत है ${firstName}! Welcome ${firstName}!\n\n` +
        `IIT Madras AI Bot में आपका स्वागत है! 🎓\n` +
        `Welcome to IIT Madras AI Bot! 🎓\n\n` +
        `कृपया अपनी पसंदीदा भाषा चुनें:\n` +
        `Please select your preferred language:`;

      const keyboard = {
        inline_keyboard: [
          [
            { text: "🇮🇳 हिंदी (Hindi)", callback_data: "lang_hindi" },
            { text: "🇬🇧 English", callback_data: "lang_english" }
          ]
        ]
      };

      await ctx.reply(welcomeText, { reply_markup: keyboard });
    }
  } catch (error) {
    logMessage('error', `Start command error: ${error.message}`);
    ctx.reply("कुछ गलती हो गई। कृपया बाद में प्रयास करें।");
  }
});

// --- Language Selection Callback Handler ---
bot.action(['lang_hindi', 'lang_english'], async (ctx) => {
  try {
    const userId = String(ctx.from.id);
    const selectedLang = ctx.match[0] === 'lang_hindi' ? 'hindi' : 'english';
    
    // Update user's preferred language
    await User.findOneAndUpdate(
      { userId },
      { preferredLanguage: selectedLang }
    );

    // Send confirmation message in selected language
    if (selectedLang === 'hindi') {
      await ctx.editMessageText(
        `✅ भाषा सेट की गई: हिंदी\n\n` +
        `🎓 मैं IIT मद्रास के बारे में जानकारी दे सकता हूं:\n` +
        `• कोर्सेज और विभाग\n` +
        `• प्रवेश प्रक्रिया\n` +
        `• फैकल्टी और सुविधाएं\n` +
        `• इवेंट्स और गतिविधियां\n\n` +
        `मुझसे कोई भी सवाल पूछें! 💬`
      );
    } else {
      await ctx.editMessageText(
        `✅ Language set: English\n\n` +
        `🎓 I can provide information about IIT Madras:\n` +
        `• Courses and Departments\n` +
        `• Admission Process\n` +
        `• Faculty and Facilities\n` +
        `• Events and Activities\n\n` +
        `Ask me anything! 💬`
      );
    }

    logMessage('info', `User ${ctx.from.first_name} (${userId}) selected language: ${selectedLang}`);
  } catch (error) {
    logMessage('error', `Language selection error: ${error.message}`);
    ctx.reply("भाषा सेटिंग में समस्या हुई। / Language setting error.");
  }
});

// --- Main Handler ---
bot.on("text", async (ctx) => {
  try {
    const userId = ctx.from.id.toString();
    const question = ctx.message.text;

    // Get user info for personalized responses
    const user = await User.findOne({ userId });
    
    // Check if user has set language preference
    if (!user.preferredLanguage) {
      return ctx.reply(
        "कृपया पहले /start कमांड भेजकर अपनी भाषा चुनें।\n\n" +
        "Please send /start command first to select your language! 🚀"
      );
    }
    
    // Show thinking message while processing
    const thinkingMessage = await ctx.reply("🤔 Thinking...");
    logMessage('info', `Question from ${ctx.from.first_name} (${userId}): ${question}`);
    
    // Fetch last 20 messages for better context
    const recentMessages = await Message.find({ userId })
      .sort({ timestamp: -1 })
      .limit(20)
      .lean();

    const history = recentMessages
      .slice()
      .reverse()
      .map((q) => `Q: ${q.question}\nA: ${q.answer}`)
      .join("\n");

    const language = user.preferredLanguage === 'hindi' ? 'Hindi' : 'English';

    const geminiPrompt = `
You are an intelligent chatbot specialized in IIT Madras information.
You have knowledge about courses, departments, admissions, events, faculty, and facilities.
Instructions:
1. Answer the user's question in the same language as the question (${language}).
2. Always consider the user's previous questions and answers (history) for context.
3. If you don't know the answer, politely say you don’t know.
4. Keep answers concise, clear, and only related to IIT Madras.
5. Format your answer for Telegram messaging - use simple formatting:
   - For bold text, use *bold text*
   - For lists, use simple bullet points with • or -
   - Avoid complex markdown formatting
   - Keep formatting minimal and readable
6. Do not use ** for bold, use * instead for Telegram compatibility.
Conversation History:
${history}
User Question:
${question}
Your Answer:
`;

    // Call Gemini API for response
    let answer = await callGemini(geminiPrompt);

    // Format answer for Telegram compatibility
    answer = formatForTelegram(answer);

    // Save Q&A to DB
    await Message.create({ userId, question, answer, timestamp: new Date() });

    // Edit the thinking message with actual response
    await ctx.telegram.editMessageText(
      ctx.chat.id,
      thinkingMessage.message_id,
      null,
      answer,
      { parse_mode: 'Markdown' }
    );
  } catch (err) {
    logMessage('error', `Main handler error: ${err.message}`);
    ctx.reply("कुछ गलती हो गई। कृपया बाद में प्रयास करें।");
  }
});

// --- Clean Shutdown ---
let isShuttingDown = false;

async function gracefulShutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  
  logMessage('info', `Received ${signal}. Shutting down gracefully...`);
  
  try {
    await bot.stop(signal);
    logMessage('info', 'Bot stopped');
    
    await mongoose.disconnect();
    logMessage('info', 'MongoDB disconnected');
    
    logMessage('info', 'Graceful shutdown complete');
    process.exit(0);
  } catch (error) {
    logMessage('error', `Error during shutdown: ${error.message}`);
    process.exit(1);
  }
}

process.once("SIGINT", () => gracefulShutdown("SIGINT"));
process.once("SIGTERM", () => gracefulShutdown("SIGTERM"));

// --- Launch Bot ---
async function startBot() {
  try {
    if (USE_WEBHOOK) {
      // Production mode - use webhook
      const webhookUrl = `${WEBHOOK_URL}/webhook/${TELEGRAM_TOKEN}`;
      await bot.telegram.setWebhook(webhookUrl);
      logMessage('info', `🎯 Webhook set: ${webhookUrl}`);
      logMessage('info', "🚀 Bot running in WEBHOOK mode (Production)");
    } else {
      // Development mode - use polling
      if (IS_PRODUCTION) {
        logMessage('warn', 'Production detected but webhook URL not available. Bot will not start to prevent conflicts.');
        logMessage('info', '💡 To run in production, set WEBHOOK_URL environment variable.');
        return;
      }
      
      await bot.launch({
        dropPendingUpdates: true  // This prevents conflict errors
      });
      logMessage('info', "🚀 Bot running in POLLING mode (Development)");
    }
    
    logMessage('info', "✅ Telegram IIT Madras AI bot is ready!");
    logMessage('info', `📊 Express logs server running at http://localhost:${PORT}`);
  } catch (error) {
    logMessage('error', `Failed to start bot: ${error.message}`);
    
    if (error.message.includes('Conflict: terminated by other getUpdates request')) {
      logMessage('error', '🚨 CONFLICT DETECTED: Another bot instance is running!');
      logMessage('info', '💡 This usually means the bot is already deployed in production.');
      logMessage('info', '🛑 Stopping local instance to prevent conflicts...');
      return;
    }
    
    if (error.message.includes('webhook') && USE_WEBHOOK) {
      logMessage('warn', 'Webhook setup failed. Retrying in 5 seconds...');
      setTimeout(() => startBot(), 5000);
    }
  }
}

// Only start the bot if not in production or if webhook is properly configured
if (!IS_PRODUCTION || USE_WEBHOOK) {
  startBot();
} else {
  logMessage('info', '⏸️  Bot startup skipped - Production environment detected without webhook URL');
  logMessage('info', '💡 Bot is likely already running on your deployment platform');
}
