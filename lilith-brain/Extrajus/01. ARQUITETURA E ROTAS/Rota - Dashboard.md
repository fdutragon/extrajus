 ROTA: `/dashboard`

O Centro de Comando do Usuário.

## Objetivo
Onde o cliente vê o que ele controla e quanto poder (créditos) ele ainda tem.

## Funcionalidades Chave
- **Lista de Contratos**: Tabela de todos os contratos gerados, rascunhos e finalizados. (Busca na tabela `contracts`).
- **Gestão de Créditos**: Saldo atual do usuário (tabela `users.credits`).
- **Botão Novo Contrato**: Dispara a criação de uma linha no banco de dados e redireciona para `/editor/[id]`.

🔗 *Voltar para:* [[Árvore de Rotas (Next.js)]]