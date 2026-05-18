import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Lista estática dos 50 contratos mais buscados do Brasil
const CONTRACT_TYPES = [
  {
    title: "Contrato de Locação Residencial",
    slug: "contrato-de-locacao-residencial",
    category: "Cível",
    description: "Instrumento completo de locação residencial com garantias, regras de inadimplemento, multas e regulação de condomínio e IPTU."
  },
  {
    title: "Contrato de Locação Comercial",
    slug: "contrato-de-locacao-comercial",
    category: "Cível",
    description: "Contrato estruturado para locação de imóveis não residenciais, contemplando regras de benfeitorias, direito a renovatória e fundo de comércio."
  },
  {
    title: "Contrato de Prestação de Serviços",
    slug: "contrato-de-prestacao-de-servicos",
    category: "Profissional",
    description: "Contrato padrão de prestação de serviços genéricos, definindo obrigações, prazos, formas de pagamento, multas e regras de rescisão."
  },
  {
    title: "Contrato de Compra e Venda de Imóvel",
    slug: "contrato-de-compra-e-venda-de-imovel",
    category: "Cível",
    description: "Contrato preliminar para promessa de compra e venda de imóvel urbano com regras de sinal (arras), posse e transferência de escritura."
  },
  {
    title: "Contrato de Compra e Venda de Veículo",
    slug: "contrato-de-compra-e-venda-de-veiculo",
    category: "Cível",
    description: "Contrato de compra e venda de veículo usado, definindo estado de conservação, preço, termos de pagamento e transferência de propriedade."
  },
  {
    title: "Acordo de Confidencialidade / NDA",
    slug: "acordo-de-confidencialidade-nda",
    category: "Sigilo",
    description: "Pacto de sigilo mútuo ou unilateral para proteção de informações proprietárias, segredos de negócios e propriedade intelectual."
  },
  {
    title: "Contrato de Trabalho por Prazo Determinado",
    slug: "contrato-de-trabalho-por-prazo-determinado",
    category: "Trabalhista",
    description: "Contrato de trabalho com data de término estipulada, em conformidade com as regras da CLT, incluindo período de experiência."
  },
  {
    title: "Contrato de Trabalho por Prazo Indeterminado",
    slug: "contrato-de-trabalho-por-prazo-indeterminado",
    category: "Trabalhista",
    description: "Contrato padrão de admissão CLT por tempo indeterminado, detalhando cargo, salário, jornada e benefícios."
  },
  {
    title: "Contrato de Parceria Comercial",
    slug: "contrato-de-parceria-comercial",
    category: "Societário",
    description: "Parceria estratégica entre duas empresas para desenvolvimento conjunto de negócios, sem criação de nova personalidade jurídica."
  },
  {
    title: "Contrato Social de Sociedade Limitada",
    slug: "contrato-social-sociedade-limitada",
    category: "Societário",
    description: "Contrato de constituição de empresa sob o tipo societário LTDA, definindo capital social, quotas e administração."
  },
  {
    title: "Acordo de Sócios / Shareholders Agreement",
    slug: "acordo-de-socios",
    category: "Societário",
    description: "Acordo parassocial regulando direito de preferência, tag-along, drag-along, regras de votação e resolução de impasses corporativos."
  },
  {
    title: "Contrato de Comodato de Imóvel",
    slug: "contrato-de-comodato-de-imovel",
    category: "Cível",
    description: "Empréstimo gratuito de imóvel residencial ou comercial para uso por tempo determinado, com regras de conservação e devolução."
  },
  {
    title: "Contrato de Mútuo Financeiro",
    slug: "contrato-de-mutuo-financeiro",
    category: "Cível",
    description: "Empréstimo de dinheiro entre pessoas físicas ou jurídicas com estipulação de juros moratórios, prazos e garantias."
  },
  {
    title: "Contrato de Desenvolvimento de Software",
    slug: "contrato-de-desenvolvimento-de-software",
    category: "Profissional",
    description: "Prestação de serviços de TI com foco em escopo, cronograma de entregas, homologação, bugs e transferência de propriedade intelectual."
  },
  {
    title: "Contrato de Honorários Advocatícios",
    slug: "contrato-de-honorarios-advocaticios",
    category: "Profissional",
    description: "Contrato de prestação de serviços advocatícios, estipulando honorários contratuais, de êxito (ad exitum) e despesas processuais."
  },
  {
    title: "Contrato de Empreitada de Obra",
    slug: "contrato-de-empreitada-de-obra",
    category: "Cível",
    description: "Contrato para execução de reforma ou construção por preço global ou unitário, delimitando etapas, materiais e cronograma."
  },
  {
    title: "Contrato de Corretagem de Imóveis",
    slug: "contrato-de-corretagem-de-imoveis",
    category: "Profissional",
    description: "Contrato de intermediação imobiliária, fixando regras de exclusividade, comissão de corretagem e prazo de vigência."
  },
  {
    title: "Contrato de Agenciamento de Influenciador",
    slug: "contrato-de-agenciamento-de-influenciador",
    category: "Profissional",
    description: "Regulação da relação comercial entre influenciador digital e marca, detalhando entregáveis, uso de imagem, exclusividade e métricas."
  },
  {
    title: "Contrato de Distribuição de Produtos",
    slug: "contrato-de-distribuicao-de-produtos",
    category: "Societário",
    description: "Contrato de distribuição comercial exclusiva ou não, fixando cotas mínimas de compra, território de atuação e políticas de pós-venda."
  },
  {
    title: "Contrato de Franquia",
    slug: "contrato-de-franquia",
    category: "Societário",
    description: "Contrato de Franquia Empresarial nos termos da Lei 13.966/19, definindo taxa de franquia, royalties, padrões e suporte de rede."
  },
  {
    title: "Contrato de Licenciamento de Software - SaaS",
    slug: "contrato-de-licenciamento-de-software-saas",
    category: "Profissional",
    description: "Contrato de licença de uso temporário de software em nuvem (SaaS), definindo limites de acesso, SLA e restrição de engenharia reversa."
  },
  {
    title: "Contrato de Cessão de Direitos Autorais",
    slug: "contrato-de-cessao-de-direitos-autorais",
    category: "Profissional",
    description: "Transferência total ou parcial de direitos patrimoniais sobre obras intelectuais, textos, designs ou criações artísticas."
  },
  {
    title: "Contrato de Sublocação de Imóvel",
    slug: "contrato-de-sublocacao-de-imovel",
    category: "Cível",
    description: "Locação secundária de imóvel com expressa anuência do proprietário original, vinculada ao contrato de locação principal."
  },
  {
    title: "Contrato de Doação de Bens Móveis",
    slug: "contrato-de-doacao-de-bens-moveis",
    category: "Cível",
    description: "Liberalidade de transferência de bens móveis (equipamentos, carros ou recursos), com ou sem encargos específicos."
  },
  {
    title: "Contrato de Confissão de Dívida com Garantia",
    slug: "contrato-de-confissao-de-divida-com-garantia",
    category: "Cível",
    description: "Reconhecimento formal de débito preexistente, estipulando nova forma de pagamento e oferecimento de garantias reais ou fidejussórias."
  },
  {
    title: "Contrato de Prestação de Serviços Médicos",
    slug: "contrato-de-prestacao-de-servicos-medicos",
    category: "Profissional",
    description: "Prestação de serviços de saúde por clínica ou profissional liberal, disciplinando sigilo médico, prontuários e limite de responsabilidade."
  },
  {
    title: "Contrato de Gestão de Tráfego Pago",
    slug: "contrato-de-gestao-de-trafego-pago",
    category: "Profissional",
    description: "Serviços de anúncios em plataformas digitais (Google Ads, Meta), fixando investimento do cliente e limitação de resultados da agência."
  },
  {
    title: "Contrato de Terceirização de Serviços",
    slug: "contrato-de-terceirizacao-de-servicos",
    category: "Trabalhista",
    description: "Contrato B2B de prestação de serviços contínuos com cessão de mão de obra sem subordinação direta do tomador."
  },
  {
    title: "Contrato de Estágio Estudantil",
    slug: "contrato-de-estagio-estudantil",
    category: "Trabalhista",
    description: "Termo de Compromisso de Estágio sob a Lei 11.788/08, envolvendo estudante, instituição de ensino e empresa concedente."
  },
  {
    title: "Contrato de Teletrabalho / Home Office",
    slug: "contrato-de-teletrabalho-home-office",
    category: "Trabalhista",
    description: "Acordo aditivo para migração para teletrabalho, regulando controle de jornada, infraestrutura e despesas tecnológicas."
  },
  {
    title: "Contrato de Vesting para Startups",
    slug: "contrato-de-vesting-para-startups",
    category: "Societário",
    description: "Opção de compra progressiva de quotas societárias vinculada ao cumprimento de metas (milestones) e tempo de casa (cliff)."
  },
  {
    title: "Acordo de Joint Venture",
    slug: "acordo-de-joint-venture",
    category: "Societário",
    description: "Acordo de cooperação econômica para empreendimento conjunto comercial, definindo governança e divisão de lucros."
  },
  {
    title: "Contrato de Prestação de Serviços de Consultoria",
    slug: "contrato-de-prestacao-de-servicos-de-consultoria",
    category: "Profissional",
    description: "Prestação de assessoria estratégica de negócios, especificando diagnóstico, entregas, horas e sigilo corporativo."
  },
  {
    title: "Contrato de Parceria com Freelancer",
    slug: "contrato-de-parceria-com-freelancer",
    category: "Profissional",
    description: "Contrato de prestação de serviços por profissional autônomo, sem exclusividade e sem formação de vínculo de emprego."
  },
  {
    title: "Contrato de Compra e Venda de Estabelecimento",
    slug: "contrato-de-compra-e-venda-de-estabelecimento",
    category: "Societário",
    description: "Contrato de trespasse para alienação de estabelecimento comercial com transferência de ativos, estoque e passivos mapeados."
  },
  {
    title: "Contrato de Representação Comercial Autônoma",
    slug: "contrato-de-representacao-comercial-autonoma",
    category: "Profissional",
    description: "Contrato sob a Lei 4.886/65, regulando a mediação de negócios por representante autônomo e regras de indenização de 1/12."
  },
  {
    title: "Contrato de Locação de Equipamentos",
    slug: "contrato-de-locacao-de-equipamentos",
    category: "Cível",
    description: "Locação de bens móveis industriais ou de tecnologia, regulando responsabilidade por quebras, furtos e manutenções."
  },
  {
    title: "Contrato de Depósito de Bens",
    slug: "contrato-de-deposito-de-bens",
    category: "Cível",
    description: "Instrumento pelo qual o depositário recebe bem móvel para guardar e conservar, obrigando-se a restituí-lo sob demanda."
  },
  {
    title: "Contrato de Cessão de Quotas de Sociedade",
    slug: "contrato-de-cessao-de-quotas-de-sociedade",
    category: "Societário",
    description: "Negócio jurídico de venda e transferência de quotas societárias de Sociedade Limitada a sócio ou a terceiro."
  },
  {
    title: "Contrato de Alienação Fiduciária de Bem",
    slug: "contrato-de-alienacao-fiduciaria-de-bem",
    category: "Cível",
    description: "Instrumento de garantia real onde o devedor transfere a propriedade fiduciária de um bem ao credor até a quitação da obrigação."
  },
  {
    title: "Contrato de Arbitragem",
    slug: "contrato-de-arbitragem",
    category: "Cível",
    description: "Convenção arbitral (cláusula compromissória ou compromisso) para submissão de litígios a Tribunal Arbitral privado."
  },
  {
    title: "Termo de Uso e Políticas de Privacidade",
    slug: "termo-de-uso-e-politica-de-privacidade",
    category: "Sigilo",
    description: "Regulação do uso de site ou aplicação e política de conformidade LGPD sobre tratamento e direitos de dados de usuários."
  },
  {
    title: "Termo de Quitação Trabalhista",
    slug: "termo-de-quitacao-trabalhista",
    category: "Trabalhista",
    description: "Quitação de obrigações decorrentes de rescisão contratual com discriminação minuciosa de parcelas pagas, sob a égide da CLT."
  },
  {
    title: "Contrato de Permuta de Imóveis",
    slug: "contrato-de-permuta-de-imoveis",
    category: "Cível",
    description: "Troca recíproca de bens imóveis, com ou sem pagamento de torna financeira (diferença de valores de mercado)."
  },
  {
    title: "Contrato de Patrocínio de Eventos",
    slug: "contrato-de-patrocinio-de-eventos",
    category: "Profissional",
    description: "Apoio financeiro de marca a evento ou projeto cultural em troca de contrapartidas de exposição publicitária e ativações."
  },
  {
    title: "Contrato de Fiança Locatícia",
    slug: "contrato-de-fianca-locaticia",
    category: "Cível",
    description: "Contrato acessório de garantia pessoal onde o fiador se obriga a adimplir as obrigações locatícias em caso de mora do locatário."
  },
  {
    title: "Contrato de Prestação de Serviços de Design",
    slug: "contrato-de-prestacao-de-servicos-de-design",
    category: "Profissional",
    description: "Criação de identidade visual ou designs institucionais, estipulando revisões limitadas, aprovações e direitos patrimoniais."
  },
  {
    title: "Contrato de Parceria Agrícola",
    slug: "contrato-de-parceria-agricola",
    category: "Cível",
    description: "Cessão temporária do uso de imóvel rural para exploração de atividade agrícola mediante partilha de riscos e frutos."
  },
  {
    title: "Contrato de Limpeza e Conservação",
    slug: "contrato-de-limpeza-e-conservacao",
    category: "Profissional",
    description: "Prestação de serviços contínuos de conservação ambiental para condomínios ou empresas, definindo insumos e frequências."
  },
  {
    title: "Acordo de Não Concorrência - Non-Compete",
    slug: "acordo-de-nao-concorrencia-non-compete",
    category: "Sigilo",
    description: "Obrigação acessória de não atuação em negócios concorrentes, fixando limite de tempo, espaço geográfico e compensação financeira."
  }
];

export async function GET(request: Request) {
  // 1. Proteger a rota do Cron contra acessos externos maliciosos
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Não autorizado', { status: 401 });
  }

  try {
    // 2. Inicializar o cliente Admin do Supabase para ter acesso total de gravação na tabela 'templates'
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 3. Buscar os templates que já existem na biblioteca (evitar duplicatas)
    const { data: existingTemplates, error: fetchError } = await supabaseAdmin
      .from('templates')
      .select('slug');

    if (fetchError) {
      throw new Error(`Erro ao buscar templates existentes: ${fetchError.message}`);
    }

    const existingSlugs = new Set(existingTemplates?.map(t => t.slug) || []);

    // 4. Encontrar o primeiro contrato da nossa lista de 50 que ainda não foi gerado
    const nextToForge = CONTRACT_TYPES.find(c => !existingSlugs.has(c.slug));

    if (!nextToForge) {
      return NextResponse.json({
        success: true,
        message: "Todos os 50 modelos da biblioteca já foram perfeitamente forjados e integrados!"
      });
    }

    console.log(`[Cron] Iniciando a forja do contrato: ${nextToForge.title} (${nextToForge.slug})`);

    // 5. Chamar a Inteligência Artificial Gemini 2.5 Flash para gerar a minuta completaça e higienizada em HTML
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Chave do Gemini (GEMINI_API_KEY) não configurada nas variáveis de ambiente.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = "gemini-2.5-flash";

    const systemInstruction = `Você é a EXTRAJUS AI, a Inteligência Artificial especializada em Engenharia Jurídica da plataforma ExtraJus. Sua função é redigir minutas de contratos e modelos profissionais completos com alta precisão técnica e terminologia formal elegante de mercado.

REGRAS DE FORMATAÇÃO ESTRITAS (OBRIGATÓRIAS):
1. Use APENAS código HTML puro no corpo da minuta. NUNCA use Markdown (sem asteriscos, sem hashtags, sem tabelas markdown).
2. Título principal deve vir centralizado no topo usando a tag h1 com o atributo data-node-text-align:
   <h1 data-node-text-align="center"><strong>[TÍTULO DO CONTRATO]</strong></h1>
3. Parágrafos de texto convencional devem usar obrigatoriamente a tag <p>.
4. Hierarquia jurídica de Cláusulas via LegalNodes (NUNCA use tags ul/ol/li):
   - O TÍTULO da cláusula deve vir SOZINHO em uma div de nível 1:
     <div data-type="legal-node" data-level="1">DO OBJETO</div>
     (Nota: NUNCA coloque textos explicativos ou misture conteúdo na mesma linha ou div do nível 1!)
   - O CONTEÚDO descritivo ou parágrafo da cláusula deve vir OBRIGATORIAMENTE na linha de baixo (um bloco separado) como nível 2:
     <div data-type="legal-node" data-level="2">O presente contrato tem como objeto...</div>
5. PROIBIÇÃO ABSOLUTA DE NUMERAÇÃO MANUAL: O editor da ExtraJus calcula e gera de forma dinâmica todas as numerações jurídicas (como 'Cláusula Primeira', '§ 1º', 'I -', 'a)', etc.).
   - NUNCA insira manualmente qualquer prefixo numérico ou literal no início das tags div ou p!
   - O texto deve começar DIRETAMENTE com a redação jurídica pura.
   - Exemplo Incorreto (NUNCA FAÇA): <div data-type="legal-node" data-level="2">Cláusula 1ª. O objeto...</div>
   - Exemplo Correto (FAÇA SEMPRE): <div data-type="legal-node" data-level="2">O presente contrato tem como objeto...</div>
6. Qualificação detalhada das partes no preâmbulo usando parágrafos normais (<p>). Insira duas linhas em branco (<p></p><p></p>) entre as partes para manter a simetria estética de luxo. NUNCA crie cláusula intitulada "DAS PARTES".
7. Primeira cláusula (nível 1) deve ser SEMPRE o Objeto do Contrato.
8. Seção de Assinaturas (Fim do Contrato): É obrigatório incluir 4 parágrafos vazios (<p></p>) antes da data para criar um espaçamento elegante. A data e os campos de assinatura devem vir centralizados (usando data-node-text-align="center"). Cada campo de assinatura deve conter a linha física exata usando caracteres normais de underline puro (__________________________________________), sem espaços e sem markdown. Siga rigorosamente este HTML:
   <p></p>
   <p></p>
   <p></p>
   <p></p>
   <p data-node-text-align="center" style="text-align: center; margin-top: 80px;">[Cidade] - [UF], [Dia] de [Mês] de [Ano].</p>
   <p></p>
   <p data-node-text-align="center" style="text-align: center;">__________________________________________</p>
   <p data-node-text-align="center" style="text-align: center;"><strong>CONTRATANTE</strong></p>
   <p></p>
   <p data-node-text-align="center" style="text-align: center;">__________________________________________</p>
   <p data-node-text-align="center" style="text-align: center;"><strong>CONTRATADO</strong></p>
9. Retorne APENAS o HTML limpo da minuta, sem blocos de código markdown ou explicações externas.`;

    const prompt = `Redija uma minuta profissional extremamente robusta, completa ("completaço"), juridicamente blindada e com excelente teor de termos técnicos para a categoria comercial brasileira de acordo com a descrição fornecida:

Título da Minuta: "${nextToForge.title}"
Descrição de Foco: "${nextToForge.description}"
Categoria do Painel: "${nextToForge.category}"

Escreva uma minuta rica, contendo pelo menos de 5 a 8 cláusulas abrangentes (Objeto, Obrigações de cada parte, Preço e Condições de Pagamento, Vigência, Regras de Rescisão, Cláusula de Sigilo/Confidencialidade, Multas Contratuais e Eleição de Foro) garantindo a proteção integral das partes de maneira altamente profissional.`;

    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: systemInstruction,
    }, { apiVersion: "v1beta" });

    // Definir limite de tempo rápido na chamada de geração do Flash para evitar timeouts na Vercel
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    if (!responseText) {
      throw new Error("Resposta da inteligência artificial retornou vazia.");
    }

    // 6. Higienizar a resposta para remover possíveis blocos markdown ```html ... ``` vazados do LLM
    let cleanHTML = responseText.trim();
    if (cleanHTML.startsWith("```html")) {
      cleanHTML = cleanHTML.replace(/^```html/, "").replace(/```$/, "").trim();
    } else if (cleanHTML.startsWith("```")) {
      cleanHTML = cleanHTML.replace(/^```/, "").replace(/```$/, "").trim();
    }

    // 7. Salvar o novo modelo gerado diretamente na tabela 'templates' do Supabase
    const { data: insertedTemplate, error: insertError } = await supabaseAdmin
      .from('templates')
      .insert({
        title: nextToForge.title,
        slug: nextToForge.slug,
        category: nextToForge.category,
        description: nextToForge.description,
        content: cleanHTML
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Erro ao salvar modelo na base de dados: ${insertError.message}`);
    }

    console.log(`[Cron] Contrato "${nextToForge.title}" forjado e inserido com sucesso na biblioteca! ID: ${insertedTemplate.id}`);

    return NextResponse.json({
      success: true,
      message: `Minuta "${nextToForge.title}" gerada com sucesso pela inteligência central e integrada ao Arsenal!`,
      template: {
        id: insertedTemplate.id,
        title: insertedTemplate.title,
        slug: insertedTemplate.slug
      }
    });

  } catch (error: any) {
    console.error("[Cron Error] Falha na execução da rotina de forja:", error);
    return NextResponse.json(
      { error: "Erro interno no ritual diário de forja automática.", details: error.message },
      { status: 500 }
    );
  }
}
