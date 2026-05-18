
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const templates = [
  {
    title: "Prestação de Serviços e Consultoria Estratégica",
    slug: "consultoria-estrategica-premium",
    category: "Profissional",
    description: "Contrato robusto para consultores e profissionais liberais de alto ticket, com foco em entrega e IP.",
    content: `
      <h2 style="text-align: center;" class="text-2xl font-black uppercase tracking-tighter mb-8">CONTRATO DE PRESTAÇÃO DE SERVIÇOS E CONSULTORIA ESTRATÉGICA</h2>
      <p class="text-[10px] text-muted-foreground uppercase font-mono tracking-[0.3em] mb-12 text-center border-y border-border py-2">PROTOCOL: CONSULT-PREMIUM-V2</p>

      <div class="space-y-6">
        <p><strong>CONTRATANTE:</strong> [Nome/Razão Social], inscrito(a) no [CPF/CNPJ] nº [Número], com sede em [Endereço Completo].</p>
        <p><strong>CONTRATADA:</strong> [Nome/Razão Social], inscrito(a) no [CPF/CNPJ] nº [Número], com sede em [Endereço Completo].</p>

        <h3 class="text-lg font-bold uppercase tracking-widest mt-10 mb-4 border-l-4 border-primary pl-4">CLÁUSULA 1 - OBJETO E ESCOPO</h3>
        <p>O presente contrato tem por objeto a prestação de serviços de consultoria especializada em [Descrever Área], compreendendo as seguintes atividades:</p>
        <ul class="list-disc pl-8 space-y-2">
          <li>Análise diagnóstica e mapeamento de processos internos;</li>
          <li>Desenvolvimento de estratégias de otimização de performance;</li>
          <li>Acompanhamento de implementação de ferramentas de IA;</li>
          <li>Relatórios mensais de KPIs e evolução de metas.</li>
        </ul>

        <h3 class="text-lg font-bold uppercase tracking-widest mt-10 mb-4 border-l-4 border-primary pl-4">CLÁUSULA 2 - PREÇO E CONDIÇÕES DE PAGAMENTO</h3>
        <p>Pelos serviços ora contratados, a CONTRATANTE pagará à CONTRATADA o valor total de <strong>R$ [Valor]</strong>, distribuído da seguinte forma:</p>
        <ol class="list-decimal pl-8 space-y-2">
          <li><strong>Setup/Início:</strong> R$ [Valor] pagos na assinatura deste instrumento;</li>
          <li><strong>Parcelas Mensais:</strong> [Número] parcelas de R$ [Valor] vencendo todo dia [Dia];</li>
          <li><strong>Success Fee:</strong> [Porcentagem]% sobre o lucro líquido gerado pelo projeto (se aplicável).</li>
        </ol>

        <h3 class="text-lg font-bold uppercase tracking-widest mt-10 mb-4 border-l-4 border-primary pl-4">CLÁUSULA 3 - PROPRIEDADE INTELECTUAL</h3>
        <p>Todos os materiais, metodologias, códigos, prompts e estratégias desenvolvidas durante a vigência deste contrato pertencem exclusivamente à <strong>CONTRATADA</strong>, sendo concedida à CONTRATANTE uma licença de uso intransferível para aplicação interna em seu negócio.</p>

        <h3 class="text-lg font-bold uppercase tracking-widest mt-10 mb-4 border-l-4 border-primary pl-4">CLÁUSULA 4 - LGPD E CONFIDENCIALIDADE</h3>
        <p>As partes comprometem-se a tratar todos os dados pessoais e informações comerciais em estrita observância à Lei Geral de Proteção de Dados (Lei 13.709/18). Qualquer vazamento de dados sensíveis sujeitará a parte infratora à multa de 10 vezes o valor do contrato.</p>

        <h3 class="text-lg font-bold uppercase tracking-widest mt-10 mb-4 border-l-4 border-primary pl-4">CLÁUSULA 5 - RESCISÃO</h3>
        <p>Este contrato poderá ser rescindido por qualquer das partes mediante aviso prévio de 30 dias. Em caso de rescisão imotivada pela CONTRATANTE antes de 50% do prazo, será devida multa de 30% do saldo remanescente.</p>

        <div class="mt-20 pt-10 border-t border-border flex justify-between gap-10">
          <div class="flex-1 text-center italic border-t border-muted-foreground/30 pt-4 text-xs">CONTRATANTE</div>
          <div class="flex-1 text-center italic border-t border-muted-foreground/30 pt-4 text-xs">CONTRATADA</div>
        </div>
      </div>
    `
  },
  {
    title: "Locação Residencial Master com Garantia Blindada",
    slug: "locacao-residencial-master",
    category: "Cível",
    description: "Modelo completo de locação residencial atualizado com as últimas jurisprudências e garantias robustas.",
    content: `
      <h2 style="text-align: center;" class="text-2xl font-black uppercase tracking-tighter mb-8">CONTRATO DE LOCAÇÃO DE IMÓVEL RESIDENCIAL</h2>
      <p class="text-[10px] text-muted-foreground uppercase font-mono tracking-[0.3em] mb-12 text-center border-y border-border py-2">CERTIFICADO IMOBILIÁRIO - V3.0</p>

      <div class="space-y-6">
        <p><strong>LOCADOR:</strong> [Nome Completo], [Nacionalidade], [Estado Civil], [Profissão], CPF nº [Número], residente em [Endereço].</p>
        <p><strong>LOCATÁRIO:</strong> [Nome Completo], [Nacionalidade], [Estado Civil], [Profissão], CPF nº [Número], residente em [Endereço].</p>

        <h3 class="text-lg font-bold uppercase tracking-widest mt-10 mb-4 border-l-4 border-primary pl-4">CLÁUSULA 1 - DO IMÓVEL</h3>
        <p>O imóvel objeto deste contrato localiza-se na [Endereço Completo do Imóvel], composto por [Descrever Comôdos/Vagas], em perfeito estado de conservação e limpeza.</p>

        <h3 class="text-lg font-bold uppercase tracking-widest mt-10 mb-4 border-l-4 border-primary pl-4">CLÁUSULA 2 - PRAZO E VALOR</h3>
        <p>A locação terá o prazo de <strong>30 (trinta) meses</strong>, iniciando em [Data] e terminando em [Data]. O aluguel mensal é de <strong>R$ [Valor]</strong>, reajustado anualmente pelo índice [IPCA/IGP-M].</p>

        <h3 class="text-lg font-bold uppercase tracking-widest mt-10 mb-4 border-l-4 border-primary pl-4">CLÁUSULA 3 - GARANTIAS</h3>
        <p>Como garantia das obrigações assumidas, o LOCATÁRIO apresenta neste ato [Seguro Fiança / Título de Capitalização / Caução], no valor correspondente a [Número] meses de aluguel.</p>

        <h3 class="text-lg font-bold uppercase tracking-widest mt-10 mb-4 border-l-4 border-primary pl-4">CLÁUSULA 4 - ENCARGOS E MANUTENÇÃO</h3>
        <p>Além do aluguel, correm por conta do LOCATÁRIO todas as despesas de condomínio, IPTU, luz, água e taxas de lixo. O LOCATÁRIO obriga-se a manter o imóvel em perfeito estado, devolvendo-o nas mesmas condições da vistoria inicial.</p>

        <h3 class="text-lg font-bold uppercase tracking-widest mt-10 mb-4 border-l-4 border-primary pl-4">CLÁUSULA 5 - MULTA RESCISÓRIA</h3>
        <p>Fica estipulada a multa de <strong>3 (três) aluguéis vigentes</strong> para a parte que infringir qualquer cláusula deste contrato, proporcional ao tempo restante de locação.</p>

        <div class="mt-20 pt-10 border-t border-border flex justify-between gap-10">
          <div class="flex-1 text-center italic border-t border-muted-foreground/30 pt-4 text-xs">LOCADOR</div>
          <div class="flex-1 text-center italic border-t border-muted-foreground/30 pt-4 text-xs">LOCATÁRIO</div>
        </div>
      </div>
    `
  },
  {
    title: "NDA de Alta Segurança - Segredos de Negócio",
    slug: "nda-alta-seguranca",
    category: "Sigilo",
    description: "Acordo de não divulgação extremo, protegendo algoritmos, bases de dados e estratégias de mercado.",
    content: `
      <h2 style="text-align: center;" class="text-2xl font-black uppercase tracking-tighter mb-8">ACORDO DE CONFIDENCIALIDADE E NÃO-DIVULGAÇÃO (NDA)</h2>
      <p class="text-[10px] text-muted-foreground uppercase font-mono tracking-[0.3em] mb-12 text-center border-y border-border py-2">SECURITY PROTOCOL: BLACK-BOX-99</p>

      <div class="space-y-6">
        <h3 class="text-lg font-bold uppercase tracking-widest mt-10 mb-4 border-l-4 border-primary pl-4">CLÁUSULA 1 - DEFINIÇÃO DE INFORMAÇÃO CONFIDENCIAL</h3>
        <p>Compreende-se como "Informação Confidencial" todo e qualquer dado técnico, comercial, financeiro, estratégico, algoritmos de IA, estruturas de banco de dados, chaves de acesso e códigos-fonte revelados pela parte REVELADORA à parte RECEPTORA.</p>

        <h3 class="text-lg font-bold uppercase tracking-widest mt-10 mb-4 border-l-4 border-primary pl-4">CLÁUSULA 2 - OBRIGAÇÕES DA RECEPTORA</h3>
        <p>A RECEPTORA obriga-se a manter o mais absoluto sigilo, não utilizando as informações para fins diversos do projeto [Nome do Projeto] e impedindo o acesso de terceiros não autorizados sob protocolos de criptografia de alto nível.</p>

        <h3 class="text-lg font-bold uppercase tracking-widest mt-10 mb-4 border-l-4 border-primary pl-4">CLÁUSULA 3 - PENALIDADE PECUNIÁRIA</h3>
        <p>O descumprimento de qualquer dever de sigilo importará no pagamento imediato de multa punitiva no valor de <strong>R$ 500.000,00 (quinhentos mil reais)</strong>, independente da comprovação de prejuízo real, sem prejuízo de perdas e danos adicionais.</p>

        <h3 class="text-lg font-bold uppercase tracking-widest mt-10 mb-4 border-l-4 border-primary pl-4">CLÁUSULA 4 - PRAZO DE VIGÊNCIA</h3>
        <p>As obrigações de sigilo previstas neste instrumento permanecerão em vigor por um período de <strong>10 (dez) anos</strong> contados da data da última revelação de informação.</p>

        <p class="mt-10 text-xs italic text-muted-foreground">Documento registrado com carimbo de tempo digital e rastreabilidade de IPs.</p>
      </div>
    `
  },
  {
    title: "Contrato de Parceria com Influenciador e Licenciamento",
    slug: "parceria-influenciador-imagem",
    category: "Profissional",
    description: "Contrato moderno para campanhas de marketing de influência, cobrindo direitos autorais e cláusulas de moralidade.",
    content: `
      <h2 style="text-align: center;" class="text-2xl font-black uppercase tracking-tighter mb-8">CONTRATO DE PARCERIA COM INFLUENCIADOR DIGITAL</h2>
      <p class="text-[10px] text-muted-foreground uppercase font-mono tracking-[0.3em] mb-12 text-center border-y border-border py-2">DIGITAL ASSET LICENSE - V1.5</p>

      <div class="space-y-6">
        <h3 class="text-lg font-bold uppercase tracking-widest mt-10 mb-4 border-l-4 border-primary pl-4">CLÁUSULA 1 - OBJETO E ENTREGAS</h3>
        <p>O influenciador compromete-se a produzir e publicar o seguinte conteúdo em suas redes sociais:</p>
        <ul class="list-disc pl-8 space-y-2">
          <li>[Número] Conjunto de Stories no Instagram com link (CTA);</li>
          <li>[Número] Vídeo no formato Reels/TikTok com menção à marca;</li>
          <li>Participação em [Número] live ou evento presencial.</li>
        </ul>

        <h3 class="text-lg font-bold uppercase tracking-widest mt-10 mb-4 border-l-4 border-primary pl-4">CLÁUSULA 2 - LICENCIAMENTO DE IMAGEM</h3>
        <p>O INFLUENCIADOR licencia à MARCA o uso de sua imagem e voz contidas no material produzido para fins publicitários pelo prazo de [Meses] meses, em território nacional.</p>

        <h3 class="text-lg font-bold uppercase tracking-widest mt-10 mb-4 border-l-4 border-primary pl-4">CLÁUSULA 3 - CLÁUSULA DE MORALIDADE</h3>
        <p>A MARCA poderá rescindir este contrato imediatamente, sem qualquer ônus, caso o INFLUENCIADOR se envolva em condutas públicas que afetem negativamente a reputação da marca (ex: crimes, discursos de ódio ou escândalos públicos).</p>

        <h3 class="text-lg font-bold uppercase tracking-widest mt-10 mb-4 border-l-4 border-primary pl-4">CLÁUSULA 4 - EXCLUSIVIDADE</h3>
        <p>O INFLUENCIADOR não poderá realizar publicidade de marcas concorrentes no segmento de [Descrever Segmento] pelo prazo de 30 dias antes e após as postagens ora contratadas.</p>
      </div>
    `
  },
  {
    title: "Acordo de Sócios, Vesting e Governança",
    slug: "acordo-socios-vesting",
    category: "Societário",
    description: "Essencial para Startups e Sociedades Limitadas que buscam proteger o equity e alinhar incentivos de longo prazo.",
    content: `
      <h2 style="text-align: center;" class="text-2xl font-black uppercase tracking-tighter mb-8">ACORDO DE SÓCIOS E PROTOCOLO DE GOVERNANÇA</h2>
      <p class="text-[10px] text-muted-foreground uppercase font-mono tracking-[0.3em] mb-12 text-center border-y border-border py-2">EQUITY PROTECTION SYSTEM - V4.2</p>

      <div class="space-y-6">
        <h3 class="text-lg font-bold uppercase tracking-widest mt-10 mb-4 border-l-4 border-primary pl-4">CLÁUSULA 1 - DO VESTING</h3>
        <p>A participação societária dos fundadores estará sujeita a um período de Vesting de <strong>48 meses</strong>, com um Cliff de 12 meses. A liberação das quotas ocorrerá de forma linear e mensal após o período de Cliff.</p>

        <h3 class="text-lg font-bold uppercase tracking-widest mt-10 mb-4 border-l-4 border-primary pl-4">CLÁUSULA 2 - DIREITO DE PREFERÊNCIA</h3>
        <p>Na hipótese de qualquer Sócio pretender alienar suas quotas a terceiros, os demais Sócios terão o direito de preferência para aquisição de tais quotas em igualdade de condições.</p>

        <h3 class="text-lg font-bold uppercase tracking-widest mt-10 mb-4 border-l-4 border-primary pl-4">CLÁUSULA 3 - DRAG-ALONG E TAG-ALONG</h3>
        <p><strong>Drag-Along:</strong> Caso o Sócio majoritário aceite uma oferta de venda de 100% da empresa, poderá obrigar os minoritários a venderem suas quotas nos mesmos termos.</p>
        <p><strong>Tag-Along:</strong> Caso o majoritário venda seu controle, os minoritários têm o direito de incluir suas quotas na mesma transação proporcionalmente.</p>

        <h3 class="text-lg font-bold uppercase tracking-widest mt-10 mb-4 border-l-4 border-primary pl-4">CLÁUSULA 4 - NÃO-COMPETIÇÃO (NON-COMPETE)</h3>
        <p>O sócio que se retirar da sociedade compromete-se a não atuar no mesmo segmento de mercado por um período de 24 meses, sob pena de multa de [Valor] e perda de direitos residuais.</p>
      </div>
    `
  }
];

async function insertTemplates() {
  console.log('🚀 Iniciando inserção dos Super Templates...');
  const { data, error } = await supabase.from('templates').insert(templates);
  
  if (error) {
    console.error('❌ Erro ao inserir templates:', error);
  } else {
    console.log('✅ 5 Super Templates inseridos com sucesso no Arsenal!');
  }
}

insertTemplates();
