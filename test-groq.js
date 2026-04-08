require('dotenv').config();
const { callLLMJSON } = require('./backend/utils/llmClient');

async function testFallback() {
  console.log("Temporarily breaking Gemini API key...");
  const oldKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "invalid_key_to_force_fallback";
  process.env.GEMINI_API_KEY_FALLBACK_1 = "invalid_fallback";
  process.env.GEMINI_API_KEY_FALLBACK_2 = "invalid_fallback";
  process.env.GEMINI_API_KEY_FALLBACK_3 = "invalid_fallback";

  // Instead of breaking the env (which geminiClient caches on import),
  // we can use a known Gemini error (like an invalid context or model) 
  // or we can test callLLM directly by monkeypatching the geminiClient.
  
  const geminiClient = require('./backend/utils/geminiClient');
  const groqClient = require('./backend/utils/groqClient');
  
  // Monkey-patch Gemini to force an error
  geminiClient.callGeminiJSON = async () => {
    throw new Error("Simulated Gemini Failure");
  };

  const prompt = {
    system: "You are an assistant. Return a JSON object with a single key 'status' and value 'success'.",
    user: "Hello"
  };

  try {
    const result = await callLLMJSON(prompt);
    console.log("Success! Result from LLM Client:", result);
  } catch (err) {
    console.error("Test failed:", err);
  }
}

testFallback();
