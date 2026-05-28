
import { GoogleGenerativeAI } from "@google/generative-ai";

async function testFinal25() {
  const apiKey = "AIzaSyDFzfa5P5l13LHgnxA5Wg0ABAxJnJk7VA8";
  const modelName = "gemini-2.5-flash";
  
  console.log(`⚡ TESTE FINAL FORÇADO - CHAVE NOVA`);
  console.log(`🤖 MODELO: ${modelName}`);

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });

  try {
    const prompt = "Responda apenas OK.";
    const result = await model.generateContent(prompt);
    console.log("✅ SUCESSO ABSOLUTO:", result.response.text());
  } catch (error: any) {
    console.error("❌ FALHA NA REQUISIÇÃO:");
    console.error("Status:", error.status);
    console.error("Mensagem:", error.message);
    console.error("Detalhes:", JSON.stringify(error, null, 2));
  }
}

testFinal25();
