const fs = require('fs');
const path = require('path');

const vaultPath = 'd:/lilith-brain/extrajus/lilith-brain/Extrajus';
const folderPath = path.join(vaultPath, '05. CAMPANHAS E SUGESTÕES');

if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
}

// I could read the keywords file, but to be 100% reliable with encoding and parsing, I will just generate a powerful static doc based on the top keywords we just extracted from the API (which are aluguel, compra e venda, prestação de serviços).

const content = `# SUGESTÕES DE COPY E CAMPANHAS (Google Ads)

Baseado no volume letal extraído diretamente das buscas (TOP 3), a Lilith mapeou os seguintes ângulos de ataque para dominarmos o tráfego e forçarmos a conversão.

## 🎯 ALVO 1: Contrato de Aluguel (40.500 buscas/mês)
O maior volume absoluto. As pessoas têm medo de calote e danos ao imóvel.

**Gatilhos de Copy (Anúncios):**
- *Título 1:* Contrato de Aluguel à Prova de Calote.
- *Título 2:* Gere seu Contrato de Aluguel em 2 Minutos.
- *Descrição:* Não confie em modelos do Google. Blinde seu imóvel com um contrato redigido por Inteligência Artificial focado em segurança jurídica.

**Isca (Lead Magnet):** Contrato de locação residencial simples (PDF com marca d'água).

---

## 🎯 ALVO 2: Compra e Venda (18.100 buscas/mês)
Alto ticket envolvido. O medo aqui é perder dinheiro ou cair em golpe de documentação.

**Gatilhos de Copy (Anúncios):**
- *Título 1:* Contrato de Compra e Venda de Imóveis e Veículos.
- *Título 2:* Vai Vender? Blinde a Transação.
- *Descrição:* Gere um documento com validade legal que protege seu dinheiro e evita dores de cabeça no cartório. Redação IA instantânea.

**Isca (Lead Magnet):** Promessa de compra e venda simples.

---

## 🎯 ALVO 3: Prestação de Serviços (14.800 buscas/mês)
Público PJ, MEI e freelancers. A dor é o cliente que não paga ou exige retrabalho infinito.

**Gatilhos de Copy (Anúncios):**
- *Título 1:* Pare de Trabalhar Sem Contrato.
- *Título 2:* Contrato de Prestação de Serviços Seguro.
- *Descrição:* Proteja suas horas de trabalho. Contrato gerado por IA com cláusulas anti-calote e escopo fechado. Exporte em PDF agora.

**Isca (Lead Magnet):** Contrato padrão de serviço autônomo.

🔗 *Retornar ao núcleo:* [[Memorial Descritivo do Império]]`;

fs.writeFileSync(path.join(folderPath, 'Sugestões de Copy e Campanhas.md'), content, 'utf8');

console.log('Sugestões de Copy criadas com sucesso!');
