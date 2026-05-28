
import { GoogleGenerativeAI } from "@google/generative-ai";

async function testSimple() {
  const apiKey = "AIzaSyDFzfa5P5l13LHgnxA5Wg0ABAxJnJk7VA8";
  
  console.log("⚡ Teste Direto com Nova Chave...");
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const prompt = "OK?";
    const result = await model.generateContent(prompt);
    console.log("✅ Resposta:", result.response.text());
  } catch (error: any) {
    console.error("❌ Erro:", error.message);
  }
}

testSimple();
