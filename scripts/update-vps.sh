#!/bin/bash
# ==============================================================
# update-vps.sh — Atualiza, builda e reinicia o ECF na VPS
# Uso: bash scripts/update-vps.sh
# ==============================================================
set -e

echo "=========================================="
echo " ECF — Atualizando VPS de teste"
echo "=========================================="

# 1. Pull do repositório
echo ""
echo "[1/4] Buscando alterações do git..."
git pull --rebase origin main

# 2. Rebuild dos containers (sem cache para pegar alterações)
echo ""
echo "[2/4] Rebuild da API..."
docker compose -f docker-compose.prod.yml build --no-cache api

echo ""
echo "[3/4] Rebuild do Web..."
docker compose -f docker-compose.prod.yml build --no-cache web

# 3. Reiniciar
echo ""
echo "[4/4] Reiniciando serviços..."
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d

echo ""
echo "=========================================="
echo " Atualização concluída!"
echo "=========================================="
