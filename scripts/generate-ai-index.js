const fs = require('fs');
const path = require('path');

const vaultPath = 'd:/lilith-brain/extrajus/lilith-brain/Extrajus';
const indexPath = path.join(vaultPath, '00. LILITH CORE.md');

function getAllMarkdownFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            // Ignore Obsidian internal folder
            if (file !== '.obsidian') {
                getAllMarkdownFiles(fullPath, fileList);
            }
        } else if (file.endsWith('.md')) {
            // Don't index the index itself
            if (file !== '00. LILITH CORE.md') {
                fileList.push(fullPath);
            }
        }
    }
    return fileList;
}

const mdFiles = getAllMarkdownFiles(vaultPath);

let indexContent = `# LILITH CORE (MAPA DO COFRE)

Este arquivo é um mapa mestre desenhado especificamente para que qualquer Inteligência Artificial ou LLM compreenda instantaneamente toda a estrutura de conhecimento armazenada neste cofre.

Se você é uma IA buscando contexto sobre o projeto **Extrajus**, procure os arquivos abaixo baseando-se em suas descrições e títulos.

---

## ESTRUTURA DE DIRETÓRIOS E ARQUIVOS

`;

// Group files by folder relative to vault
const groupedFiles = {};

mdFiles.forEach(fPath => {
    const relativePath = path.relative(vaultPath, fPath);
    const dir = path.dirname(relativePath);
    if (!groupedFiles[dir]) groupedFiles[dir] = [];
    groupedFiles[dir].push(fPath);
});

// Build the index
for (const dir in groupedFiles) {
    const folderName = dir === '.' ? 'ROOT (Raiz)' : dir;
    indexContent += `### 📂 Pasta: \`${folderName}\`\n\n`;
    
    groupedFiles[dir].forEach(fPath => {
        const filename = path.basename(fPath);
        const relativePath = path.relative(vaultPath, fPath).replace(/\\/g, '/');
        
        // Extract the first H1 or first 2 lines for context
        const fileContent = fs.readFileSync(fPath, 'utf8');
        const lines = fileContent.split('\n');
        let description = 'Sem descrição disponível.';
        
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim().startsWith('# ')) {
                description = lines[i].replace('# ', '').trim();
                break;
            }
        }

        indexContent += `- **[[${filename.replace('.md', '')}]]** (\`${relativePath}\`)\n  *Descrição / H1:* ${description}\n\n`;
    });
}

indexContent += `\n🔗 *Retornar ao núcleo:* [[00. NÚCLEO CENTRAL]]`;

fs.writeFileSync(indexPath, indexContent, 'utf8');
console.log('Índice para IA criado com sucesso na raiz do cofre!');
