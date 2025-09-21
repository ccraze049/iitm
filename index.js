// Required Libraries
const { Telegraf } = require("telegraf");
const mongoose = require("mongoose");
const axios = require("axios");
const { franc } = require("franc");

// Local Data Files
const feesData = require("./fees");
const centersData = require("./centers");

// --- CONFIGURATION ---
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const MONGO_URI = process.env.MONGO_URI;

// Validate required environment variables
if (!TELEGRAM_TOKEN) {
  console.error("ERROR: TELEGRAM_TOKEN environment variable is required");
  process.exit(1);
}
if (!GEMINI_API_KEY) {
  console.error("ERROR: GEMINI_API_KEY environment variable is required");
  process.exit(1);
}
if (!MONGO_URI) {
  console.error("ERROR: MONGO_URI environment variable is required");
  process.exit(1);
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
      lowerQuery.includes('payment') || lowerQuery.includes('tuition')) {
    
    // Check for specific courses
    if (lowerQuery.includes('btech') || lowerQuery.includes('b.tech') || 
        lowerQuery.includes('undergraduate') || lowerQuery.includes('ug')) {
      relevantData.btech = feesData.btech;
    }
    
    if (lowerQuery.includes('mtech') || lowerQuery.includes('m.tech') || 
        lowerQuery.includes('postgraduate') || lowerQuery.includes('pg')) {
      relevantData.mtech = feesData.mtech;
    }
    
    if (lowerQuery.includes('mba')) {
      relevantData.mba = feesData.mba;
    }
    
    if (lowerQuery.includes('phd') || lowerQuery.includes('doctorate') || 
        lowerQuery.includes('research')) {
      relevantData.phd = feesData.phd;
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
    console.error("Gemini API Error:", error.response?.status || error.message);
    return "मुझे इसका उत्तर नहीं पता।";
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

// --- Launch Bot ---
bot.launch();
console.log("Telegram IIT Madras AI bot running...");
