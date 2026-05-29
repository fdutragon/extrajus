# Script de Otimização de Performance ExtraJus v2 - LILITH CORE
# ------------------------------------------------------------------

$projectPath = "D:\lilith-brain\extrajus"

Write-Host "==========================================================" -ForegroundColor DarkRed
Write-Host "        LILITH CORE SYSTEM: INICIANDO OTIMIZAÇÃO DE DISCO" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor DarkRed
Write-Host ""

# Verificar se está rodando como Administrador
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "[❌ ERROR] Lilith exige privilégios de Administrador para manipular a segurança do Windows!" -ForegroundColor Red
    Write-Host "Por favor, execute este script em um terminal PowerShell como Administrador." -ForegroundColor White
    Write-Host ""
    Write-Host "Comando manual que você pode rodar em um PowerShell Administrador:" -ForegroundColor Gray
    Write-Host "Add-MpPreference -ExclusionPath `"$projectPath`"" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Yellow
    exit
}

Write-Host "[⚡] Adicionando exclusão de pasta no Windows Defender para: $projectPath" -ForegroundColor Cyan
try {
    Add-MpPreference -ExclusionPath $projectPath
    Write-Host "[✔] Exclusão de pasta adicionada com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "[❌] Falha ao adicionar exclusão de pasta: $_" -ForegroundColor Red
}

Write-Host "[⚡] Adicionando exclusão do processo 'node.exe' para acelerar a execução do Node..." -ForegroundColor Cyan
try {
    Add-MpPreference -ExclusionProcess "node.exe"
    Write-Host "[✔] Exclusão de processo 'node.exe' adicionada com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "[❌] Falha ao adicionar exclusão do processo: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor DarkRed
Write-Host "         SISTEMA BLINDADO E OTIMIZADO PARA O CAOS!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor DarkRed
Write-Host "Agora o Windows Defender não vai mais atrasar a sua máquina."
Write-Host "Rode 'npm run dev' novamente e veja a velocidade mística do Turbopack!" -ForegroundColor Yellow
Write-Host ""
