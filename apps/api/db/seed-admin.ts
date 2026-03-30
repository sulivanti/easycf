/**
 * Seed script — cria admin inicial + tenant + role com todas as permissões.
 *
 * Uso:
 *   npx tsx db/seed-admin.ts
 *   (ou via Docker: docker compose exec api npx tsx db/seed-admin.ts)
 *
 * Variáveis de ambiente:
 *   DATABASE_URL     — conexão PostgreSQL (obrigatória)
 *   ADMIN_EMAIL      — email do admin (default: admin@ecf.local)
 *   ADMIN_PASSWORD   — senha do admin (default: Admin@ECF2026!)
 *   ADMIN_NAME       — nome completo (default: Administrador ECF)
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { hash } from 'bcrypt';
import {
  users,
  contentUsers,
  tenants,
  roles,
  rolePermissions,
  tenantUsers,
  orgUnits,
  orgUnitTenantLinks,
} from './schema/index.js';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@ecf.local';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'Admin@ECF2026!';
const ADMIN_NAME = process.env.ADMIN_NAME ?? 'Administrador ECF';

/**
 * Scopes do catálogo canônico DOC-FND-000 §2.2.
 * DEVE ser mantido em sincronia com o catálogo — ver FR-000-C01, DOC-PADRAO-001-C01.
 */
const SCOPES = [
  // ── MOD-000 Foundation ──
  'users:user:read',
  'users:user:write',
  'users:user:delete',
  'users:user:import',
  'users:user:export',
  'users:user:comment',
  'users:role:read',
  'users:role:write',
  'tenants:branch:read',
  'tenants:branch:write',
  'system:audit:read',
  'system:audit:sensitive',
  'storage:file:upload',
  'storage:file:read',
  // ── MOD-003 Estrutura Organizacional ──
  'org:unit:read',
  'org:unit:write',
  'org:unit:delete',
  // ── MOD-004 Identidade Avançada ──
  'identity:org_scope:read',
  'identity:org_scope:write',
  'identity:share:read',
  'identity:share:write',
  'identity:share:revoke',
  'identity:share:authorize',
  'identity:delegation:read',
  'identity:delegation:write',
  // ── MOD-005 Modelagem de Processos ──
  'process:cycle:read',
  'process:cycle:write',
  'process:cycle:publish',
  'process:cycle:delete',
  // ── MOD-006 Execução de Casos (DOC-FND-000-M01, M02) ──
  'process:case:read',
  'process:case:write',
  'process:case:cancel',
  'process:case:gate_resolve',
  'process:case:gate_waive',
  'process:case:assign',
  'process:case:reopen',
  // ── MOD-007 Parametrização Contextual ──
  'param:framer:read',
  'param:framer:write',
  'param:framer:delete',
  'param:routine:read',
  'param:routine:write',
  'param:routine:publish',
  'param:engine:evaluate',
  // ── MOD-008 Integração Protheus ──
  'integration:service:read',
  'integration:service:write',
  'integration:routine:write',
  'integration:execute',
  'integration:log:read',
  'integration:log:reprocess',
  // ── MOD-009 Movimentos sob Aprovação (DOC-FND-000-M03) ──
  'approval:rule:read',
  'approval:rule:write',
  'approval:engine:evaluate',
  'approval:movement:read',
  'approval:movement:write',
  'approval:decide',
  'approval:override',
  // ── MOD-010 MCP e Automação (DOC-FND-000-M04) ──
  'mcp:agent:read',
  'mcp:agent:write',
  'mcp:agent:revoke',
  'mcp:agent:phase2-enable',
  'mcp:action:read',
  'mcp:action:write',
  'mcp:log:read',
];

async function seed() {
  const sql = postgres(DATABASE_URL!);
  const db = drizzle(sql);

  // Check if admin already exists
  const existing = await db.select().from(users).where(eq(users.email, ADMIN_EMAIL)).limit(1);
  if (existing.length > 0) {
    console.log(`Admin "${ADMIN_EMAIL}" já existe. Pulando seed.`);
    await sql.end();
    return;
  }

  const adminId = randomUUID();
  const tenantId = randomUUID();
  const roleId = randomUUID();
  const passwordHash = await hash(ADMIN_PASSWORD, 12);

  console.log('Criando tenant padrão...');
  await db.insert(tenants).values({
    id: tenantId,
    codigo: 'tenant-default',
    name: 'Tenant Padrão',
    status: 'ACTIVE',
  });

  console.log('Criando role super-admin...');
  await db.insert(roles).values({
    id: roleId,
    codigo: 'super-admin',
    name: 'Super Administrador',
    description: 'Acesso total a todos os módulos',
    status: 'ACTIVE',
  });

  console.log(`Atribuindo ${SCOPES.length} permissões...`);
  await db.insert(rolePermissions).values(
    SCOPES.map((scope) => ({
      id: randomUUID(),
      roleId,
      scope,
    })),
  );

  console.log('Criando usuário admin...');
  await db.insert(users).values({
    id: adminId,
    codigo: `usr-${adminId.substring(0, 8)}`,
    email: ADMIN_EMAIL,
    passwordHash,
    status: 'ACTIVE',
    forcePwdReset: false,
  });

  await db.insert(contentUsers).values({
    userId: adminId,
    fullName: ADMIN_NAME,
  });

  console.log('Vinculando admin ao tenant...');
  await db.insert(tenantUsers).values({
    userId: adminId,
    tenantId,
    roleId,
    status: 'ACTIVE',
  });

  console.log('Criando org unit N1 raiz...');
  const orgUnitId = randomUUID();
  await db.insert(orgUnits).values({
    id: orgUnitId,
    codigo: 'GRUPO-A1',
    nome: 'Grupo A1',
    descricao: 'Unidade organizacional raiz',
    nivel: 1,
    parentId: null,
    status: 'ACTIVE',
    createdBy: adminId,
  });

  console.log('Vinculando tenant à org unit N1...');
  await db.insert(orgUnitTenantLinks).values({
    id: randomUUID(),
    orgUnitId,
    tenantId,
    createdBy: adminId,
  });

  await sql.end();

  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('  Seed concluído com sucesso!');
  console.log('═══════════════════════════════════════════');
  console.log(`  Email:    ${ADMIN_EMAIL}`);
  console.log(`  Senha:    ${ADMIN_PASSWORD}`);
  console.log(`  Tenant:   Tenant Padrão (tenant-default)`);
  console.log(`  Role:     Super Administrador (super-admin)`);
  console.log(`  Org Unit: Grupo A1 (GRUPO-A1) — N1 raiz`);
  console.log('═══════════════════════════════════════════');
  console.log('');
  console.log('⚠  Troque a senha após o primeiro login!');
}

seed().catch((err) => {
  console.error('Erro no seed:', err);
  process.exit(1);
});
