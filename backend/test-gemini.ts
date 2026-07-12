import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

async function testGemini() {
  console.log("Testing Gemini API Key...");
  const apiKey = process.env.GEMINI_API_KEY;
  console.log("API Key exists:", !!apiKey);
  if (apiKey) {
    console.log("API Key preview:", apiKey.substring(0, 8) + "..." + apiKey.substring(apiKey.length - 4));
  }

  const genAI = new GoogleGenerativeAI(apiKey as string);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  try {
    console.log("Sending simple request to gemini-2.5-flash...");
    const result = await model.generateContent("Hello! What is your name and version?");
    console.log("Response text:", result.response.text());
  } catch (error) {
    console.error("Gemini API Error:", error);
  }
}

testGemini().catch(console.error);
