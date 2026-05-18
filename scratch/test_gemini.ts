import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env
dotenv.config({ path: path.join(__dirname, "../.env") });

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
console.log("Checking API key availability:", apiKey ? "FOUND" : "MISSING");
console.log("API Key preview:", apiKey ? apiKey.substring(0, 10) + "..." : "NONE");

async function test() {
  if (!apiKey) {
    console.error("No API key found in env!");
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const list = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // or call listModels
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    console.log("Calling generateContent with gemini-2.5-flash...");
    const result = await model.generateContent("Hello, this is a test. Respond with 'OK'.");
    console.log("SUCCESS! Response text:", result.response.text());
  } catch (error: any) {
    console.error("FAILED! Error details:");
    console.error("Name:", error.name);
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    if (error.status) console.error("Status Code:", error.status);
    if (error.statusText) console.error("Status Text:", error.statusText);
  }
}

test();
