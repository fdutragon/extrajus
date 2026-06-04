const { execFileSync } = require('child_process');

try {
    console.log("Executando CLI do Obsidian...");
    const out = execFileSync('obsidian', [
        'file:create',
        'path=01. SINAPSES DE TRÁFEGO (Ads)/Teste_CLI_Lilith.md',
        'content=# Teste do Cérebro\n\nIsso foi injetado pela Lilith via CLI oficial.',
        'overwrite',
        'open'
    ], { encoding: 'utf8' });
    console.log("Saída:", out);
    console.log("Sucesso!");
} catch (e) {
    console.error("Erro ao usar CLI:", e.message);
    if (e.stdout) console.log("STDOUT:", e.stdout);
    if (e.stderr) console.log("STDERR:", e.stderr);
}
