# Configurar console para UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding = [System.Text.Encoding]::UTF8

Write-Host "--- Sincronização Privada Completa ---" -ForegroundColor Cyan

# 1. Obter branch atual
$currentBranch = git branch --show-current
if ([string]::IsNullOrWhiteSpace($currentBranch)) {
    Write-Host "Falha ao determinar a branch atual." -ForegroundColor Red
    exit 1
}

Write-Host "Branch atual: $currentBranch" -ForegroundColor Yellow

# 2. Adicionar arquivos
Write-Host "Adicionando arquivos (git add .)..."
git add .

# 3. Verificar se há mudanças
$status = git status --short
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "Não há alterações para comitar." -ForegroundColor Yellow
} else {
    Write-Host "Arquivos alerados:"
    Write-Host $status
    Write-Host ""
    
    # 4. Fazer o commit
    Write-Host "Realizando commit de sincronização..."
    git commit -m "chore: sync de desenvolvimento local"
}

# 5. Fazer o push
Write-Host "Enviando para o repositório origin (git push origin $currentBranch)..."
git push origin $currentBranch

Write-Host "Sincronização privada concluída com sucesso!" -ForegroundColor Green
