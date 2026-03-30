-- =============================================================================
-- Fix: Adicionar colunas cadastrais + criar org unit N1 + vincular tenant
-- Executar em produção via:
--   docker compose -f docker-compose.prod.yml exec postgres psql -U admin -d ecf -f /fix-prod-org-unit.sql
-- Ou copiar para dentro do container primeiro:
--   docker cp apps/api/db/fix-prod-org-unit.sql ecf-postgres:/fix-prod-org-unit.sql
--   docker compose -f docker-compose.prod.yml exec postgres psql -U admin -d ecf -f /fix-prod-org-unit.sql
-- =============================================================================

-- 1. Adicionar colunas cadastrais (DATA-001-M01) se não existirem
ALTER TABLE org_units ADD COLUMN IF NOT EXISTS cnpj VARCHAR(18);
ALTER TABLE org_units ADD COLUMN IF NOT EXISTS razao_social VARCHAR(300);
ALTER TABLE org_units ADD COLUMN IF NOT EXISTS filial VARCHAR(100);
ALTER TABLE org_units ADD COLUMN IF NOT EXISTS responsavel VARCHAR(200);
ALTER TABLE org_units ADD COLUMN IF NOT EXISTS telefone VARCHAR(20);
ALTER TABLE org_units ADD COLUMN IF NOT EXISTS email_contato VARCHAR(254);

-- 2. Criar org unit N1 + vincular tenant (idempotente)
DO $$
DECLARE
  v_tenant_id UUID;
  v_admin_id UUID;
  v_org_unit_id UUID := gen_random_uuid();
BEGIN
  -- Verificar se já existe N1
  IF EXISTS (SELECT 1 FROM org_units WHERE nivel = 1) THEN
    RAISE NOTICE 'Org unit N1 já existe. Pulando.';
    RETURN;
  END IF;

  SELECT id INTO v_tenant_id FROM tenants LIMIT 1;
  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Nenhum tenant encontrado. Execute seed-admin primeiro.';
  END IF;

  SELECT id INTO v_admin_id FROM users WHERE status = 'ACTIVE' LIMIT 1;
  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'Nenhum usuário ativo encontrado. Execute seed-admin primeiro.';
  END IF;

  INSERT INTO org_units (id, codigo, nome, descricao, nivel, parent_id, status, created_by)
  VALUES (v_org_unit_id, 'GRUPO-A1', 'Grupo A1', 'Unidade organizacional raiz', 1, NULL, 'ACTIVE', v_admin_id);

  INSERT INTO org_unit_tenant_links (id, org_unit_id, tenant_id, created_by)
  VALUES (gen_random_uuid(), v_org_unit_id, v_tenant_id, v_admin_id);

  RAISE NOTICE 'OK: Org unit N1 "Grupo A1" criada e tenant vinculado!';
END $$;
