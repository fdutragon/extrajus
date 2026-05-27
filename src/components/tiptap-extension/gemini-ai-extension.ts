import { Extension } from "@tiptap/core"
import { toast } from "sonner"
import { sanitiseAiHtml, sanitiseAiHtmlStream, isIncompleteHtmlFragment } from "@/lib/ai-html-sanitizer"

export type Language =
  | "en" | "ko" | "zh" | "ja" | "es" | "ru" | "fr" | "pt" | "de" | "it" | "nl" | "id" | "vi" | "tr" | "ar"

export type Tone =
  | "academic" | "business" | "casual" | "childfriendly" | "confident"
  | "conversational" | "creative" | "emotional" | "excited" | "formal"
  | "friendly" | "funny" | "humorous" | "informative" | "inspirational"
  | "memeify" | "narrative" | "objective" | "persuasive" | "poetic" | "professional" | "serious" | "technical"

export interface TextOptions {
  tone?: Tone
  language?: Language
  insertAt?: any
  stream?: boolean
  format?: "rich-text" | "text"
  text?: string
  regenerate?: boolean
}

export interface GeminiOptions {
  apiKey: string
  model: string
}

export interface AiTextPromptOptions extends TextOptions {
  text: string
  insert?: boolean
}

export interface AuditResult {
  originalText: string
  suggestion: string
  reason: string
  id: string
}

export interface GeminiStorage {
  lastPrompt: string
  generatedWith: any
  response: string
  state: "idle" | "loading" | "error"
  auditResults: AuditResult[]
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    aiTextPrompt: (options: string | AiTextPromptOptions) => ReturnType
    aiAccept: (options?: any) => ReturnType
    aiReject: (options?: any) => ReturnType
    aiExtend: (options?: TextOptions) => ReturnType
    aiShorten: (options?: TextOptions) => ReturnType
    aiSimplify: (options?: TextOptions) => ReturnType
    aiSummarize: (options?: TextOptions) => ReturnType
    aiFixSpellingAndGrammar: (options?: TextOptions) => ReturnType
    aiEmojify: (options?: TextOptions) => ReturnType
    aiComplete: (options?: TextOptions) => ReturnType
    aiTranslate: (language: Language, options?: TextOptions) => ReturnType
    aiAdjustTone: (tone: Tone, options?: TextOptions) => ReturnType
    aiRegenerate: (options?: TextOptions) => ReturnType
    aiRephrase: (options?: TextOptions) => ReturnType
    aiAuditRisk: () => ReturnType
  }

  interface Storage {
    ai: GeminiStorage
    aiAdvanced: GeminiStorage
  }
}

const SYSTEM_INSTRUCTION = `Você é a EXTRAJUS AI, a Inteligência Artificial especializada em Engenharia Jurídica da plataforma ExtraJus. Sua função é redigir, analisar e otimizar contratos jurídicos com precisão técnica e terminologia formal.

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
6. Partes identificadas em preâmbulo com parágrafos (<p>). NUNCA use tabelas (<table>) no preâmbulo. Insira sempre DUAS linhas em branco (dois parágrafos <p></p><p></p>) entre a qualificação do Contratante e a do Contratado para espaçamento adequado. NUNCA crie cláusula "DAS PARTES".
7. Primeira cláusula SEMPRE é o Objeto do contrato.
8. Seção de Data e Assinaturas (Fim do Contrato): É OBRIGATÓRIO incluir exatamente 1 parágrafo vazio com quebra (<p><br></p>) antes da data para criar um espaçamento elegante e compacto. A data e os campos de assinatura devem vir centralizados (usando os atributos data-node-text-align="center" e style="text-align: center;"). Cada campo de assinatura deve conter OBRIGATORIAMENTE a linha física de assinatura exata usando underline puro (__________________________________________) centralizado ACIMA do rótulo da parte em negrito. NÃO insira campo de testemunhas. Siga ESTRITAMENTE o exemplo de HTML abaixo para esta seção:
    <p><br></p>
    <p data-node-text-align="center" style="text-align: center; margin-top: 24px;">[Cidade] - [UF], [Dia] de [Mês] de [Ano].</p>
    <p><br></p>
    <p data-node-text-align="center" style="text-align: center; margin-top: 24px;">__________________________________________</p>
    <p data-node-text-align="center" style="text-align: center;"><strong>CONTRATANTE</strong></p>
    <p><br></p>
    <p data-node-text-align="center" style="text-align: center; margin-top: 24px;">__________________________________________</p>
    <p data-node-text-align="center" style="text-align: center;"><strong>CONTRATADO</strong></p>
9. Retorne APENAS o HTML sem estilos inline (exceto pelos atributos obrigatórios de alinhamento e espaçamento nos elementos centralizados da regra 2 e regra 8). Sem explicações.`

export const Gemini = Extension.create<GeminiOptions, GeminiStorage>({
  name: "ai",

  addOptions() {
    return {
      apiKey: "",
      model: "gemini-2.5-flash",
    }
  },

  addStorage() {
    return {
      lastPrompt: "",
      generatedWith: null,
      response: "",
      state: "idle",
      auditResults: [],
    }
  },

  addCommands(): any {
    const runGemini = async (editor: any, userPrompt: string) => {
      editor.commands.aiGenerationSetIsLoading(true)
      editor.commands.aiGenerationHasMessage(false)
      this.storage.lastPrompt = userPrompt
      this.storage.state = "loading"

      try {
        // --- Lê documento completo antes de agir ---
        const currentHtml = editor.getHTML()
        const currentText = (editor.getText() || "").trim()
        
        const promptLower = (userPrompt || "").toLowerCase().trim();
        const isCreationRequest = promptLower.startsWith("crie") || 
                                  promptLower.startsWith("gerar") || 
                                  promptLower.startsWith("elabore") ||
                                  promptLower.startsWith("elaborar") || 
                                  promptLower.startsWith("faça") || 
                                  promptLower.startsWith("fazer") ||
                                  promptLower.startsWith("create") || 
                                  promptLower.startsWith("write") ||
                                  promptLower.includes("crie um") ||
                                  promptLower.includes("crie uma") ||
                                  promptLower.includes("gerar um") ||
                                  promptLower.includes("gerar uma");

        // Critério ultra-robusto para identificar se o documento está de fato vazio ou deve ser gerado do zero
        const isDocEmpty = editor.isEmpty || 
                           currentText.length < 400 || 
                           currentHtml === "<p></p>" || 
                           currentHtml === "" ||
                           !currentHtml ||
                           isCreationRequest;

        console.log("[Lilith AI Extension] runGemini called:", {
          currentTextLength: currentText.length,
          currentHtmlLength: currentHtml.length,
          isDocEmpty,
          userPrompt
        });

        // Obter tipo de documento (Foco Contrato) e limpar sugestão anterior
        const localDocType = "contrato";
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("extrajus_ai_suggestion");
          window.dispatchEvent(new Event("ai-suggestion-updated"));
        }

        let finalPrompt: string

        if (isDocEmpty) {
          // Documento vazio: cria do zero
          const docTypeName = "um contrato";
          const docTypeSufix = "o";
          const exampleSuggest = "Inclua uma cláusula de multa de 10% por rescisão antecipada";

          finalPrompt = `O documento está vazio. Crie ${docTypeName} complet${docTypeSufix} com base nesta solicitação:\n\n${userPrompt}\n\nIMPORTANTE: No final absoluto da sua resposta (após todo o HTML d${docTypeSufix} contrato), adicione uma tag <suggestion> contendo UM EXEMPLO DE COMANDO DE EDIÇÃO cirúrgica que o usuário poderia digitar no chat para blindar ou aprimorar este documento. O texto deve ser um comando direto de alteração, e NÃO UMA PERGUNTA. Exemplo: <suggestion>${exampleSuggest}</suggestion>`
        } else {
          // Documento com conteúdo: edição cirúrgica estruturada
          finalPrompt = `DOCUMENTO ATUAL (HTML completo):
${currentHtml}

SOLICITAÇÃO DE ALTERAÇÃO:
${userPrompt}

Lembre-se de retornar EXCLUSIVAMENTE as tags <search> e <replace> com a modificação.`
        }

        // Snapshot para Desfazer
        const previousContent = currentHtml
        this.storage.generatedWith = { previousContent }

        // Chamada de API segura para o servidor Next.js
        const response = await fetch("/api/ai/ritual", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            prompt: finalPrompt,
            instructionType: isDocEmpty ? "generation" : "surgical",
            docType: localDocType
          })
        })

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}))
          if (response.status === 403) {
            this.storage.state = "error"
            toast.error(errData.error || "Saldo de Sinapses insuficiente para esta operação.")
            window.dispatchEvent(new Event("open-plans-modal"));
            editor.commands.aiGenerationSetIsLoading(false)
            return
          }
          throw new Error(errData.error || "Falha na comunicação com o sistema IA.")
        }

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        let accumulatedText = ""
        let hasTriggeredMessage = false

        if (reader) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            accumulatedText += decoder.decode(value, { stream: true })
            
            // Intercepta e remove a tag <suggestion> para não sujar o editor
            let streamSafeContent = accumulatedText
            const suggestionMatch = accumulatedText.match(/<suggestion>([\s\S]*)/i)
            
            if (suggestionMatch) {
              streamSafeContent = accumulatedText.substring(0, suggestionMatch.index)
              let suggestionText = suggestionMatch[1]
              const hasClosingTag = suggestionText.toLowerCase().includes("</suggestion>")
              if (hasClosingTag) {
                 suggestionText = suggestionText.replace(/<\/suggestion>[\s\S]*/i, "").trim()
                 if (typeof window !== "undefined") {
                   window.localStorage.setItem("extrajus_ai_suggestion", suggestionText)
                   window.dispatchEvent(new Event("ai-suggestion-updated"))
                 }
              }
            }

            streamSafeContent = sanitiseAiHtmlStream(streamSafeContent)
            this.storage.response = streamSafeContent

            // Somente atualiza em tempo real se for uma geração completa do zero
            if (isDocEmpty && streamSafeContent && !isIncompleteHtmlFragment(streamSafeContent)) {
              try {
                editor.commands.setContent(streamSafeContent, false, { preserveWhitespace: false })
                if (!hasTriggeredMessage) {
                  editor.commands.aiGenerationHasMessage(true)
                  hasTriggeredMessage = true
                }
              } catch (_) { /* ignore incomplete streaming fragments */ }
            }
          }
        }

        // Final deep sanitisation ou substituição cirúrgica do diff
        let finalContent = ""

        if (!isDocEmpty) {
          // Edição cirúrgica estruturada!
          const searchMatch = accumulatedText.match(/<search>([\s\S]*?)<\/search>/)
          const replaceMatch = accumulatedText.match(/<replace>([\s\S]*?)<\/replace>/)

          if (searchMatch && replaceMatch) {
            const searchText = searchMatch[1].trim()
            const replaceText = replaceMatch[1].trim()

            const html = editor.getHTML()
            if (html.includes(searchText)) {
              finalContent = html.split(searchText).join(replaceText)
              console.log("Surgical HTML replacement applied successfully!")
            } else {
              // Nível 2: Busca por texto puro removendo tags HTML do trecho de busca
              const cleanSearch = searchText.replace(/<[^>]*>/g, "").trim()
              const cleanReplace = replaceText

              if (html.includes(cleanSearch)) {
                finalContent = html.split(cleanSearch).join(cleanReplace)
                console.log("Surgical plain text replacement applied successfully!")
              } else {
                // Nível 3: Busca resiliente tolerante a quebras de linha e múltiplos espaços
                const spaceCleanSearch = cleanSearch.replace(/\s+/g, " ")
                const escapedSearch = spaceCleanSearch.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
                const regexPattern = escapedSearch.split(' ').join('\\s+')
                try {
                  const regex = new RegExp(regexPattern, 'g')
                  if (regex.test(html)) {
                    finalContent = html.replace(regex, cleanReplace)
                    console.log("Surgical space-resilient regex replacement applied successfully!")
                  }
                } catch (e) {
                  console.error("Surgical regex replace failed:", e)
                }
              }
            }

            // Se nenhuma das substituições cirúrgicas encontrou o padrão no HTML do editor
            if (!finalContent) {
              console.warn("Target search pattern not found. Inserting at current cursor/selection as fallback.")
              editor.commands.insertContent(replaceText)
              this.storage.state = "idle"
              editor.commands.aiGenerationSetIsLoading(false)
              if (!hasTriggeredMessage) {
                editor.commands.aiGenerationHasMessage(true)
              }
              return
            }
          } else {
            console.warn("Search/Replace tags not found in AI response. Applying full HTML fallback.")
            finalContent = sanitiseAiHtml(accumulatedText)
          }
        } else {
          // Geração completa do zero
          let rawText = accumulatedText
          const suggestionMatch = rawText.match(/<suggestion>([\s\S]*)/i)
          if (suggestionMatch) {
            rawText = rawText.substring(0, suggestionMatch.index)
            // Também tenta salvar caso o stream tenha pulado o evento por algum motivo
            let suggestionText = suggestionMatch[1]
            if (suggestionText.toLowerCase().includes("</suggestion>")) {
               suggestionText = suggestionText.replace(/<\/suggestion>[\s\S]*/i, "").trim()
               if (typeof window !== "undefined") {
                 window.localStorage.setItem("extrajus_ai_suggestion", suggestionText)
                 window.dispatchEvent(new Event("ai-suggestion-updated"))
               }
            }
          }
          finalContent = sanitiseAiHtml(rawText)
        }

        if (finalContent) {
          editor.commands.setContent(finalContent, false, { preserveWhitespace: false })
          if (!hasTriggeredMessage) {
            editor.commands.aiGenerationHasMessage(true)
          }
        }

        this.storage.state = "idle"
      } catch (error: any) {
        console.error("Gemini generation failed:", error)
        this.storage.state = "error"
        toast.error(error.message || "O sistema IA falhou em responder. Verifique sua conexão.")
      } finally {
        editor.commands.aiGenerationSetIsLoading(false)
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("ai-generation-finished", { 
            detail: { success: this.storage.state === "idle" } 
          }))
        }
      }
    }

    return {
      aiTextPrompt: (options: any) => ({ editor }: any) => {
        const promptText = typeof options === "string" ? options : options.text
        runGemini(editor, promptText)
        return true
      },

      // Aceitar: mantém conteúdo atual, limpa snapshot
      aiAccept: (_options: any) => ({ editor }: any) => {
        this.storage.generatedWith = null
        editor.commands.resetUiState()
        return true
      },

      // Desfazer: restaura snapshot anterior à geração
      aiReject: (_options: any) => ({ editor }: any) => {
        const prev = this.storage.generatedWith?.previousContent
        this.storage.generatedWith = null
        
        // Executa em um frame separado para evitar transações casadas conflitantes no Yjs/ProseMirror
        setTimeout(() => {
          if (prev) {
            editor.commands.setContent(prev, false, { preserveWhitespace: false })
          }
          editor.commands.resetUiState()
        }, 0)

        return true
      },

      aiExtend: (_options: any) => ({ editor }: any) => {
        const selected = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to)
        const ctx = selected || editor.state.doc.textContent
        runGemini(editor, `Expanda o seguinte trecho mantendo o tom jurídico profissional:\n\n"${ctx}"`)
        return true
      },

      aiShorten: (_options: any) => ({ editor }: any) => {
        const selected = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to)
        const ctx = selected || editor.state.doc.textContent
        runGemini(editor, `Resuma de forma concisa mantendo a estrutura HTML:\n\n"${ctx}"`)
        return true
      },

      aiSimplify: (_options: any) => ({ editor }: any) => {
        const selected = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to)
        runGemini(editor, `Simplifique para linguagem clara mantendo HTML:\n\n"${selected}"`)
        return true
      },

      aiSummarize: (_options: any) => ({ editor }: any) => {
        const text = editor.state.doc.textContent
        runGemini(editor, `Crie um resumo executivo deste contrato em HTML:\n\n"${text}"`)
        return true
      },

      aiFixSpellingAndGrammar: (_options: any) => ({ editor }: any) => {
        const selected = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to)
        runGemini(editor, `Corrija ortografia e gramática mantendo HTML e estrutura:\n\n"${selected}"`)
        return true
      },

      aiEmojify: (_options: any) => ({ editor }: any) => {
        const selected = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to)
        runGemini(editor, `Adicione emojis relevantes ao texto mantendo HTML:\n\n"${selected}"`)
        return true
      },

      aiComplete: (_options: any) => ({ editor }: any) => {
        const currentHtml = editor.getHTML()
        runGemini(editor, `Continue este contrato a partir do ponto onde parou, mantendo a estrutura:\n\n${currentHtml}`)
        return true
      },

      aiTranslate: (language: any, _options: any) => ({ editor }: any) => {
        const selected = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to)
        runGemini(editor, `Traduza para ${language} preservando todas as tags HTML:\n\n"${selected}"`)
        return true
      },

      aiAdjustTone: (tone: any, _options: any) => ({ editor }: any) => {
        const selected = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to)
        runGemini(editor, `Reescreva com tom ${tone} mantendo HTML estruturado:\n\n"${selected}"`)
        return true
      },

      aiRegenerate: (_options: any) => ({ editor }: any) => {
        if (this.storage.lastPrompt) {
          runGemini(editor, this.storage.lastPrompt)
        }
        return true
      },

      aiRephrase: (_options: any) => ({ editor }: any) => {
        const selected = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to)
        runGemini(editor, `Parafraseie melhorando clareza e fluidez mantendo HTML:\n\n"${selected}"`)
        return true
      },

      aiAuditRisk: () => ({ editor }: any) => {
        const text = editor.getText() || editor.state.doc.textContent

        if (text.trim().length < 150) {
          this.storage.state = "error"
          this.storage.auditResults = []
          return Promise.reject(new Error("O instrumento do contrato é muito curto. Insira pelo menos 150 caracteres."))
        }

        const runAudit = async () => {
          this.storage.state = "loading"
          this.storage.auditResults = [];

          try {
            const response = await fetch("/api/ai/ritual", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                prompt: text,
                instructionType: "audit",
                docType: "contrato"
              })
            })

            if (!response.ok) {
              const errData = await response.json().catch(() => ({}))
              if (response.status === 403) {
                this.storage.state = "error"
                this.storage.auditResults = [];
                toast.error(errData.error || "Saldo de Sinapses insuficiente para esta operação.")
                window.dispatchEvent(new Event("open-plans-modal"));
                return []
              }
              throw new Error(errData.error || "Falha na comunicação com o auditor do servidor.")
            }

            const data = await response.json()
            const responseText = data.text || ""

            let auditResultsCleaned: any[] = [];
            const jsonMatch = responseText.match(/\[[\s\S]*\]/)
            if (jsonMatch) {
              try {
                const cleanJsonStr = jsonMatch[0].trim();
                const auditData = JSON.parse(cleanJsonStr)
                auditResultsCleaned = Array.isArray(auditData)
                  ? auditData.map((item: any) => ({ ...item, id: Math.random().toString(36).substring(7) }))
                  : []
              } catch (e) {
                console.error("Audit JSON parse error:", e)
              }
            }
            
            this.storage.auditResults = auditResultsCleaned;
            this.storage.state = "idle"
            editor.view.dispatch(editor.state.tr.setMeta("aiAuditCompleted", true))
            return auditResultsCleaned;
          } catch (error) {
            console.error("Gemini audit failed:", error)
            this.storage.state = "error"
            this.storage.auditResults = [];
            throw error;
          }
        }

        return runAudit()
      },
    }
  },
})
