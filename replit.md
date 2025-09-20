# IIT Madras AI Telegram Bot

## Overview
This is a specialized Telegram chatbot that provides information about IIT Madras including courses, departments, admissions, events, faculty, and facilities. The bot uses Google's Gemini AI for generating intelligent responses and supports both English and Hindi languages.

## Architecture
- **Backend**: Node.js with Telegraf framework for Telegram bot functionality
- **Database**: MongoDB for storing conversation history and context
- **AI**: Google Gemini API for generating responses
- **Language**: Supports Hindi and English with automatic language detection

## Key Features
- Intelligent responses about IIT Madras information
- Conversation history for context-aware responses
- Automatic language detection (Hindi/English)
- Secure API key management via environment variables

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
- Converted hardcoded API keys to environment variables for security
- Added proper error handling for missing environment variables
- Configured Replit workflow for bot execution
- Set up deployment configuration for production use
- Added validation for required environment variables

## Setup Instructions
1. Set up the required environment variables in Replit Secrets
2. The bot will automatically start via the configured workflow
3. Deploy to production using the configured deployment settings

## Deployment
- Target: VM (for persistent bot operation)
- Command: `npm start`
- The bot runs continuously to handle incoming Telegram messages