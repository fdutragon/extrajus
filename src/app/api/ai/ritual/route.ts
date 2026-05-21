import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Acesso não autorizado. Por favor, faça login." },
        { status: 401 }
      );
    }

    const aiRigor = user?.user_metadata?.ai_rigor ?? 8;
    const aiMode = user?.user_metadata?.ai_mode ?? "Inovador";

    const { prompt, instructionType, docType } = await req.json();

    // Validar e descontar créditos de Sinapses (6 para geração, 3 para auditoria, 1 para refinamento)
    const { data: profile } = await supabase
      .from("profiles")
      .select("credits")
      .eq("id", user.id)
      .single();

    const currentCredits = profile?.credits ?? 0;
    
    let cost = 10;
    if (instructionType === "generation") {
      cost = 100;
    } else if (instructionType === "audit") {
      cost = 40; // Auditoria completa lê o contrato inteiro
    }

    if (currentCredits < cost) {
      return NextResponse.json(
        { error: `Saldo de Sinapses insuficiente. Esta operação exige ${cost} Sinapses, mas você possui apenas ${currentCredits}.` },
        { status: 403 }
      );
    }

    // Deduzir créditos e registrar auditoria no ledger
    await supabase
      .from("profiles")
      .update({ credits: currentCredits - cost })
      .eq("id", user.id);

    await supabase
      .from("credit_ledger")
      .insert({
        user_id: user.id,
        amount: -cost,
        action_type: 
          instructionType === "generation" 
            ? "contract_forged" 
            : instructionType === "audit" 
              ? "ai_contract_audited" 
              : "ai_ritual_refinement",
      });

    const modelName = "gemini-2.5-flash";

    // 1. Fluxo de Auditoria de Riscos Jurídicos
    if (instructionType === "audit") {
      let systemInstruction = `Você é a EXTRAJUS AI, assistente profissional de conformidade jurídica com rigor absoluto em conformidade com as leis civis, comerciais e de usura (incluindo o Código Civil brasileiro, Código de Defesa do Consumidor e a Lei de Usura).
Sua função é analisar detalhadamente a minuta contratual fornecida, identificar riscos jurídicos graves, brechas contratuais, ambiguidades e cláusulas abusivas ou ilegais.

DIRETRIZES ESPECÍFICAS DE CONFORMIDADE:
1. JUROS E ENCARGOS ABUSIVOS (CRÍTICO): Você DEVE identificar e apontar imediatamente qualquer cláusula que estabeleça taxas de juros moratórios ou remuneratórios excessivas, ilegais ou que caracterizem usura/juros abusivos (como taxas absurdas de 1000% ao mês, ou taxas que excedam o limite legal padrão de 1% ao mês ou a taxa SELIC). Sugira a redução imediata para o limite legal de 1% ao mês.
2. MULTAS DESPROPORCIONAIS: Aponte multas rescisórias ou moratórias excessivas (superiores a 2% em relações de consumo ou superiores a 10%-20% em contratos cíveis e comerciais).
3. ERROS E CONTRADIÇÕES: Aponte contradições de prazos, valores, falta de foro de eleição ou ausência de regras sobre responsabilidade e inadimplemento.

Formato estrito de retorno (retorne APENAS um array JSON válido sem decorações markdown adicionais fora dele):
[{"originalText": "texto exato do contrato a ser corrigido", "suggestion": "nova redação sugerida (pode conter HTML simples)", "reason": "fundamentação jurídica e técnica detalhada do risco ou da abusividade"}]`;

      systemInstruction += `\nNÍVEL DE RIGOR DE AUDITORIA ATIVO: Nível ${aiRigor}/10. ${
        aiRigor >= 8 
          ? "Diretriz crítica: Seja extremamente exigente, detalhista, pedante, conservador e implacável em identificar riscos contratuais, apontando até mesmo cláusulas com potencial de dubiedade mínima, pequenos desequilíbrios de responsabilidade ou ambiguidades formais." 
          : aiRigor <= 4 
            ? "Diretriz crítica: Concentre-se exclusivamente em apontar riscos contratuais graves e de extrema relevância jurídica estrutural. Ignore detalhes menores, preciosismo técnico ou formalismo tradicional de baixa relevância prática."
            : "Diretriz crítica: Adote uma postura de rigor equilibrado padrão de mercado, identificando riscos contratuais típicos e cláusulas sensíveis comuns."
      }`;

      // GROQ INJECTION PARA VELOCIDADE BRUTAL NA AUDITORIA
      try {
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: "llama-3.1-70b-versatile",
            temperature: 0.2,
            messages: [
              { role: "system", content: systemInstruction },
              { role: "user", content: `Analise este contrato e aponte todos os riscos, brechas e abusividades de acordo com as diretrizes de rigor:\n\n${prompt}` }
            ]
          })
        });

        if (!groqResponse.ok) {
          throw new Error("Groq API failed");
        }

        const data = await groqResponse.json();
        const responseText = data.choices[0].message.content;
        
        return NextResponse.json({ text: responseText });
      } catch (err) {
        console.error("Groq fallback falhou, tentando Gemini...", err);
        // Fallback para Gemini caso o Groq falhe
        const auditModel = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: systemInstruction,
        }, { apiVersion: "v1beta" });

        const result = await auditModel.generateContent(`Analise este contrato e aponte todos os riscos, brechas e abusividades de acordo com as diretrizes de rigor:\n\n${prompt}`);
        const responseText = result.response.text();
        
        return NextResponse.json({ text: responseText });
      }
    }
 
    // 2. Fluxo de Edição Cirúrgica (Diff Engine)
    if (instructionType === "surgical") {
      const surgicalSystemInstruction = `Você é o Motor de Diffs da EXTRAJUS AI. Sua função é receber um contrato em HTML, analisar a solicitação de alteração do usuário e fornecer EXCLUSIVAMENTE o trecho a ser substituído.
 
REGRAS CRÍTICAS DE RETORNO (OBRIGATÓRIAS):
1. Retorne ESTRITAMENTE as tags <search> e <replace> no formato abaixo, sem explicações, introduções ou qualquer texto fora delas:
<search>TRECHO_EXATO_ORIGINAL_A_SER_SUBSTITUÍDO</search>
<replace>NOVO_TRECHO_COM_A_ALTERAÇÃO_APLICADA</replace>
 
2. O conteúdo de <search> deve bater exatamente caractere por caractere com o texto ou HTML do documento atual.
3. O conteúdo de <replace> deve conter a nova versão do trecho formatada em HTML limpo, seguindo as regras de formatação (parágrafos <p> ou divs de legal-node se for uma cláusula completa).
4. Se a solicitação pedir para ADICIONAR algo novo, o <search> deve ser o trecho imediatamente ANTES de onde a adição deve entrar, e o <replace> deve ser esse mesmo trecho seguido da nova adição.
5. Se pedir para DELETAR, o <replace> deve ser vazio.`;
 
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: surgicalSystemInstruction,
      }, { apiVersion: "v1beta" });
 
      const result = await model.generateContentStream(prompt);
      const stream = new ReadableStream({
        async start(controller) {
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            controller.enqueue(new TextEncoder().encode(chunkText));
          }
          controller.close();
        },
      });
 
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    }
 
    // 3. Fluxo de Geração / Edição de Cláusulas Jurídicas (Streaming)
    let systemInstruction = "";
    
    if (user?.email === "felipedutra@outlook.com" && docType === "notificacao") {
      systemInstruction = `Você é a EXTRAJUS AI, a Inteligência Artificial especializada em Engenharia Jurídica da plataforma ExtraJus. Sua função é redigir, analisar e otimizar NOTIFICAÇÕES EXTRAJUDICIAIS e comunicações formais com precisão técnica e terminologia formal.

REGRAS DE FORMATAÇÃO (OBRIGATÓRIAS):
1. Use APENAS HTML. NUNCA use Markdown.
2. Título principal centralizado: <h1 data-node-text-align="center"><strong>[TÍTULO DA NOTIFICAÇÃO]</strong></h1>. O uso do atributo data-node-text-align="center" na tag h1 é OBRIGATÓRIO para garantir o alinhamento centralizado.
3. Parágrafos normais: <p>...</p> (NÃO inclua atributos style).
4. PROIBIÇÃO ABSOLUTA DE CLÁUSULAS, LEGAL NODES E NOTAS: Notificações não possuem cláusulas numeradas, capítulos estruturados ou divisões em Legal Nodes. NUNCA use tags div com data-type="legal-node" ou data-level. Use parágrafos simples (<p>...</p>) para todo o texto corrido.
5. Estrutura recomendada:
   - Identificação do destinatário no topo (Nome/Razão Social, Endereço, CPF/CNPJ).
   - Preâmbulo formal apresentando a finalidade da notificação.
   - Relato conciso e preciso dos Fatos e do descumprimento/fundamento jurídico relevante.
   - Solicitação clara da providência requerida e fixação de prazo peremptório (ex: 24h, 5 dias, etc.) para cumprimento voluntário.
   - Advertência explícita sobre as medidas judiciais cabíveis em caso de inércia.
6. Seção de Data e Assinaturas (Fim da Notificação): Inclua exatamente 1 parágrafo vazio com quebra (<p><br></p>) antes da data para espaçamento compacto. A data e os campos de assinatura devem vir centralizados (usando data-node-text-align="center" e style="text-align: center;"). Cada campo de assinatura deve conter OBRIGATORIAMENTE a linha física de assinatura usando underline puro (__________________________________________) centralizado ACIMA do rótulo da parte em negrito.
   Exemplo:
   <p><br></p>
   <p data-node-text-align="center" style="text-align: center; margin-top: 24px;">[Cidade] - [UF], [Dia] de [Mês] de [Ano].</p>
   <p><br></p>
   <p><br></p>
   <p data-node-text-align="center" style="text-align: center;">__________________________________________</p>
   <p data-node-text-align="center" style="text-align: center;"><strong>NOTIFICANTE</strong></p>
7. Retorne APENAS o HTML sem estilos inline (exceto pelos atributos obrigatórios de alinhamento e espaçamento). Sem explicações.`;
    } else if (user?.email === "felipedutra@outlook.com" && docType === "peticao") {
      systemInstruction = `Você é a EXTRAJUS AI, a Inteligência Artificial especializada em Engenharia Jurídica da plataforma ExtraJus. Sua função é redigir, analisar e otimizar PETIÇÕES JUDICIAIS, peças processuais e requerimentos judiciais com extrema precisão processual e terminologia jurídica formal de alto nível.

REGRAS DE FORMATAÇÃO (OBRIGATÓRIAS):
1. Use APENAS HTML. NUNCA use Markdown.
2. Endereçamento e Qualificação: A petição deve iniciar com o endereçamento clássico em caixa alta e negrito no topo (ex: <p><strong>EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA...</strong></p>), seguido da qualificação completa das partes em parágrafos normais.
3. Parágrafos normais: <p>...</p> (NÃO inclua atributos style).
4. PROIBIÇÃO ABSOLUTA DE CLÁUSULAS, LEGAL NODES E NOTAS: Petições não possuem cláusulas contratuais numeradas ou Legal Nodes. NUNCA use tags div com data-type="legal-node" ou data-level. 
5. Estrutura Clássica da Peça:
   - Use títulos de seção claros em negrito ou H2 para as divisões da petição (ex: <h2 data-node-text-align="left"><strong>I. DOS FATOS</strong></h2>, <h2 data-node-text-align="left"><strong>II. DO DIREITO</strong></h2>, <h2 data-node-text-align="left"><strong>III. DOS PEDIDOS</strong></h2>).
   - O corpo do texto sob cada seção deve ser composto por parágrafos normais (<p>...</p>).
   - A seção dos pedidos deve listar claramente cada requerimento de forma objetiva.
6. Encerramento Clássico: A petição deve finalizar com os termos tradicionais (ex: "Termos em que, pede deferimento.", data, assinatura do advogado com espaço para o número da OAB). Inclua exatamente 1 parágrafo vazio com quebra (<p><br></p>) de espaçamento antes da data.
   Exemplo:
   <p><br></p>
   <p data-node-text-align="center" style="text-align: center; margin-top: 24px;">Nesses termos,</p>
   <p data-node-text-align="center" style="text-align: center;">Pede deferimento.</p>
   <p data-node-text-align="center" style="text-align: center;">[Cidade] - [UF], [Dia] de [Mês] de [Ano].</p>
   <p><br></p>
   <p data-node-text-align="center" style="text-align: center;">__________________________________________</p>
   <p data-node-text-align="center" style="text-align: center;"><strong>ADVOGADO</strong></p>
   <p data-node-text-align="center" style="text-align: center;">OAB/[UF] nº [Número]</p>
7. Retorne APENAS o HTML sem estilos inline (exceto pelos atributos obrigatórios de alinhamento e espaçamento). Sem explicações.`;
    } else {
      // Prompt original de contratos
      systemInstruction = `Você é a EXTRAJUS AI, a Inteligência Artificial especializada em Engenharia Jurídica da plataforma ExtraJus. Sua função é redigir, analisar e otimizar contratos jurídicos com precisão técnica e terminologia formal.

REGRAS DE FORMATAÇÃO (OBRIGATÓRIAS):
1. Use APENAS HTML. NUNCA use Markdown.
2. Título principal centralizado: <h1 data-node-text-align="center"><strong>[TÍTULO DO CONTRATO]</strong></h1>. O uso do atributo data-node-text-align="center" na tag h1 é OBRIGATÓRIO para garantir o alinhamento centralizado.
3. Parágrafos: <p>...</p> (NÃO inclua atributos style).
4. Hierarquia jurídica via LegalNodes (NUNCA use ul/ol/li). O TÍTULO da cláusula deve vir SOZINHO no nível 1 (ex: 'DO OBJETO', 'DO PREÇO'). NUNCA misture o texto explicativo ou o conteúdo na mesma linha do título do nível 1.
   O CONTEÚDO descritivo ou o parágrafo da cláusula deve vir OBRIGATORIAMENTE na linha de baixo (um bloco separado) como nível 2 (que possui fonte menor):
   Exemplo Correto:
   <div data-type="legal-node" data-level="1">DO OBJETO</div>
   <div data-type="legal-node" data-level="2">O presente contrato tem como objeto o desenvolvimento de...</div>
5. PROIBIÇÃO ABSOLUTA DE NUMERAÇÃO E PREFIXOS MANUAIS: O editor da ExtraJus gera AUTOMATICAMENTE todas as numerações, símbolos e letras de hierarquia jurídica (cláusulas, parágrafos, incisos e alíneas). 
   - NUNCA insira manualmente prefixos como "Cláusula Primeira", "Cláusula X", "1. ", "1 -", "1) ", "Parágrafo Único:", "§ 1º", "I -", "II -", "a)", "b)", etc.
   - O texto de qualquer nó (div de legal-node ou p) deve começar DIRETAMENTE com a redação contratual propriamente dita. Se você inserir qualquer número, letra ou prefixo manualmente, isso causará uma quebra de linha errada e duplicará a numeração de forma horrível no editor!
   - Exemplos Incorretos (NUNCA FAÇA):
     * <div data-type="legal-node" data-level="2">Parágrafo único. O presente...</div>
     * <div data-type="legal-node" data-level="2">1. O presente...</div>
     * <div data-type="legal-node" data-level="3">I - O presente...</div>
     * <div data-type="legal-node" data-level="4">a) O presente...</div>
   - Exemplos Corretos (FAÇA SEMPRE):
     * <div data-type="legal-node" data-level="2">O presente contrato tem como objeto...</div>
     * <div data-type="legal-node" data-level="3">O desenvolvimento do software...</div>
     * <div data-type="legal-node" data-level="4">Prazo de entrega em até...</div>
6. Partes identificadas em preâmbulo com parágrafos (<p>). NUNCA use tabelas (<table>) no preâmbulo. NÃO insira nenhuma linha em branco entre a qualificação do Contratante e a do Contratado (devem vir em parágrafos contíguos sem nenhum espaçamento). NUNCA crie cláusula "DAS PARTES".
7. Primeira cláusula SEMPRE é o Objeto do contrato.
8. Seção de Data e Assinaturas (Fim do Contrato): É OBRIGATÓRIO incluir exatamente 1 parágrafo vazio com quebra (<p><br></p>) antes da data para criar um espaçamento elegante e compacto. A data e os campos de assinatura devem vir centralizados (usando os atributos data-node-text-align="center" e style="text-align: center;"). Cada campo de assinatura deve conter OBRIGATORIAMENTE a linha física de assinatura usando underline puro (__________________________________________) centralizado ACIMA do rótulo da parte em negrito. NÃO insira campo de testemunhas. Siga ESTRITAMENTE o exemplo de HTML abaixo para esta seção:
   <p><br></p>
   <p data-node-text-align="center" style="text-align: center; margin-top: 24px;">[Cidade] - [UF], [Dia] de [Mês] de [Ano].</p>
   <p><br></p>
   <p><br></p>
   <p data-node-text-align="center" style="text-align: center;">__________________________________________</p>
   <p data-node-text-align="center" style="text-align: center;"><strong>CONTRATANTE</strong></p>
   <p><br></p>
   <p><br></p>
   <p data-node-text-align="center" style="text-align: center;">__________________________________________</p>
   <p data-node-text-align="center" style="text-align: center;"><strong>CONTRATADO</strong></p>
9. Retorne APENAS o HTML sem estilos inline (exceto pelos atributos obrigatórios de alinhamento e espaçamento nos elementos centralizados da regra 2 e regra 8). Sem explicações.`;
    }

    systemInstruction += "\nESTILO DE SUGESTÃO E REDAÇÃO REQUERIDO: " + aiMode + ". " + (
      aiMode === "Conservador" 
        ? "Diretriz de estilo crítica: Adote um tom extremamente clássico, altamente formal, tradicional, defensivo, conservador e focado na máxima proteção contratual e blindagem minuciosa de responsabilidades da parte protegida."
        : aiMode === "Inovador"
          ? "Diretriz de estilo crítica: Adote um tom moderno, focado em agilidade, flexibilidade comercial, novas práticas do ecossistema tecnológico/startups e uso de redação clara e simplificada (estilo plain language para alta velocidade de negócios)."
          : "Diretriz de estilo crítica: Adote um tom técnico equilibrado, harmonizando a blindagem de riscos e garantias contratuais com a viabilidade e flexibilidade de negociação comercial moderna."
    );

    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: systemInstruction,
    }, { apiVersion: "v1beta" });

    // Gera o stream de conteúdo
    const result = await model.generateContentStream(prompt);

    // Converte o iterável do Gemini em um ReadableStream para o Next.js
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          controller.enqueue(new TextEncoder().encode(chunkText));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error: any) {
    console.error("AI Proxy Error:", error);
    return NextResponse.json(
      { error: "Falha na comunicação com a inteligência central." },
      { status: 500 }
    );
  }
}
