# Configurar console para UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding = [System.Text.Encoding]::UTF8

Write-Host "--- Sincronizacao Publica do Template ---" -ForegroundColor Cyan
Write-Host "Navegando para o diretorio do repositorio publico (dist/easycf)..."

if (-Not (Test-Path "dist/easycf")) {
    Write-Host "Erro: O diretorio dist/easycf nao foi encontrado. Voce ja rodou o build/release?" -ForegroundColor Red
    exit 1
}

# Muda para o diretorio do template publico
Push-Location dist/easycf

Write-Host "Enviando commits para o repositorio publico..."
git push

Write-Host "Enviando tags para o repositorio publico..."
git push --tags

# Retorna ao diretorio anterior
Pop-Location

Write-Host "Sincronizacao publica concluida com sucesso!" -ForegroundColor Green
