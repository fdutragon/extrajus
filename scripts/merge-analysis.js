const fs = require('fs');
const path = require('path');

const vaultPath = 'd:/lilith-brain/extrajus/lilith-brain/Extrajus';
const folder5 = path.join(vaultPath, '05. ANÁLISES E RESULTADOS');
const folder6 = path.join(vaultPath, '06. ANÁLISES E RESULTADOS');

// Create folder6 if it somehow doesn't exist
if (!fs.existsSync(folder6)) {
    fs.mkdirSync(folder6);
}

// Move all files from 05 to 06
if (fs.existsSync(folder5)) {
    const files = fs.readdirSync(folder5);
    for (const file of files) {
        fs.renameSync(path.join(folder5, file), path.join(folder6, file));
        console.log(`Movido: ${file} para a pasta 06`);
    }
    // Remove the empty folder 05
    fs.rmdirSync(folder5);
    console.log('Pasta 05. ANÁLISES E RESULTADOS deletada.');
}

// Update the AI index
const scriptPath = path.join(vaultPath, '..', '..', 'scripts', 'generate-ai-index.js');
if (fs.existsSync(scriptPath)) {
    require('child_process').execSync('node "' + scriptPath + '"');
    console.log('Índice da IA regenerado com a nova estrutura unificada.');
}
