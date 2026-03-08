# Configurar console para UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding = [System.Text.Encoding]::UTF8

Write-Host "--- Sincronização Pública do Template ---" -ForegroundColor Cyan
Write-Host "Este script sincroniza o monorepo privado com o repositório público (template)."

# Aqui, as lógicas de sync público dependem da estrutura do seu release.
# O padrão no EasyCodeFramework parece usar `npx degit` ou um push para um repósitorio diferente (ex: origin-public)
# Assumindo que você tem um remote configurado como 'public' ou faz uma extração específica.

# 1. Definir os remotes/branches
$currentBranch = git branch --show-current
$publicRemote = "public" # Confirme se o nome do remote público é este

Write-Host "Branch atual: $currentBranch" -ForegroundColor Yellow

# Verificar se remote publico existe
$remotes = git remote
if ($remotes -notcontains $publicRemote) {
    Write-Host "ATENÇÃO: Não foi encontrado um remote chamado '$publicRemote'." -ForegroundColor Red
    Write-Host "Por favor, configure o remote público antes de usar este script:"
    Write-Host "git remote add $publicRemote <URL_DO_REPO_PUBLICO>"
    exit 1
}

# 2. Preparar e enviar as alterações
Write-Host "Preparando para enviar alterações (git push $publicRemote $currentBranch)..."
# Exemplo básico de push da main para a main pública (ou master)
# Se houver um processo de build (remover segredos antes), ele deve ocorrer aqui.
git push $publicRemote $currentBranch

Write-Host "Sincronização pública concluída com sucesso! Verifique o repositório destino." -ForegroundColor Green
