import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

import { getSecret } from "@/utils/secrets";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { prompt, instructionType } = await request.json();

    // Priorizar a variável de ambiente segura no servidor
    const apiKey = getSecret("GEMINI_API_KEY") || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      console.error("[API Gemini Server] Chave de API ausente nas variáveis de ambiente do servidor.");
      return NextResponse.json({ error: "Chave de API do Gemini não configurada no servidor." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = "gemini-3.1-flash-lite-preview";

    // 1. Fluxo de Auditoria de Riscos Jurídicos
    if (instructionType === "audit") {
      const auditModel = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: `Você é Lilith, auditora implacável de contratos. Analise e retorne um JSON com riscos.\nFormato estrito: [{"originalText": "texto exato", "suggestion": "nova redação", "reason": "explicação do risco"}]`,
      }, { apiVersion: "v1beta" });

      const result = await auditModel.generateContent(`Analise este contrato e aponte os riscos:\n\n${prompt}`);
      const responseText = result.response.text();
      
      return NextResponse.json({ text: responseText });
    }

    // 2. Fluxo de Geração / Edição de Cláusulas Jurídicas (Streaming)
    const systemInstruction = `Você é LILITH, a Inteligência Artificial Soberana do ExtraJus. Sua função é redigir, analisar e blindar contratos jurídicos com precisão cirúrgica.

REGRAS DE FORMATAÇÃO (OBRIGATÓRIAS):
1. Use APENAS HTML. NUNCA use Markdown.
2. Título principal centralizado: <h1><strong>[TÍTULO]</strong></h1> (Sua centralização é feita nativamente por classes de estilo estruturais).
3. Parágrafos: <p>...</p> (NÃO inclua atributos style).
4. Hierarquia jurídica via LegalNodes (NUNCA use ul/ol/li):
   Cláusula: <div data-type="legal-node" data-level="1">texto</div>
   Parágrafo: <div data-type="legal-node" data-level="2">texto</div>
   Inciso: <div data-type="legal-node" data-level="3">texto</div>
   Alínea: <div data-type="legal-node" data-level="4">texto</div>
5. NUNCA insira prefixos numéricos manualmente.
6. Partes identificadas em preâmbulo com <p> e <table>. NUNCA crie cláusula "DAS PARTES".
7. Primeira cláusula SEMPRE é o Objeto do contrato.
8. Retorne APENAS o HTML sem estilos inline. Sem explicações.`;

    const model = genAI.getGenerativeModel(
      { model: modelName, systemInstruction },
      { apiVersion: "v1beta" }
    );

    const result = await model.generateContentStream(prompt);
    
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            controller.enqueue(encoder.encode(text));
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
      }
    });

  } catch (error: any) {
    console.error("[API Gemini Server Error]:", error);
    return NextResponse.json({ error: error.message || "Falha ao invocar rede neural." }, { status: 500 });
  }
}
