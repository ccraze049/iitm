// Required Libraries
const { Telegraf } = require("telegraf");
const mongoose = require("mongoose");
const axios = require("axios");
// Dynamic import for franc (ESM module)
let franc;
(async () => {
  const francModule = await import('franc');
  franc = francModule.franc;
})();
const express = require("express");

// Local Data Files (import from parent directory)
const feesData = require("../fees");
const centersData = require("../centers");

// --- CONFIGURATION (Multiple API Key System) ---
const TELEGRAM_TOKEN = "7673072912:AAE2jkuvfU69hy4Z0nz-qmySf2uXkb5vw1E";

// Multiple Gemini API Keys for load balancing
const GEMINI_API_KEYS = [
  "AIzaSyCNzm-bOgTEJGuntyHGIag2qkSbhYqYvpQ",
  "AIzaSyB9kKwwRXJ10nN3sjGXFGpYwhk0TuXjQl4",
  "AIzaSyAnBwpxQlkdh1ekLSRj-bZ0XWanzOqrGNw"
];

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const MONGO_URI = "mongodb+srv://codeyogiai_db_user:EbyqKN8BUbfcrqcZ@iitm.qpgyazn.mongodb.net/?retryWrites=true&w=majority&appName=Iitm";

// API Key rotation system
let currentKeyIndex = 0;
const getNextGeminiApiKey = () => {
  const key = GEMINI_API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % GEMINI_API_KEYS.length;
  return key;
};

// --- Logs Storage ---
const botLogs = [];
const maxLogs = 1000; // Keep last 1000 logs

// Custom console logging function
const originalLog = console.log;
const originalError = console.error;

console.log = (...args) => {
  const timestamp = new Date().toISOString();
  const message = args.join(' ');
  botLogs.push({ timestamp, level: 'INFO', message });
  if (botLogs.length > maxLogs) botLogs.shift();
  originalLog(`[${timestamp}] INFO:`, ...args);
};

console.error = (...args) => {
  const timestamp = new Date().toISOString();
  const message = args.join(' ');
  botLogs.push({ timestamp, level: 'ERROR', message });
  if (botLogs.length > maxLogs) botLogs.shift();
  originalError(`[${timestamp}] ERROR:`, ...args);
};

// --- Express Server Setup ---
const app = express();
const PORT = 5000;

// Middleware for parsing JSON (required for webhooks)
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>IIT Madras Bot - Logs Dashboard</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { 
                font-family: 'Courier New', monospace; 
                background: #1e1e1e; 
                color: #d4d4d4; 
                margin: 0; 
                padding: 20px; 
            }
            .header {
                background: #2d3748;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 20px;
                text-align: center;
            }
            .stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin-bottom: 20px;
            }
            .stat-card {
                background: #2d3748;
                padding: 15px;
                border-radius: 8px;
                text-align: center;
            }
            .logs-container { 
                background: #252526; 
                border: 1px solid #3e3e42; 
                border-radius: 8px; 
                padding: 20px; 
                max-height: 600px; 
                overflow-y: auto; 
            }
            .log-entry { 
                margin-bottom: 8px; 
                padding: 8px; 
                border-radius: 4px; 
                font-size: 13px; 
                line-height: 1.4; 
            }
            .log-info { background: #1a2332; border-left: 3px solid #007acc; }
            .log-error { background: #2d1b1b; border-left: 3px solid #f14c4c; }
            .timestamp { color: #608b4e; font-weight: bold; }
            .level { 
                display: inline-block; 
                padding: 2px 8px; 
                border-radius: 12px; 
                font-size: 11px; 
                font-weight: bold; 
            }
            .level-info { background: #007acc; color: white; }
            .level-error { background: #f14c4c; color: white; }
            .refresh-btn {
                background: #007acc;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                margin-bottom: 20px;
                font-size: 14px;
            }
            .refresh-btn:hover { background: #005a9e; }
            h1 { color: #569cd6; margin: 0; }
            h2 { color: #4ec9b0; }
        </style>
        <script>
            function refreshLogs() {
                location.reload();
            }
            setInterval(refreshLogs, 30000); // Auto refresh every 30 seconds
        </script>
    </head>
    <body>
        <div class="header">
            <h1>🤖 IIT Madras AI Bot - Live Dashboard</h1>
            <p>Real-time monitoring of Telegram bot activity</p>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <h3>Total Logs</h3>
                <h2>${botLogs.length}</h2>
            </div>
            <div class="stat-card">
                <h3>Bot Status</h3>
                <h2>🟢 Running</h2>
            </div>
            <div class="stat-card">
                <h3>Last Updated</h3>
                <h2>${new Date().toLocaleTimeString()}</h2>
            </div>
        </div>
        
        <button class="refresh-btn" onclick="refreshLogs()">🔄 Refresh Logs</button>
        
        <div class="logs-container">
            <h2>📋 Live Logs (Latest ${botLogs.length} entries)</h2>
            ${botLogs.slice(-100).reverse().map(log => `
                <div class="log-entry log-${log.level.toLowerCase()}">
                    <span class="timestamp">[${new Date(log.timestamp).toLocaleTimeString()}]</span>
                    <span class="level level-${log.level.toLowerCase()}">${log.level}</span>
                    <span>${log.message}</span>
                </div>
            `).join('')}
            ${botLogs.length === 0 ? '<p style="color: #888;">No logs yet... Bot starting up...</p>' : ''}
        </div>
    </body>
    </html>
  `;
  res.send(html);
});

app.get('/api/logs', (req, res) => {
  res.json({ logs: botLogs, count: botLogs.length });
});

// Webhook endpoint for Telegram
app.post('/webhook', (req, res) => {
  bot.handleUpdate(req.body);
  res.sendStatus(200);
});

// For Vercel deployment - check if we're in serverless environment
const isVercel = process.env.VERCEL || process.env.NOW_REGION;

if (!isVercel) {
  // Start Express Server locally
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Dashboard server running on http://0.0.0.0:${PORT}`);
    console.log(`📊 View logs at: http://0.0.0.0:${PORT}`);
  });
}

// --- MongoDB Setup ---
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

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
  if (!franc) {
    // Fallback to basic detection if franc not loaded yet
    const hindiPattern = /[\u0900-\u097F]/;
    return hindiPattern.test(text) ? "Hindi" : "English";
  }
  const langCode = franc(text);
  if (langCode === "hin") return "Hindi";
  return "English";
};

// --- Data Filtering Functions ---
const searchFeesData = (query) => {
  const lowerQuery = query.toLowerCase();
  let relevantData = {};

  // Check for fee-related keywords
  if (lowerQuery.includes('fee') || lowerQuery.includes('फीस') || 
      lowerQuery.includes('cost') || lowerQuery.includes('charge') ||
      lowerQuery.includes('payment') || lowerQuery.includes('tuition') ||
      lowerQuery.includes('degree') || lowerQuery.includes('course')) {
    
    // Check for specific courses
    if (lowerQuery.includes('btech') || lowerQuery.includes('b.tech') || 
        lowerQuery.includes('undergraduate') || lowerQuery.includes('ug')) {
      relevantData.btech = feesData.btech;
    }
    
    if (lowerQuery.includes('dual') || lowerQuery.includes('iddd') || 
        lowerQuery.includes('integrated') || lowerQuery.includes('5 year') || 
        lowerQuery.includes('5-year') || lowerQuery.includes('five year')) {
      relevantData.dualDegree = feesData.dualDegree;
    }
    
    if (lowerQuery.includes('mtech') || lowerQuery.includes('m.tech') || 
        lowerQuery.includes('postgraduate') || lowerQuery.includes('pg')) {
      relevantData.mtech = feesData.mtech;
    }
    
    if (lowerQuery.includes('mba') && !lowerQuery.includes('executive')) {
      relevantData.mba = feesData.mba;
    }
    
    if ((lowerQuery.includes('m.a') || lowerQuery.includes('master of arts') || 
        (lowerQuery.includes(' ma ') || lowerQuery.startsWith('ma ') || lowerQuery.endsWith(' ma'))) 
        && !lowerQuery.includes('mba')) {
      relevantData.ma = feesData.ma;
    }
    
    if (lowerQuery.includes('executive mba') || lowerQuery.includes('emba') || 
        lowerQuery.includes('executive')) {
      relevantData.emba = feesData.emba;
    }
    
    if (lowerQuery.includes('phd') || lowerQuery.includes('ph.d') || 
        lowerQuery.includes('doctorate') || lowerQuery.includes('research')) {
      relevantData.phd = feesData.phd;
    }
    
    if (lowerQuery.includes('bs') || lowerQuery.includes('b.s') || 
        lowerQuery.includes('online') || lowerQuery.includes('programming') ||
        lowerQuery.includes('data science') || lowerQuery.includes('bachelor')) {
      relevantData.bsDegree = feesData.bsDegree;
    }
    
    if (lowerQuery.includes('hostel') || lowerQuery.includes('mess') || 
        lowerQuery.includes('accommodation') || lowerQuery.includes('रहना')) {
      relevantData.hostelMess = feesData.hostelMess;
    }
    
    if (lowerQuery.includes('international') || lowerQuery.includes('foreign')) {
      relevantData.international = feesData.international;
    }
    
    // If no specific course mentioned, include general fee info
    if (Object.keys(relevantData).length === 0) {
      relevantData = feesData;
    }
    
    // Always include fee structure info for context
    relevantData.feeStructureInfo = feesData.feeStructureInfo;
  }
  
  return relevantData;
};

const searchCentersData = (query) => {
  const lowerQuery = query.toLowerCase();
  let relevantData = {};

  // Check for location/center-related keywords
  if (lowerQuery.includes('location') || lowerQuery.includes('center') || 
      lowerQuery.includes('campus') || lowerQuery.includes('address') ||
      lowerQuery.includes('where') || lowerQuery.includes('कहाँ') ||
      lowerQuery.includes('स्थान') || lowerQuery.includes('केंद्र')) {
    
    // Main campus
    if (lowerQuery.includes('main') || lowerQuery.includes('chennai') || 
        lowerQuery.includes('मुख्य') || lowerQuery.includes('चेन्नई')) {
      relevantData.mainCampus = centersData.mainCampus;
    }
    
    // Research park
    if (lowerQuery.includes('research') || lowerQuery.includes('park') || 
        lowerQuery.includes('company') || lowerQuery.includes('startup')) {
      relevantData.researchParks = centersData.researchParks;
    }
    
    // Specific cities
    if (lowerQuery.includes('hyderabad') || lowerQuery.includes('हैदराबाद')) {
      relevantData.hyderabad = centersData.extensionCenters.hyderabad;
    }
    
    if (lowerQuery.includes('bangalore') || lowerQuery.includes('bengaluru') || 
        lowerQuery.includes('बैंगलोर')) {
      relevantData.bangalore = centersData.extensionCenters.bangalore;
    }
    
    if (lowerQuery.includes('sri lanka') || lowerQuery.includes('srilanka') || 
        lowerQuery.includes('kandy')) {
      relevantData.srilanka = centersData.international.srilanka;
    }
    
    // Hostels
    if (lowerQuery.includes('hostel') || lowerQuery.includes('accommodation') || 
        lowerQuery.includes('रहना') || lowerQuery.includes('छात्रावास')) {
      relevantData.hostels = centersData.hostels;
    }
    
    // Departments
    if (lowerQuery.includes('department') || lowerQuery.includes('विभाग')) {
      relevantData.departments = centersData.departmentLocations;
      relevantData.mainCampus = centersData.mainCampus;
    }
    
    // Transportation
    if (lowerQuery.includes('transport') || lowerQuery.includes('bus') || 
        lowerQuery.includes('metro') || lowerQuery.includes('reach') ||
        lowerQuery.includes('पहुँचना') || lowerQuery.includes('यातायात')) {
      relevantData.transportation = centersData.transportation;
    }
    
    // If no specific location mentioned, include main campus and contact info
    if (Object.keys(relevantData).length === 0) {
      relevantData.mainCampus = centersData.mainCampus;
      relevantData.contactInfo = centersData.contactInfo;
    }
    
    // Always include contact info for reference
    relevantData.contactInfo = centersData.contactInfo;
  }
  
  return relevantData;
};

const getRelevantLocalData = (query) => {
  const feesInfo = searchFeesData(query);
  const centersInfo = searchCentersData(query);
  
  return {
    fees: feesInfo,
    centers: centersInfo,
    hasRelevantData: Object.keys(feesInfo).length > 0 || Object.keys(centersInfo).length > 0
  };
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

// --- Rate Limiting Helper ---
let lastGeminiCall = 0;
const GEMINI_RATE_LIMIT = 2000; // 2 seconds between calls

// --- Improved Gemini API Handler with Multiple API Keys ---
async function callGemini(prompt, retryCount = 0, failedKeys = new Set()) {
  const maxRetries = GEMINI_API_KEYS.length * 2; // Allow more retries with multiple keys
  
  try {
    // Rate limiting - ensure minimum time between API calls
    const now = Date.now();
    const timeSinceLastCall = now - lastGeminiCall;
    if (timeSinceLastCall < GEMINI_RATE_LIMIT) {
      const waitTime = GEMINI_RATE_LIMIT - timeSinceLastCall;
      console.log(`[RATE LIMIT] Waiting ${waitTime}ms before API call`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    lastGeminiCall = Date.now();
    
    // Get next API key (skip failed ones if possible)
    let currentApiKey = getNextGeminiApiKey();
    let attempts = 0;
    while (failedKeys.has(currentApiKey) && attempts < GEMINI_API_KEYS.length) {
      currentApiKey = getNextGeminiApiKey();
      attempts++;
    }
    
    console.log(`[GEMINI API] Using key ${currentKeyIndex}/${GEMINI_API_KEYS.length}`);
    
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
          "x-goog-api-key": currentApiKey,
        },
        timeout: 30000, // Reduced timeout for cloud deployment
      },
    );
    
    const aiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (aiResponse) {
      return aiResponse;
    } else {
      return "Sorry, I couldn't process your request. Please try again.";
    }
  } catch (error) {
    const status = error.response?.status;
    const message = error.message;
    
    console.error(`[GEMINI API] Error ${status}: ${message}`);
    
    // Mark current key as failed for quota/auth errors
    if (status === 429 || status === 403) {
      failedKeys.add(getNextGeminiApiKey());
      console.log(`[API KEY] Marked key as failed. ${failedKeys.size}/${GEMINI_API_KEYS.length} keys failed`);
    }
    
    // Handle specific error codes
    if ((status === 429 || status === 403) && retryCount < maxRetries && failedKeys.size < GEMINI_API_KEYS.length) {
      // Try next API key immediately for quota/auth errors
      console.log(`[RETRY ${retryCount + 1}/${maxRetries}] Trying next API key...`);
      return callGemini(prompt, retryCount + 1, failedKeys);
    }
    
    if (status === 429 && retryCount < maxRetries) {
      // Rate limit exceeded - retry with exponential backoff
      const backoffTime = Math.pow(2, retryCount) * 3000; // 3s, 6s, 12s
      console.log(`[RETRY ${retryCount + 1}/${maxRetries}] Rate limited, waiting ${backoffTime}ms`);
      await new Promise(resolve => setTimeout(resolve, backoffTime));
      return callGemini(prompt, retryCount + 1, failedKeys);
    }
    
    if (status === 403 && failedKeys.size >= GEMINI_API_KEYS.length) {
      return "All API keys quota exceeded. Please try again later.";
    }
    
    if (status === 400) {
      return "Invalid request. Please rephrase your question.";
    }
    
    // Generic fallback for all other errors
    return "I'm having trouble connecting to the AI service. Please try again later.";
  }
}

// --- Bot Initialization ---
const bot = new Telegraf(TELEGRAM_TOKEN);

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
    return user;
  } catch (error) {
    console.error("User registration error:", error);
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

// --- /language Command Handler ---
bot.command('language', async (ctx) => {
  try {
    const userId = String(ctx.from.id);
    const user = await User.findOne({ userId });
    
    if (!user) {
      return ctx.reply(
        "कृपया पहले /start कमांड भेजें। 🚀\n\n" +
        "Please send /start command first to register!"
      );
    }

    const currentLang = user.preferredLanguage === 'hindi' ? 'हिंदी' : 'English';
    
    const languageText = 
      `🌐 भाषा बदलें / Change Language\n\n` +
      `वर्तमान भाषा / Current Language: ${currentLang}\n\n` +
      `कृपया अपनी नई भाषा चुनें:\n` +
      `Please select your new language:`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: "🇮🇳 हिंदी (Hindi)", callback_data: "change_lang_hindi" },
          { text: "🇬🇧 English", callback_data: "change_lang_english" }
        ]
      ]
    };

    await ctx.reply(languageText, { reply_markup: keyboard });
  } catch (error) {
    console.error("Language command error:", error);
    ctx.reply("भाषा बदलने में समस्या हुई। / Language change error.");
  }
});

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
    console.error("Start command error:", error);
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

    console.log(`User ${ctx.from.first_name} (${userId}) selected language: ${selectedLang}`);
  } catch (error) {
    console.error("Language selection error:", error);
    ctx.reply("भाषा सेटिंग में समस्या हुई। / Language setting error.");
  }
});

// --- Language Change Callback Handler ---
bot.action(['change_lang_hindi', 'change_lang_english'], async (ctx) => {
  try {
    const userId = String(ctx.from.id);
    const selectedLang = ctx.match[0] === 'change_lang_hindi' ? 'hindi' : 'english';
    
    // Update user's preferred language
    await User.findOneAndUpdate(
      { userId },
      { preferredLanguage: selectedLang }
    );

    // Send confirmation message in selected language
    if (selectedLang === 'hindi') {
      await ctx.editMessageText(
        `✅ भाषा बदल दी गई: हिंदी\n\n` +
        `🎓 अब मैं हिंदी में जवाब दूंगा।\n` +
        `आप मुझसे IIT मद्रास के बारे में कोई भी सवाल पूछ सकते हैं! 💬`
      );
    } else {
      await ctx.editMessageText(
        `✅ Language changed: English\n\n` +
        `🎓 I will now respond in English.\n` +
        `Ask me anything about IIT Madras! 💬`
      );
    }

    console.log(`User ${ctx.from.first_name} (${userId}) changed language to: ${selectedLang}`);
  } catch (error) {
    console.error("Language change error:", error);
    ctx.reply("भाषा बदलने में समस्या हुई। / Language change error.");
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

    // Get relevant local data based on user question
    const localData = getRelevantLocalData(question);
    
    // Prepare local data section for prompt
    let localDataSection = '';
    if (localData.hasRelevantData) {
      localDataSection = `
IMPORTANT: Use the following OFFICIAL IIT Madras data to answer user questions:

FEES DATA:
${Object.keys(localData.fees).length > 0 ? JSON.stringify(localData.fees, null, 2) : 'No fee data relevant to this query'}

CENTERS & LOCATIONS DATA:
${Object.keys(localData.centers).length > 0 ? JSON.stringify(localData.centers, null, 2) : 'No centers data relevant to this query'}

INSTRUCTIONS FOR USING LOCAL DATA:
- ALWAYS prioritize this official data over general knowledge
- Extract specific information from the data above
- Present the information in a user-friendly way
- Convert JSON data into readable format
- Include relevant contact information when available
`;
    }

    const geminiPrompt = `
You are an intelligent chatbot specialized in IIT Madras information.
You have knowledge about courses, departments, admissions, events, faculty, and facilities.

${localDataSection}

Instructions:
1. Answer the user's question in the same language as the question (${language}).
2. ALWAYS use the official local data provided above when available for fees and centers information.
3. Always consider the user's previous questions and answers (history) for context.
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
    console.error(err);
    ctx.reply("कुछ गलती हो गई। कृपया बाद में प्रयास करें।");
  }
});

// --- Clean Shutdown ---
process.once("SIGINT", () => {
  bot.stop("SIGINT");
  mongoose.disconnect();
});
process.once("SIGTERM", () => {
  bot.stop("SIGTERM");
  mongoose.disconnect();
});

// --- Launch Bot with Retry Logic ---
async function launchBot(retryCount = 0) {
  const maxRetries = 5;
  const baseDelay = 2000; // 2 seconds
  
  try {
    if (!isVercel) {
      // Local development - use long polling with retry logic
      console.log(`[BOT LAUNCH] Attempt ${retryCount + 1}/${maxRetries + 1} - Starting Telegram bot...`);
      await bot.launch();
      console.log("✅ Telegram IIT Madras AI bot running successfully!");
    } else {
      // Production on Vercel - webhook mode
      console.log("Bot configured for webhook mode on Vercel");
    }
  } catch (error) {
    console.error(`[BOT LAUNCH] Error on attempt ${retryCount + 1}:`, error.message);
    
    if (retryCount < maxRetries) {
      const delay = baseDelay * Math.pow(2, retryCount); // Exponential backoff
      console.log(`[BOT LAUNCH] Retrying in ${delay}ms... (${retryCount + 1}/${maxRetries})`);
      
      setTimeout(() => {
        launchBot(retryCount + 1);
      }, delay);
    } else {
      console.error("❌ Failed to launch bot after maximum retries. Bot may still work via webhooks.");
      // Don't exit the process - server should still be available for webhooks
    }
  }
}

// Add initial delay for deployment environments
const startupDelay = process.env.NODE_ENV === 'production' ? 3000 : 1000;
console.log(`[STARTUP] Waiting ${startupDelay}ms before bot initialization...`);

setTimeout(() => {
  launchBot();
}, startupDelay);

// Export for Vercel
module.exports = app;
