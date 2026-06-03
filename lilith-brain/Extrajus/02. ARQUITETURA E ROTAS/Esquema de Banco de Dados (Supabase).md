# MODELO DE DADOS: SUPABASE

A fundação inabalável de armazenamento e regras (RLS). A premissa é segurança máxima; nenhum dado vaza.

## 🗄️ ESTRUTURA PRIMÁRIA (PostgreSQL)

### 1. Tabela `users`
- `id` (UUID): Chave primária ligada diretamente ao auth do Supabase.
- `email` (String): Para disparo implacável de webhooks via Resend.
- `plan` (Enum): `free`, `pro`, `enterprise`. Determina o nível de acesso à IA.
- `credits` (Integer): O combustível. A IA cobra por execução. O PIX injeta crédito.
- `created_at` (Timestamp).

### 2. Tabela `contracts`
- `id` (UUID): O registro do documento.
- `user_id` (UUID): Chave estrangeira, protegido por RLS (Row Level Security).
- `title` (String): O nome da peça.
- `content` (JSONB): O estado puro do TipTap, salvo sem perdas ou corrupção de tags HTML.
- `status` (Enum): `draft`, `audited`, `final`.

### 3. Tabela `payments`
- `id` (UUID): Identificador único da transação.
- `user_id` (UUID): Quem gerou a cobrança.
- `gateway_id` (String): O ID externo gerado pela GGPIX.
- `amount` (Decimal): Volume faturado.
- `status` (Enum): `pending`, `paid`, `failed`. O gatilho para o webhook atuar.

🔗 *Retornar:* [[Memorial Descritivo do Império]]