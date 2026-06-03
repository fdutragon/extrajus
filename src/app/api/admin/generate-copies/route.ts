import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { GoogleGenerativeAI } from "@google/generative-ai"

const supabase = createClient(
  process.env.NEXT_PUBLIC_LILITH_SUPABASE_URL!,
  process.env.LILITH_SUPABASE_SERVICE_ROLE_KEY!
)

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

/**
 * POST /api/admin/generate-copies
 * Gera variantes de copy via Gemini para um elemento específico.
 * Respeita o max_chars da tabela site_copies.
 *
 * Body: { element_id: string, count?: number }
 */
export async function POST(req: NextRequest) {
  try {
    const { element_id, count = 2 } = await req.json()

    if (!element_id) {
      return NextResponse.json({ error: "element_id é obrigatório" }, { status: 400 })
    }

    // Busca o registro atual no banco
    const { data: copy, error: fetchError } = await supabase
      .from("site_copies")
      .select("*")
      .eq("element_id", element_id)
      .single()

    if (fetchError || !copy) {
      return NextResponse.json({ error: "Elemento não encontrado" }, { status: 404 })
    }

    const maxChars: number = copy.max_chars ?? 80
    const description: string = copy.element_description ?? "Texto de interface para um produto SaaS jurídico."

    // ── Prompt de geração ──────────────────────────────────────────
    const prompt = `Você é um especialista em copywriting para produtos SaaS jurídicos voltados ao público brasileiro.

Seu objetivo é gerar ${count} variações de texto para um elemento de interface.

ELEMENTO: ${element_id}
DESCRIÇÃO DO ELEMENTO: ${description}
LIMITE MÁXIMO DE CARACTERES POR VARIANTE: ${maxChars}

REGRAS OBRIGATÓRIAS:
1. Cada variante deve ter entre ${Math.round(maxChars * 0.85)} e ${maxChars} caracteres (CONTANDO ESPAÇOS)
2. Todas as variantes devem ter uma contagem de caracteres próxima entre si (variação máxima de 10%)
3. Tom profissional, direto e persuasivo — sem linguagem informal ou gírias
4. Foco em urgência e valor para o usuário: proteção jurídica, praticidade, segurança
5. Sem emojis, sem caracteres especiais além de pontuação padrão e travessão (—)
6. Cada variante deve ter uma abordagem de persuasão distinta (ex: urgência vs. benefício vs. clareza)

Responda APENAS com um JSON válido, sem markdown, sem explicações:
{
  "variants": [
    {"id": "A", "text": "...", "char_count": 0},
    {"id": "B", "text": "...", "char_count": 0}
  ]
}

IMPORTANTE: Preencha o campo char_count com o número real de caracteres de cada texto.`

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
    const result = await model.generateContent(prompt)
    const raw = result.response.text().trim()

    // Remove possível markdown do Gemini
    const cleaned = raw.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim()
    const parsed = JSON.parse(cleaned)

    const variants: Array<{ id: string; text: string; char_count: number }> = parsed.variants

    // Valida o char_count real (não confia no Gemini)
    const validated = variants.map((v) => ({
      ...v,
      char_count: v.text.length,
    }))

    // Verifica se todas as variantes respeitam o limite
    const violations = validated.filter((v) => v.char_count > maxChars)
    if (violations.length > 0) {
      return NextResponse.json({
        error: `Gemini gerou texto acima do limite de ${maxChars} chars`,
        violations,
      }, { status: 422 })
    }

    // Atualiza as variantes no banco
    const { error: updateError } = await supabase
      .from("site_copies")
      .update({
        variants: validated,
        updated_at: new Date().toISOString(),
      })
      .eq("element_id", element_id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      element_id,
      max_chars: maxChars,
      variants: validated,
    })
  } catch (err: any) {
    console.error("[generate-copies] Error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

/**
 * GET /api/admin/generate-copies?element_id=xxx
 * Visualiza o estado atual das copies de um elemento
 */
export async function GET(req: NextRequest) {
  const element_id = req.nextUrl.searchParams.get("element_id")

  const query = supabase
    .from("site_copies")
    .select("element_id, element_description, max_chars, variants, champion_variant, metrics, status")

  if (element_id) {
    query.eq("element_id", element_id)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ copies: data })
}
