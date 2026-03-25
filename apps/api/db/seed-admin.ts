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
} from './schema/index.js';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@ecf.local';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'Admin@ECF2026!';
const ADMIN_NAME = process.env.ADMIN_NAME ?? 'Administrador ECF';

const SCOPES = [
  'users:user:read',
  'users:user:write',
  'users:user:delete',
  'users:role:read',
  'users:role:write',
  'tenants:tenant:read',
  'tenants:tenant:write',
  'org:unit:read',
  'org:unit:write',
  'process:cycle:read',
  'process:cycle:write',
  'case:instance:read',
  'case:instance:write',
  'params:routine:read',
  'params:routine:write',
  'integration:service:read',
  'integration:service:write',
  'movement:rule:read',
  'movement:rule:write',
  'movement:approval:read',
  'movement:approval:write',
  'mcp:agent:read',
  'mcp:agent:write',
  'admin:backoffice:read',
  'admin:backoffice:write',
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

  await sql.end();

  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('  Seed concluído com sucesso!');
  console.log('═══════════════════════════════════════════');
  console.log(`  Email:    ${ADMIN_EMAIL}`);
  console.log(`  Senha:    ${ADMIN_PASSWORD}`);
  console.log(`  Tenant:   Tenant Padrão (tenant-default)`);
  console.log(`  Role:     Super Administrador (super-admin)`);
  console.log('═══════════════════════════════════════════');
  console.log('');
  console.log('⚠  Troque a senha após o primeiro login!');
}

seed().catch((err) => {
  console.error('Erro no seed:', err);
  process.exit(1);
});
