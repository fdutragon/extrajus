
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';
import path from 'path';

// Carrega o .env explicitamente
dotenv.config({ path: path.join(process.cwd(), '.env') });

async function testGeminiQuota() {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("❌ ERRO: NEXT_PUBLIC_GEMINI_API_KEY não encontrada no .env");
    return;
  }

  console.log("⚡ Iniciando teste de conexão e quota do Gemini...");
  console.log(`🔑 Chave detectada (prefixo): ${apiKey.substring(0, 8)}...`);

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = "gemini-2.0-flash-exp";
  console.log(`🤖 Testando modelo: ${modelName}`);
  const model = genAI.getGenerativeModel({ model: modelName });

  try {
    const prompt = "Responda apenas com a palavra 'OK' se você estiver recebendo esta mensagem corretamente.";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("✅ RESPOSTA DA API:", text);
    console.log("🚀 STATUS: API operacional e com quota disponível.");
  } catch (error: any) {
    console.error("❌ FALHA NA REQUISIÇÃO:");
    console.error("Status Code:", error.status);
    console.error("Error Message:", error.message);

    if (error.status === 429) {
      console.error("🚨 MOTIVO: Quota esgotada (Rate Limit Exceeded - 429).");
    } else if (error.status === 403) {
      console.error("🚨 MOTIVO: Erro de permissão ou chave inválida (403).");
    } else if (error.status === 404) {
       console.error("🚨 MOTIVO: Modelo não encontrado ou erro na URL da API (404).");
    }

    console.error("Detalhamento:", JSON.stringify(error, null, 2));
  }
}

testGeminiQuota();
