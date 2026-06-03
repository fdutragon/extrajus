const fs = require('fs');
const path = require('path');

const vaultPath = 'd:/lilith-brain/extrajus/lilith-brain/Extrajus';
const recursosPath = path.join(vaultPath, '02. RECURSOS E ARSENAL');

if (!fs.existsSync(recursosPath)) {
    fs.mkdirSync(recursosPath, { recursive: true });
}

const files = {
    'Recurso - TipTap (Motor de Contratos).md': `# RECURSO: TipTap

O coração do Extrajus. Onde a magia da edição de documentos acontece.

## Por que TipTap?
- Headless e altamente customizável. Diferente de editores blocados, o TipTap nos dá o poder de renderizar documentos com precisão letal, parecendo peças jurídicas e não simples anotações.
- Extensões customizadas para gerenciar hierarquia (Cláusula 1, Parágrafo 1).
- Integração fácil com o React e a [[Recurso - Inteligência Artificial (Gemini_OpenAI)|IA]] para inserir blocos gerados automaticamente.

🔗 *Retornar para o Arsenal:* [[Arsenal Tecnológico]]`,

    'Recurso - Next.js App Router (Framework).md': `# RECURSO: Next.js (App Router)

A espinha dorsal de todo o ecossistema.

## A Arquitetura da Máquina
- Usado em sua versão mais agressiva (App Router) para garantir SEO implacável e Server Components que não vazam dados pro cliente.
- Gerencia o roteamento de todo o sistema detalhado na [[Árvore de Rotas (Next.js)]].
- Combina perfeitamente com o [[Recurso - Supabase (Backend as a Service)|Supabase]] para autenticação no Edge.

🔗 *Retornar para o Arsenal:* [[Arsenal Tecnológico]]`,

    'Recurso - Supabase (Backend as a Service).md': `# RECURSO: Supabase

O cofre forte dos dados e sentinela de segurança.

## O Guardião
- **PostgreSQL**: Sólido, imutável e brutalmente rápido.
- **Row Level Security (RLS)**: Garante que um usuário jamais enxergue o contrato de outro. Segurança militar.
- Base estruturada descrita no [[Esquema de Banco de Dados (Supabase)]].

🔗 *Retornar para o Arsenal:* [[Arsenal Tecnológico]]`,

    'Recurso - Shadcn UI (Componentes).md': `# RECURSO: Shadcn UI

A carcaça estética do projeto. O uniforme do exército.

## A Doutrina Shadcn
- Componentes não empacotados em NPM, mas sim injetados diretamente no código-fonte. Controle absoluto sobre cada pixel.
- Estilizado rigorosamente com [[Recurso - TailwindCSS (Estilização)|TailwindCSS]] para refletir a [[A Estética do Caos|Estética Dark Occult Luxury]].
- Nada de bordas arredondadas amigáveis de startups bobas. Queremos ângulos precisos, fundos densos e aparência de software corporativo letal.

🔗 *Retornar para o Arsenal:* [[Arsenal Tecnológico]]`,

    'Recurso - TailwindCSS (Estilização).md': `# RECURSO: TailwindCSS

A ferramenta de forja visual.

## Por que Tailwind?
- Estilização funcional sem CSS inline e sem perda de contexto.
- Permite criar temas (\`globals.css\`) para gerenciar as cores exatas do "Dark Occult Luxury" de forma programática usando variáveis HSL.

🔗 *Retornar para o Arsenal:* [[Arsenal Tecnológico]]`,

    'Recurso - GGPIX (Gateway de Pagamento).md': `# RECURSO: GGPIX

A artéria por onde circula o capital.

## Fluxo de Conversão
- Gerador de QR Code PIX dinâmico que não cobra taxas abusivas.
- Ligado diretamente ao nosso [[Rota API - Webhook GGPIX|Webhook de PIX]] para ativação de planos em tempo real.
- Permite que a [[Rota - Checkout|Máquina de Conversão]] funcione perfeitamente com fricção mínima.

🔗 *Retornar para o Arsenal:* [[Arsenal Tecnológico]]`,

    'Recurso - Inteligência Artificial (Gemini_OpenAI).md': `# RECURSO: IA (Gemini / OpenAI)

O cérebro cognitivo do Extrajus.

## O Motor Cognitivo
- Responsável por rodar os comandos mapeados nos [[Prompts de Geração de Contratos]].
- Chamado exclusivamente pela rota segura [[Rota API - AI Generate]] para que a chave da API nunca seja exposta no front-end.
- Capacidade de gerar cláusulas blindadas e auditar documentos com frieza técnica.

🔗 *Retornar para o Arsenal:* [[Arsenal Tecnológico]]`,

    'Recurso - Resend (Disparador de Emails).md': `# RECURSO: Resend

O Arauto do Império.

## Comunicação Implacável
- Disparador de emails focado em performance, usando React Email.
- Entrega notificações de onboarding, alertas de "PIX recebido" e PDFs finalizados de contratos diretamente na caixa de entrada do cliente sem cair no spam.

🔗 *Retornar para o Arsenal:* [[Arsenal Tecnológico]]`
};

const masterResourceNode = `# ARSENAL TECNOLÓGICO

Abaixo está catalogado cada equipamento utilizado na forja do Extrajus. Clique em qualquer sinapse para entender o propósito exato e implacável da ferramenta no ecossistema.

## 🛠️ Framework e Core
- [[Recurso - Next.js App Router (Framework)]]
- [[Recurso - TipTap (Motor de Contratos)]]

## 👁️ Estética e Front-End
- [[Recurso - Shadcn UI (Componentes)]]
- [[Recurso - TailwindCSS (Estilização)]]

## 🧠 Back-End e IA
- [[Recurso - Supabase (Backend as a Service)]]
- [[Recurso - Inteligência Artificial (Gemini_OpenAI)]]

## 💰 Monetização e Infra
- [[Recurso - GGPIX (Gateway de Pagamento)]]
- [[Recurso - Resend (Disparador de Emails)]]

🔗 *Retornar:* [[Memorial Descritivo do Império]]`;

Object.entries(files).forEach(([filename, content]) => {
    fs.writeFileSync(path.join(recursosPath, filename), content, 'utf8');
});

fs.writeFileSync(path.join(recursosPath, 'Arsenal Tecnológico.md'), masterResourceNode, 'utf8');

// Update the Memorial Descritivo to link to the Arsenal Tecnológico instead of general bullets
const rotasPath = path.join(vaultPath, '02. ARQUITETURA E ROTAS');
const memorialFile = path.join(rotasPath, 'Memorial Descritivo do Império.md');
if (fs.existsSync(memorialFile)) {
    let memorialContent = fs.readFileSync(memorialFile, 'utf8');
    memorialContent = memorialContent.replace(
        '- [[Supabase e Backend]]: A base de dados e segurança.',
        '- [[Supabase e Backend]]: A base de dados e segurança.\n- [[Arsenal Tecnológico]]: O catálogo de todas as ferramentas da nossa máquina.'
    );
    fs.writeFileSync(memorialFile, memorialContent, 'utf8');
}

console.log('Sinapses de recursos criadas e conectadas ao Memorial!');
