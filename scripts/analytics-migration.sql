-- ═══════════════════════════════════════════════════════════════
-- EXTRAJUS ANALYTICS — Migração do Schema
-- Executa no Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ── Tabela de Sessões ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.site_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id VARCHAR(64) UNIQUE NOT NULL,
  -- Origem do tráfego
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(255),
  utm_term VARCHAR(255),
  utm_content VARCHAR(255),
  -- Dispositivo
  device_type VARCHAR(20),
  is_pwa BOOLEAN DEFAULT false,
  screen_width INT,
  screen_height INT,
  -- Contexto
  landing_page VARCHAR(512),
  referrer TEXT,
  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_started ON public.site_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_sessions_utm ON public.site_sessions(utm_source, utm_campaign);

-- ── Tabela de Eventos ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.site_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id VARCHAR(64) REFERENCES public.site_sessions(session_id) ON DELETE CASCADE,
  -- Evento
  event_name VARCHAR(100) NOT NULL,
  event_category VARCHAR(50),
  -- Contexto da página
  page VARCHAR(512),
  -- Coordenadas do clique (heatmap)
  click_x_pct NUMERIC(5,2),
  click_y_pct NUMERIC(5,2),
  -- Elemento clicado
  element_id VARCHAR(255),
  element_text TEXT,
  -- Metadados extras
  properties JSONB DEFAULT '{}',
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_session ON public.site_events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_name ON public.site_events(event_name);
CREATE INDEX IF NOT EXISTS idx_events_created ON public.site_events(created_at);
CREATE INDEX IF NOT EXISTS idx_events_element ON public.site_events(element_id);
CREATE INDEX IF NOT EXISTS idx_events_category ON public.site_events(event_category);
-- Índice GIN para queries no JSONB (copy_variant, utm filters)
CREATE INDEX IF NOT EXISTS idx_events_properties ON public.site_events USING GIN (properties);

-- ── Tabela de Copies (A/B Testing Engine) ────────────────────────
CREATE TABLE IF NOT EXISTS public.site_copies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  element_id VARCHAR(100) UNIQUE NOT NULL,
  -- Descrição do contexto (para o Gemini saber o que gerar)
  element_description TEXT,
  -- Limite de caracteres por variante (layout constraint)
  max_chars INT DEFAULT 80,
  -- Variantes em JSONB: [{"id":"A","text":"...","char_count":42}]
  variants JSONB NOT NULL DEFAULT '[]',
  -- Controle do teste
  rotation_mode VARCHAR(20) DEFAULT 'ab_test'
    CHECK (rotation_mode IN ('ab_test', 'champion', 'manual')),
  champion_variant VARCHAR(10),
  status VARCHAR(20) DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'archived')),
  -- Métricas agregadas (atualizado pela Lilith)
  metrics JSONB DEFAULT '{}',
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_copies_element ON public.site_copies(element_id);
CREATE INDEX IF NOT EXISTS idx_copies_status ON public.site_copies(status);

-- ── RLS Policies ──────────────────────────────────────────────────
-- site_sessions: apenas service_role pode inserir/atualizar
ALTER TABLE public.site_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_all_sessions" ON public.site_sessions;
CREATE POLICY "service_role_all_sessions" ON public.site_sessions
  FOR ALL USING (auth.role() = 'service_role');

-- site_events: apenas service_role pode inserir
ALTER TABLE public.site_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_all_events" ON public.site_events;
CREATE POLICY "service_role_all_events" ON public.site_events
  FOR ALL USING (auth.role() = 'service_role');

-- site_copies: leitura pública (anon pode buscar copies), escrita apenas service_role
ALTER TABLE public.site_copies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_copies" ON public.site_copies;
CREATE POLICY "anon_read_copies" ON public.site_copies
  FOR SELECT USING (status = 'active');
DROP POLICY IF EXISTS "service_role_all_copies" ON public.site_copies;
CREATE POLICY "service_role_all_copies" ON public.site_copies
  FOR ALL USING (auth.role() = 'service_role');

-- ── Seed inicial de Copies ────────────────────────────────────────
-- REGRA: variantes com contagem de caracteres próxima (±10%) para não quebrar layout
-- char_count é informativo — a API de geração usa max_chars como limite hard

INSERT INTO public.site_copies
  (element_id, element_description, max_chars, variants, rotation_mode, status)
VALUES

-- Placeholder do input da IA (área de texto — pode ser maior, mas deve ter comprimento similar)
(
  'cta-ai-panel-placeholder',
  'Texto de placeholder no input da IA do editor de contratos. Tom persuasivo, imperativo, voltado para quem quer proteger seu negócio.',
  110,
  '[
    {"id":"A","text":"Descreva os termos, dite o acordo ou escolha um modelo. Qual contrato vai blindar seu negócio hoje?","char_count":100},
    {"id":"B","text":"Digite os detalhes do acordo, grave por voz ou selecione um modelo. Vamos redigir seu contrato agora.","char_count":101}
  ]'::jsonb,
  'ab_test',
  'active'
),

-- Botão principal de gerar PIX no checkout
(
  'cta-checkout-generate-pix',
  'Botão de ação principal no checkout para gerar o QR Code PIX. Tom urgente e direto. Inclui o valor R$ 27,00.',
  32,
  '[
    {"id":"A","text":"Gerar PIX — R$ 27,00","char_count":20},
    {"id":"B","text":"Pagar com PIX — R$ 27,00","char_count":24}
  ]'::jsonb,
  'ab_test',
  'active'
),

-- Headline do painel esquerdo do checkout
(
  'cta-checkout-headline',
  'Título principal do modal de checkout. Tom de urgência e valor. Máximo estrito de 24 caracteres para não quebrar o layout.',
  24,
  '[
    {"id":"A","text":"Baixe Agora Seu Contrato","char_count":24},
    {"id":"B","text":"Libere Sua Minuta Agora","char_count":23}
  ]'::jsonb,
  'ab_test',
  'active'
),

-- Botão de copiar o código PIX
(
  'cta-checkout-copy-pix',
  'Botão para copiar o código PIX no modal de pagamento. Deve ser curto e direto.',
  20,
  '[
    {"id":"A","text":"Copiar Código PIX","char_count":17},
    {"id":"B","text":"Copiar Chave PIX","char_count":16}
  ]'::jsonb,
  'ab_test',
  'active'
)

ON CONFLICT (element_id) DO NOTHING;


-- ── View útil para análise de funil ──────────────────────────────
CREATE OR REPLACE VIEW public.v_funnel_summary WITH (security_invoker = on) AS
SELECT
  se.session_id,
  ss.utm_source,
  ss.utm_campaign,
  ss.device_type,
  ss.is_pwa,
  ss.landing_page,
  BOOL_OR(se.event_name = 'editor_loaded') AS reached_editor,
  BOOL_OR(se.event_name = 'ai_panel_opened') AS opened_ai_panel,
  BOOL_OR(se.event_name = 'ai_prompt_submitted') AS submitted_ai_prompt,
  BOOL_OR(se.event_name = 'checkout_triggered') AS triggered_checkout,
  BOOL_OR(se.event_name = 'checkout_viewed') AS viewed_checkout,
  BOOL_OR(se.event_name = 'checkout_qr_copied') AS copied_pix,
  BOOL_OR(se.event_name = 'checkout_paid') AS paid,
  MIN(ss.started_at) AS session_start,
  MAX(se.created_at) AS last_event
FROM public.site_events se
JOIN public.site_sessions ss ON ss.session_id = se.session_id
GROUP BY se.session_id, ss.utm_source, ss.utm_campaign, ss.device_type, ss.is_pwa, ss.landing_page;

-- Liberar acesso apenas para leitura
GRANT SELECT ON public.v_funnel_summary TO service_role;
GRANT SELECT ON public.v_funnel_summary TO authenticated;
-- NOTA: Não estamos liberando para 'anon' por segurança, 
-- senão qualquer pessoa poderia baixar os dados do seu funil.
-- Se a sua dashboard é pública, remova o comentário abaixo:
-- GRANT SELECT ON public.v_funnel_summary TO anon;
