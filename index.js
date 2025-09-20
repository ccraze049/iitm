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

// Test Gemini API on startup
async function testGeminiAPI() {
  try {
    console.log("Testing Gemini API...");
    const testResponse = await callGemini("Say hello in Hindi and English");
    console.log("Gemini API Test Result:", testResponse);
  } catch (error) {
    console.error("Gemini API Test Failed:", error.message);
  }
}

// Run test after MongoDB connects
setTimeout(testGeminiAPI, 2000);

const messageSchema = new mongoose.Schema({
  userId: String,
  question: String,
  answer: String,
  timestamp: { type: Date, default: Date.now },
});
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
    console.log("Calling Gemini API...");
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
    
    console.log("Gemini API Response Status:", response.status);
    console.log("Response Data:", JSON.stringify(response.data, null, 2));
    
    const aiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (aiResponse) {
      console.log("AI Response received successfully");
      return aiResponse;
    } else {
      console.log("No valid response from Gemini API");
      return "मुझे इसका उत्तर नहीं पता।";
    }
  } catch (error) {
    console.error("Gemini API Error Details:");
    console.error("Status:", error.response?.status);
    console.error("Data:", error.response?.data);
    console.error("Message:", error.message);
    return "मुझे इसका उत्तर नहीं पता।";
  }
}

// --- Bot Initialization ---
const bot = new Telegraf(TELEGRAM_TOKEN);

// --- Main Handler ---
bot.on("text", async (ctx) => {
  try {
    const userId = ctx.from.id.toString();
    const question = ctx.message.text;

    // Fetch last 5 messages for context
    const recentMessages = await Message.find({ userId })
      .sort({ timestamp: -1 })
      .limit(5)
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
