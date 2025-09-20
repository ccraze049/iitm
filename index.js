// Required Libraries
const { Telegraf } = require("telegraf");
const mongoose = require("mongoose");
const axios = require("axios");
const { franc } = require("franc");

// --- CONFIGURATION (Hardcoded) ---
const TELEGRAM_TOKEN = "7673072912:AAE2jkuvfU69hy4Z0nz-qmySf2uXkb5vw1E";
const GEMINI_API_KEY = "AIzaSyAnBwpxQlkdh1ekLSRj-bZ0XWanzOqrGNw";
const GEMINI_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const MONGO_URI =
  "mongodb+srv://codeyogiai_db_user:EbyqKN8BUbfcrqcZ@iitm.qpgyazn.mongodb.net/?retryWrites=true&w=majority&appName=Iitm";


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

    if (isExisting) {
      await ctx.reply(
        `👋 स्वागत है ${firstName}!\n\n` +
        `Welcome back! I remember our previous conversations.\n\n` +
        `IIT मद्रास के बारे में कोई भी सवाल पूछें! 📚`
      );
    } else {
      await ctx.reply(
        `🎉 स्वागत है ${firstName}!\n\n` +
        `Welcome to IIT Madras AI Bot! 🎓\n\n` +
        `मैं IIT मद्रास के बारे में जानकारी दे सकता हूं:\n` +
        `• कोर्सेज और विभाग\n` +
        `• प्रवेश प्रक्रिया\n` +
        `• फैकल्टी और सुविधाएं\n` +
        `• इवेंट्स और गतिविधियां\n\n` +
        `मुझसे हिंदी या अंग्रेजी में कोई भी सवाल पूछें! 💬`
      );
    }
  } catch (error) {
    console.error("Start command error:", error);
    ctx.reply("कुछ गलती हो गई। कृपया बाद में प्रयास करें।");
  }
});

// --- Main Handler ---
bot.on("text", async (ctx) => {
  try {
    const userId = ctx.from.id.toString();
    const question = ctx.message.text;

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

    const language = detectLanguage(question);

    const geminiPrompt = `
You are an intelligent chatbot specialized in IIT Madras information.
You have knowledge about courses, departments, admissions, events, faculty, and facilities.
Instructions:
1. Answer the user's question in the same language as the question (${language}).
2. Always consider the user's previous questions and answers (history) for context.
3. If you don't know the answer, politely say you don’t know.
4. Keep answers concise, clear, and only related to IIT Madras.
5. Format your answer to be suitable for a Telegram message.
Conversation History:
${history}
User Question:
${question}
Your Answer:
`;

    // Call Gemini API for response
    const answer = await callGemini(geminiPrompt);

    // Save Q&A to DB
    await Message.create({ userId, question, answer, timestamp: new Date() });

    // Reply to user
    ctx.reply(answer);
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
