const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

async function testSurgical() {
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not defined in environment!");
    return;
  }

  const modelName = "gemini-2.5-flash";
  const currentHtml = `
    <h1><strong>CONTRATO DE PRESTAÇÃO DE SERVIÇOS</strong></h1>
    <p><strong>CONTRATANTE:</strong> João da Silva, brasileiro, solteiro, programador, residente em São Paulo.</p>
    <p><strong>CONTRATADO:</strong> Pedro Santos, brasileiro, casado, designer, residente no Rio de Janeiro.</p>
    <div data-type="legal-node" data-level="1">Objeto — O presente contrato tem como objeto o desenvolvimento de um website.</div>
    <div data-type="legal-node" data-level="1">Prazo — O prazo de entrega do website será de 30 dias a partir da assinatura.</div>
  `;
  const userPrompt = "altere o prazo de entrega para 15 dias";

  const finalPrompt = `DOCUMENTO ATUAL (HTML completo):
${currentHtml}

SOLICITAÇÃO DE ALTERAÇÃO:
${userPrompt}

Lembre-se de retornar EXCLUSIVAMENTE as tags <search> e <replace> com a modificação.`;

  const surgicalSystemInstruction = `Você é o Motor de Diffs da EXTRAJUS AI. Sua função é receber um contrato em HTML, analisar a solicitação de alteração do usuário e fornecer EXCLUSIVAMENTE o trecho a ser substituído.

REGRAS CRÍTICAS DE RETORNO (OBRIGATÓRIAS):
1. Retorne ESTRITAMENTE as tags <search> e <replace> no formato abaixo, sem explicações, introduções ou qualquer texto fora delas:
<search>TRECHO_EXATO_ORIGINAL_A_SER_SUBSTITUÍDO</search>
<replace>NOVO_TRECHO_COM_A_ALTERAÇÃO_APLICADA</replace>

2. O conteúdo de <search> deve bater exatamente caractere por caractere com o texto ou HTML do documento atual.
3. O conteúdo de <replace> deve conter a nova versão do trecho formatada em HTML limpo, seguindo as regras de formatação (parágrafos <p> ou divs de legal-node se for uma cláusula completa).
4. Se a solicitação pedir para ADICIONAR algo novo, o <search> deve ser o trecho imediatamente ANTES de onde a adição deve entrar, e o <replace> deve ser esse mesmo trecho seguido da nova adição.
5. Se pedir para DELETAR, o <replace> deve ser vazio.`;

  console.log("Calling Gemini API directly...");
  try {
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: surgicalSystemInstruction,
    }, { apiVersion: "v1beta" });

    const result = await model.generateContent(finalPrompt);
    const text = result.response.text();

    console.log("\n--- RAW AI RESPONSE ---");
    console.log(text);
    console.log("-----------------------\n");

    const searchMatch = text.match(/<search>([\s\S]*?)<\/search>/);
    const replaceMatch = text.match(/<replace>([\s\S]*?)<\/replace>/);

    console.log("Regex Search Match found:", !!searchMatch);
    if (searchMatch) console.log("Search Text:", searchMatch[1].trim());

    console.log("Regex Replace Match found:", !!replaceMatch);
    if (replaceMatch) console.log("Replace Text:", replaceMatch[1].trim());

  } catch (error) {
    console.error("Gemini call failed:", error);
  }
}

testSurgical();
