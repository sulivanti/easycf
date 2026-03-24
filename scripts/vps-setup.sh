#!/usr/bin/env bash
# =============================================================================
# vps-setup.sh — Setup EasyCodeFramework on VPS srv1297197
# Usage: ssh root@srv1297197 'bash -s' < scripts/vps-setup.sh
# =============================================================================
set -euo pipefail

PROJECT_DIR="/opt/dev/MarkCCo/projects/EasyCodeFramework"
REPO_URL="https://github.com/sulivanti/EasyCodeFramework.git"

echo "=== [1/5] Installing Docker (if not present) ==="
if ! command -v docker &>/dev/null; then
  curl -fsSL https://get.docker.com | sh
  systemctl enable --now docker
  echo "Docker installed."
else
  echo "Docker already installed: $(docker --version)"
fi

echo "=== [2/5] Cloning repo ==="
mkdir -p "$(dirname "$PROJECT_DIR")"
if [ -d "$PROJECT_DIR/.git" ]; then
  echo "Repo already cloned. Pulling latest..."
  cd "$PROJECT_DIR"
  git pull --ff-only
else
  git clone "$REPO_URL" "$PROJECT_DIR"
  cd "$PROJECT_DIR"
fi

echo "=== [3/5] Creating .env from .env.example ==="
if [ ! -f .env ]; then
  cp .env.example .env

  # Generate secrets
  JWT_SECRET=$(openssl rand -hex 48)
  PG_PASSWORD=$(openssl rand -hex 24)

  # Apply production values
  sed -i "s|NODE_ENV=development|NODE_ENV=production|" .env
  sed -i "s|PROJECT_NAME=nome|PROJECT_NAME=ecf|" .env
  sed -i "s|COMPOSE_PROJECT_NAME=nome|COMPOSE_PROJECT_NAME=ecf|" .env
  sed -i "s|POSTGRES_PASSWORD=<PREENCHER>|POSTGRES_PASSWORD=$PG_PASSWORD|" .env
  sed -i "s|POSTGRES_DB=meu_banco|POSTGRES_DB=ecf|" .env
  sed -i "s|DATABASE_URL=postgresql://admin:<PREENCHER>@localhost:5432/meu_banco|DATABASE_URL=postgresql://admin:$PG_PASSWORD@postgres:5432/ecf|" .env
  sed -i "s|REDIS_URL=redis://localhost:6379|REDIS_URL=redis://redis:6379|" .env
  sed -i "s|JWT_SECRET=<PREENCHER-min-32-chars>|JWT_SECRET=$JWT_SECRET|" .env
  sed -i "s|API_BASE_URL=http://localhost:3000|API_BASE_URL=https://ecf.jetme.com.br|" .env
  sed -i "s|FRONTEND_URL=http://localhost:5173|FRONTEND_URL=https://ecf.jetme.com.br|" .env
  sed -i "s|CORS_ORIGIN=http://localhost:5173|CORS_ORIGIN=https://ecf.jetme.com.br|" .env

  echo ".env created with generated secrets."
  echo "⚠  Review .env and update RESEND_API_KEY, SSO keys, etc. before deploying."
else
  echo ".env already exists. Skipping."
fi

echo "=== [4/5] Building and starting containers ==="
docker compose -f docker-compose.prod.yml up -d --build

echo "=== [5/5] Running database migrations ==="
echo "Waiting for API to be ready..."
sleep 5
docker compose -f docker-compose.prod.yml exec api npx drizzle-kit push

echo ""
echo "✅ Deploy complete!"
echo "   API:  http://localhost:3000"
echo "   Web:  http://localhost:8080"
echo ""
echo "Next steps:"
echo "  1. Review .env file: nano $PROJECT_DIR/.env"
echo "  2. Configure Nginx for ecf.jetme.com.br (see nginx block below)"
echo "  3. Verify: curl http://localhost:3000/api/v1/info"
echo ""
echo "Nginx config to add to /etc/nginx/sites-available/ecf.jetme.com.br:"
cat <<'NGINX'

location /api/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

NGINX
