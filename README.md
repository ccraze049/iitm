# IIT Madras AI Telegram Bot

A specialized Telegram chatbot that provides information about IIT Madras including courses, departments, admissions, events, faculty, and facilities. Features a web dashboard for monitoring bot logs in real-time.

## Features
- 🤖 AI-powered responses using Google Gemini
- 🇮🇳 Support for Hindi and English languages
- 📊 Real-time web dashboard for monitoring logs
- 🗄️ MongoDB integration for conversation history
- 📱 User registration and personalized responses

## Deployment Options

### 1. Vercel Deployment (Recommended for Production)

#### Prerequisites
- Vercel account
- Environment variables configured in Vercel dashboard

#### Steps:
1. Fork/clone this repository
2. Connect to Vercel
3. Set environment variables in Vercel dashboard:
   - `TELEGRAM_TOKEN`: Your bot token from @BotFather
   - `GEMINI_API_KEY`: Google Gemini API key
   - `MONGO_URI`: MongoDB connection string

4. Deploy!

#### Setting up Webhook (for Vercel)
After deployment, set your bot webhook URL:
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-vercel-app.vercel.app/webhook"}'
```

### 2. Local Development

#### Prerequisites
- Node.js 18+
- MongoDB instance

#### Steps:
1. Clone the repository
2. Install dependencies: `npm install`
3. Update hardcoded credentials in `index.js` (lines 15-19)
4. Start the bot: `npm start`
5. Access dashboard: `http://localhost:5000`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `TELEGRAM_TOKEN` | Bot token from @BotFather | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `MONGO_URI` | MongoDB connection string | Yes |

## Bot Commands
- `/start` - Register user and set language preference

## Web Dashboard
- Real-time log monitoring
- Bot status tracking
- Auto-refresh every 30 seconds
- Dark theme interface

## Tech Stack
- **Backend**: Node.js, Express.js
- **Bot Framework**: Telegraf
- **Database**: MongoDB (via Mongoose)
- **AI**: Google Gemini API
- **Deployment**: Vercel (serverless) / Local