const fs = require('fs');
const path = require('path');

const vaultPath = 'd:/lilith-brain/extrajus/lilith-brain/Extrajus';

const renames = [
    { old: '01. SINAPSES DE TRÁFEGO (Ads)', temp: 'TEMP_04', new: '04. SINAPSES DE TRÁFEGO (Ads)' },
    { old: '02. ARQUITETURA E ROTAS', temp: 'TEMP_01', new: '01. ARQUITETURA E ROTAS' },
    { old: '04. ANÁLISES E RESULTADOS', temp: 'TEMP_06', new: '06. ANÁLISES E RESULTADOS' }
];

// Step 1: Move to Temp to avoid collisions
renames.forEach(r => {
    const oldPath = path.join(vaultPath, r.old);
    const tempPath = path.join(vaultPath, r.temp);
    if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, tempPath);
    }
});

// Step 2: Move to New
renames.forEach(r => {
    const tempPath = path.join(vaultPath, r.temp);
    const newPath = path.join(vaultPath, r.new);
    if (fs.existsSync(tempPath)) {
        fs.renameSync(tempPath, newPath);
        console.log(`Renomeado: ${r.old} -> ${r.new}`);
    }
});

// Update Canvas JSON
const canvasPath = path.join(vaultPath, 'Fluxo de Batalha (Extrajus).canvas');
if (fs.existsSync(canvasPath)) {
    let canvasContent = fs.readFileSync(canvasPath, 'utf8');
    
    renames.forEach(r => {
        // Need to replace the exact strings in the JSON
        // Canvas uses forward slashes.
        const oldStr = r.old + '/';
        const newStr = r.new + '/';
        // Global replace
        canvasContent = canvasContent.split(oldStr).join(newStr);
    });

    fs.writeFileSync(canvasPath, canvasContent, 'utf8');
    console.log('Canvas atualizado com os novos caminhos.');
}

// Regenerate Index
const scriptPath = path.join(vaultPath, '..', '..', 'scripts', 'generate-ai-index.js');
if (fs.existsSync(scriptPath)) {
    require('child_process').execSync('node "' + scriptPath + '"');
    console.log('Índice da IA regenerado com a nova estrutura.');
}
