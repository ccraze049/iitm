# IIT Madras AI Telegram Bot

## Overview
This is a specialized Telegram chatbot that provides information about IIT Madras including courses, departments, admissions, events, faculty, and facilities. The bot uses Google's Gemini AI for generating intelligent responses and supports both English and Hindi languages.

## Architecture
- **Backend**: Node.js with Telegraf framework for Telegram bot functionality
- **Database**: MongoDB for storing conversation history and context
- **AI**: Google Gemini API for generating responses
- **Language**: Supports Hindi and English with automatic language detection

## Key Features
- User registration system with /start command
- Intelligent responses about IIT Madras information
- Enhanced conversation history (20 messages) for context-aware responses
- Automatic language detection (Hindi/English)
- Personalized responses based on user registration and history
- Database indexing for improved performance
- "🤔 Thinking..." message while processing user queries
- Telegram markdown formatting for proper text display

## Required Environment Variables
The following secrets need to be configured in Replit's Secrets tab:
- `TELEGRAM_TOKEN`: Bot token from @BotFather on Telegram
- `GEMINI_API_KEY`: Google Gemini API key
- `MONGO_URI`: MongoDB connection string

## Project Structure
- `index.js`: Main bot application file
- `package.json`: Node.js dependencies and scripts
- Dependencies: telegraf, mongoose, axios, franc, axios-retry

## Recent Changes
- Implemented user registration system with User schema
- Added /start command handler for user onboarding
- Enhanced conversation history from 5 to 20 messages for better AI context
- Added database indexing for performance optimization
- Implemented middleware to ensure user registration before chat
- Bot now provides personalized responses based on user history
- Disabled startup API test for production efficiency
- **SECURITY FIX**: Moved hardcoded secrets to environment variables for security
- Added environment variable validation on startup
- Fixed critical security vulnerability by removing exposed API keys and tokens

## Setup Instructions
1. Users must send /start command to register before chatting
2. Bot automatically saves and uses conversation history for context
3. Supports both new user welcome and returning user recognition
4. MongoDB is connected with optimized indexing for performance
5. Deploy to production using the configured deployment settings

## Deployment
- Target: VM (for persistent bot operation)
- Command: `npm start`
- The bot runs continuously to handle incoming Telegram messages