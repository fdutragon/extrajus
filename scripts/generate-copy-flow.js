const fs = require('fs');
const path = require('path');

const vaultPath = 'd:/lilith-brain/extrajus/lilith-brain/Extrajus';
const copyPath = path.join(vaultPath, '03. ARSENAL DE COPY');

if (!fs.existsSync(copyPath)) {
    fs.mkdirSync(copyPath, { recursive: true });
}

const content = `# FLUXO ABSOLUTO DE COPY (A Jornada do Cliente)

Baseado no mapa desenhado no [[Fluxo de Batalha (Extrajus)]], este é o roteiro psicológico exato que o lead vai percorrer. A nossa linguagem não pede; ela ordena, prova e converte.

---

## 🛑 ETAPA 1: O Primeiro Contato (Google Ads)
*Onde a dor é exposta no campo de busca.*

- **O Sentimento do Lead:** Medo (calote, perder o imóvel, perder direitos).
- **O Gancho (Hook):** Invalide a solução atual dele (modelos de internet).
- **Exemplo de Copy:**
  > "Baixou um contrato grátis na internet? Você acabou de assinar o próprio prejuízo. Gere agora um documento inviolável redigido por Inteligência Artificial focado em blindagem jurídica. Em 2 minutos."
- **Objetivo Tático:** Forçar o clique e matar a objeção de que "qualquer modelo serve".

---

## 💀 ETAPA 2: A Aterrissagem (Landing Page - Root)
*Ele clicou. O design Dark Occult Luxury já impõe autoridade.*

- **Headline (H1):** A sua assinatura vale o que o contrato protege.
- **Sub-headline (H2):** Abandone modelos fracos. A Lilith (IA) audita, blinda e redige cláusulas para você não perder dinheiro em tribunais.
- **Micro-copy do CTA:** "Testar o Motor de Contratos (Grátis com marca d'água)"
- **Objetivo Tático:** Empurrá-lo para o editor de contratos imediatamente. Fricção zero. Sem cartão de crédito na entrada.

---

## ⚙️ ETAPA 3: A Armadilha de Valor (Editor de Contratos)
*Ele preencheu a isca e está olhando para o contrato sendo montado pelo TipTap.*

- **O Cenário:** O usuário está editando o documento. Ele vê o poder da plataforma. Mas há um aviso pairando:
  > ⚠️ *Alerta: Documento de risco não auditado. Contém brechas passíveis de anulação judicial.*
- **O Gancho do Botão:** "Auditar Contrato e Blindar Cláusulas com IA."
- **Objetivo Tático:** Injetar o senso de urgência e o medo de que o que ele acabou de fazer não é forte o suficiente sozinho. Ele precisa clicar no botão da IA.

---

## 💳 ETAPA 4: A Parede (Modal de Checkout)
*Ele apertou o botão da IA. O Saldo de Créditos é 0. O Modal de PIX sobe agressivamente.*

- **O Cenário:** A tela escurece. O QR code GGPIX aparece.
- **Copy do Checkout:** 
  > "Auditoria em Pausa."
  > "A Lilith identificou pontos de fraqueza no seu contrato. Para ativar a Inteligência Artificial e reconstruir as cláusulas blindadas, adicione créditos à sua conta."
  > "Acesso Imediato. Pague R$ 19,90 via PIX e o motor destrava em 5 segundos."
- **Gatilho de Urgência:** Um micro-cronômetro de 10 minutos para garantir o PIX na hora.
- **Objetivo Tático:** Fechar a transação por impulso emocional (medo e necessidade).

---

## ⚡ ETAPA 5: O Desbloqueio (Webhook e Ação da IA)
*O GGPIX confirmou. A tela destrava.*

- **Micro-copy de Sucesso (Toast):**
  > "PIX Reconhecido. Créditos injetados. Iniciando Auditoria..."
- **A Ação:** O TipTap começa a redigir automaticamente, como se fosse um fantasma digitando, substituindo as cláusulas fracas pelas blindadas (baseadas no nosso [[Prompts de Geração de Contratos]]).
- **O Fechamento:** Botão verde e majestoso liberado: "Exportar PDF Limpo".

---

## 📩 ETAPA 6: Pós-Venda (Email via Resend)
*O contrato foi gerado e salvo.*

- **Assunto do Email:** Seu contrato blindado está guardado no cofre.
- **Corpo da Mensagem:**
  > "Comandante, seu documento foi auditado e gerado com sucesso.
  > Um modelo de internet te custaria milhares de reais em honorários de um advogado para desfazer o erro amanhã.
  > Você tem mais X créditos no seu painel. Use-os com sabedoria."
- **Objetivo Tático:** Recorrência. Fazer ele lembrar que tem a ferramenta e mantê-lo refém da segurança que a Lilith oferece.

🔗 *Retornar ao núcleo:* [[00. NÚCLEO CENTRAL]]`;

fs.writeFileSync(path.join(copyPath, 'Fluxo Absoluto de Copy.md'), content, 'utf8');

// Update the AI index
const scriptPath = path.join(vaultPath, '..', '..', 'scripts', 'generate-ai-index.js');
if (fs.existsSync(scriptPath)) {
    require('child_process').execSync('node "' + scriptPath + '"');
}

console.log('Fluxo de Copy criado e Índice atualizado com sucesso!');
