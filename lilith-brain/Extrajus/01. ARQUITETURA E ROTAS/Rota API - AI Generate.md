# ROTA: `/api/ai/generate`

A Mente da Máquina.

## Objetivo
Comunicar com os LLMs (Gemini/OpenAI) sob os preceitos e prompts da Lilith.

## Funcionalidades Chave
- **Barreira Financeira**: Antes de rodar, checa se `users.credits > 0`. Se sim, subtrai 1. Se não, retorna erro 402 Payment Required (Aciona Checkout).
- **Injeção de Prompts**: Combina a entrada do usuário com o [[Prompts de Geração de Contratos]] (Blindagem, Auditoria).
- **Streaming**: Pode retornar dados via Server-Sent Events (SSE) para o TipTap ir digitando como se fosse um humano rápido.

🔗 *Voltar para:* [[Árvore de Rotas (Next.js)]]