const { compileWordHtml } = require('./src/utils/docx');

const title = "Teste de Contrato";
const rawHtml = `
  <h1>CONTRATO DE PRESTAÇÃO DE SERVIÇOS</h1>
  <p>Este é um parágrafo de teste.</p>
  <div class="legal-node-level-1">
    <span class="legal-node-counter"></span>
    <div class="legal-node-content">DA PRESTAÇÃO DOS SERVIÇOS</div>
  </div>
  <p>Mais um texto aqui.</p>
`;

const result = compileWordHtml(title, rawHtml);
console.log(result);
