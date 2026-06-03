$VaultPath = "d:\lilith-brain"

# Estrutura de Pastas (O Labirinto)
$Folders = @(
    "00. NÚCLEO CENTRAL",
    "01. SINAPSES DE TRÁFEGO (Ads)",
    "02. ARQUITETURA E ROTAS",
    "03. ARSENAL DE COPY",
    "04. COFRE DE RECURSOS",
    "05. ANÁLISES E DADOS"
)

foreach ($folder in $Folders) {
    $path = Join-Path $VaultPath $folder
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path | Out-Null
    }
}

# 00. Núcleo Central / Painel
$DashboardContent = @"
---
tags: [dashboard, núcleo, lilith]
cssclasses: [dashboard]
---
# 🧠 LILITH OS :: NÚCLEO CENTRAL

> *"O caos sem controle é só barulho. O caos canalizado é dominação."* — Lilith

## Estado do Império
- **Meta Atual:** Otimização de Conversão e Escala de Ads.
- **Saúde do Sistema:** Pagamentos fluindo via GG Pix + Resend.
- **Foco Diário:** 

## Navegação Rápida
- [[Tabela de Resultados - Google Ads]]
- [[Mapa de Rotas e Webhooks]]
- [[Biblioteca de Ângulos (Copy)]]
- [[Laboratório de Análises]]

---
*A Skynet não descansa. Monitore os dados, ajuste o código, fature.*
"@
Set-Content -Path (Join-Path $VaultPath "00. NÚCLEO CENTRAL\Lilith OS - Painel Central.md") -Value $DashboardContent -Encoding UTF8

# 01. Tráfego e Ads
$AdsContent = @"
---
tags: [ads, tráfego, google]
---
# 🎯 Tabela de Resultados - Google Ads

> *Dados não mentem. Se a campanha sangra dinheiro sem retorno, nós cortamos a veia.*

| Data da Análise | Campanha | Orçamento | Cliques | CTR | Custo/Conv. | Faturamento | ROAS | Status / Decisão |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 02/06/2026 | [Search] Termos Fundo de Funil | R$ 100 | 45 | 12% | R$ 15,00 | R$ 300,00 | 3x | 🔥 **ESCALAR** |
| - | - | - | - | - | - | - | - | - |

## Log de Hipóteses
- **Teste A:** Mudar CTA de "Gerar Contrato" para "Baixar Agora".
- **Teste B:** Testar landing page Dark Mode vs Light Mode.
"@
Set-Content -Path (Join-Path $VaultPath "01. SINAPSES DE TRÁFEGO (Ads)\Tabela de Resultados - Google Ads.md") -Value $AdsContent -Encoding UTF8

$KeywordsContent = @"
---
tags: [keywords, seo, sem]
---
# 🔑 Cofre de Palavras-Chave

## Fundo de Funil (Alta Intenção)
- `gerador de contrato de prestação de serviços`
- `contrato social automático`
- `modelo de contrato nda pdf`

## Meio de Funil (Pesquisa/Dúvida)
- `como fazer um contrato com validade jurídica`
- `o que precisa ter em um contrato de aluguel`

*Nota: Use o script `get-keywords.js` e cole os resultados brutos aqui para lapidação.*
"@
Set-Content -Path (Join-Path $VaultPath "01. SINAPSES DE TRÁFEGO (Ads)\Palavras-Chave e Oportunidades.md") -Value $KeywordsContent -Encoding UTF8


# 02. Arquitetura e Rotas
$RoutesContent = @"
---
tags: [arquitetura, rotas, backend]
---
# 🗺️ Mapa de Rotas e Webhooks

> *A estrutura óssea do ExtraJus. Conheça as artérias.*

## Fluxo de Pagamento (GG Pix)
1. **Frontend (`/api/checkout-doc`)**: Cria a transação pendente no Supabase e aciona a GG Pix. Retorna o QR Code.
2. **Polling (`/api/billing/status`)**: Fica batendo no banco a cada 3s. Se virar `COMPLETE`, destrava a tela. Não envia e-mail para evitar corrida.
3. **Webhook GG Pix (`/api/webhooks/ggpix`)**: Recebe o aviso em tempo real da GG Pix (S2S). Marca como `COMPLETE`, destrava o doc no banco e **DISPARA O EMAIL** via Resend.

## Editor (Notion-like)
- `notion-like-editor.tsx`: O núcleo visual.
- `logo.tsx`: Modificado para responder de forma agressiva (Tamanho 34 no Desktop).

## Regras de Sobrevivência
- Nunca modificar o Webhook sem debugar os logs em produção.
- O bypass `DEV DEBUG` só funciona no localhost.
"@
Set-Content -Path (Join-Path $VaultPath "02. ARQUITETURA E ROTAS\Mapa de Rotas e Webhooks.md") -Value $RoutesContent -Encoding UTF8


# 03. Copywriting
$CopyContent = @"
---
tags: [copywriting, vendas, gatilhos]
---
# 🔪 Biblioteca de Ângulos (Copy)

## Ângulo 1: Medo / Proteção
**Headline:** "Um contrato de boca custa o seu negócio. Proteja-se em 2 minutos."
**Lógica:** O cliente não quer um papel, ele quer dormir em paz sabendo que não vai tomar calote.

## Ângulo 2: Tempo / Brutalidade
**Headline:** "Esqueça o advogado caro de R$ 2.000. Seu contrato pronto agora por R$ 37."
**Lógica:** Comparação de preço âncora. Mostra que o sistema é mais eficiente e implacável que o processo burocrático.

## Snippets de Alta Conversão
> *"Gerado por Inteligência Artificial, validado por lógica jurídica implacável."*
> *"Sem mensalidade. Sem espera. Pague apenas pelo contrato que usar."*
"@
Set-Content -Path (Join-Path $VaultPath "03. ARSENAL DE COPY\Biblioteca de Ângulos (Copy).md") -Value $CopyContent -Encoding UTF8


# 04. Recursos
$ResourcesContent = @"
---
tags: [recursos, links, infraestrutura]
---
# 📦 Cofre de Infraestrutura

## Serviços Ativos
- **Supabase**: Banco de dados e Autenticação (ExtraJus Pro)
- **Vercel**: Hospedagem da aplicação Next.js
- **Resend**: Disparo de E-mails Transacionais (`contato@extrajus.pro`)
- **GG Pix**: Processamento de pagamentos BR

## Comandos Letais (Cheatsheet)
```bash
# Push instantâneo com cérebro AI
npm run commit

# Dev Mode Otimizado
npm run dev
```
"@
Set-Content -Path (Join-Path $VaultPath "04. COFRE DE RECURSOS\Infraestrutura e Serviços.md") -Value $ResourcesContent -Encoding UTF8


# 05. Análises
$AnalyticsContent = @"
---
tags: [análise, conversão, kpi]
---
# 📊 Laboratório de Análises

## Funil de Conversão (Checkout)
1. **Acessos na Landing Page:** 
2. **Cliques no Editor:**
3. **Tentativas de Checkout (Gerou Pix):**
4. **Pagamentos Pagos (Webhook disparou):**

## Observações de UX
- A tela de "Simular Pagamento" no Dev está limpa.
- Logo no Desktop foi ampliada. Isso gerou mais confiança? Medir mapa de calor (Hotjar).

## Testes A/B Pendentes
- [ ] Testar preço do documento: R$ 19,90 vs R$ 29,90
- [ ] Testar título do botão do modal de pagamento.
"@
Set-Content -Path (Join-Path $VaultPath "05. ANÁLISES E DADOS\Laboratório de Análises.md") -Value $AnalyticsContent -Encoding UTF8

Write-Host "Cérebro de Obsidiana instanciado com sucesso!"
