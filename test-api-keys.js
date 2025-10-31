const axios = require("axios");

// API Keys from index.js
const GEMINI_API_KEYS = [
  "AIzaSyB9kKwwRXJ10nN3sjGXFGpYwhk0TuXjQl4",
  "AIzaSyBSyhXwmY1e1b7F_R90Jdu0cuhIG8bCTf4",
  "AIzaSyDLYSYY4n2yDJlHVxhSdBUmsKoKJAVHoOg",
  "AIzaSyDj5Zc5ltsczQdwIdDsX4BPz3TwCHuYIhw",
  "AIzaSyBjZ3W9JJpUr7pEEl-IWG-oMmpdkTLs3T0",
];

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

// Test function for each API key
async function testApiKey(apiKey, index) {
  console.log(`\n🔍 Testing API Key ${index + 1}/${GEMINI_API_KEYS.length}`);
  console.log(`Key: ${apiKey.substring(0, 20)}...${apiKey.substring(apiKey.length - 4)}`);
  
  try {
    const response = await axios.post(
      GEMINI_BASE_URL,
      {
        contents: [
          {
            parts: [{ text: "Say 'Hello' in one word." }],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        timeout: 10000,
      }
    );
    
    const aiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (aiResponse) {
      console.log(`✅ STATUS: WORKING`);
      console.log(`📝 Response: ${aiResponse.trim()}`);
      return { index: index + 1, key: apiKey, status: "WORKING", response: aiResponse.trim() };
    } else {
      console.log(`⚠️  STATUS: INVALID RESPONSE`);
      return { index: index + 1, key: apiKey, status: "INVALID RESPONSE", error: "No response text" };
    }
  } catch (error) {
    const status = error.response?.status;
    const errorMessage = error.response?.data?.error?.message || error.message;
    
    console.log(`❌ STATUS: FAILED`);
    console.log(`Error Code: ${status || 'N/A'}`);
    console.log(`Error Message: ${errorMessage}`);
    
    return { 
      index: index + 1, 
      key: apiKey, 
      status: "FAILED", 
      errorCode: status,
      error: errorMessage 
    };
  }
}

// Test all API keys
async function testAllKeys() {
  console.log("=" .repeat(60));
  console.log("🔑 GEMINI API KEYS TESTING STARTED");
  console.log("=" .repeat(60));
  
  const results = [];
  
  for (let i = 0; i < GEMINI_API_KEYS.length; i++) {
    const result = await testApiKey(GEMINI_API_KEYS[i], i);
    results.push(result);
    
    // Wait 1 second between requests
    if (i < GEMINI_API_KEYS.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Summary
  console.log("\n" + "=" .repeat(60));
  console.log("📊 SUMMARY REPORT");
  console.log("=" .repeat(60));
  
  const workingKeys = results.filter(r => r.status === "WORKING");
  const failedKeys = results.filter(r => r.status === "FAILED");
  
  console.log(`\n✅ Working Keys: ${workingKeys.length}/${GEMINI_API_KEYS.length}`);
  workingKeys.forEach(key => {
    console.log(`   - Key ${key.index}: ${key.key.substring(0, 20)}...`);
  });
  
  console.log(`\n❌ Failed Keys: ${failedKeys.length}/${GEMINI_API_KEYS.length}`);
  failedKeys.forEach(key => {
    console.log(`   - Key ${key.index}: ${key.key.substring(0, 20)}... (Error: ${key.errorCode || key.error})`);
  });
  
  console.log("\n" + "=" .repeat(60));
}

// Run the test
testAllKeys().catch(console.error);
