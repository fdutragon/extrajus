import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

export async function POST(req: Request) {
  try {
    const { keyword } = await req.json();

    if (!keyword || typeof keyword !== "string") {
      return NextResponse.json({ error: "Palavra-chave inválida." }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Você é um engenheiro de prompts jurídico avançado. O usuário buscou pela palavra-chave: "${keyword}".
Escreva um prompt estruturado em português para um gerador de contratos por IA criar este documento específico de forma segura.

O prompt de saída deve seguir EXATAMENTE esta estrutura, sem introduções ou explicações adicionais:

Crie um [nome do contrato] profissional completo, robusto e com termos seguros.

Preencha com seus dados abaixo:
- Objeto do Contrato: [descrever brevemente o objeto ou serviço]
- [Campo específico 1]: [preencher campo específico 1]
- [Campo específico 2]: [preencher campo específico 2]
- Foro: [preencher cidade]

IMPORTANTE: Substitua "[nome do contrato]" pelo nome correto e formatado do documento. Substitua "[Campo específico 1]" e "[Campo específico 2]" por dois tópicos críticos e específicos que façam sentido apenas para este tipo de contrato (ex: se for aluguel, data de vigência e valor da caução; se for prestação de serviços, prazo de entrega e direitos autorais). Mantenha o texto de preenchimento entre colchetes exatamente como [preencher ...] para o sistema reconhecer.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    return NextResponse.json({ prompt: text });
  } catch (error: any) {
    console.error("Erro na geração de prefill por IA:", error);
    return NextResponse.json({ error: "Erro interno ao gerar prefill." }, { status: 500 });
  }
}
