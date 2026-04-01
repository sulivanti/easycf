/**
 * Seed script — cria admin inicial + tenant + role com todas as permissões.
 *
 * Uso:
 *   pnpm -F @easycode/api db:seed
 *   (ou via Docker: docker compose exec api npx tsx db/seed-admin.ts)
 *
 * Variáveis de ambiente:
 *   DATABASE_URL     — conexão PostgreSQL (obrigatória)
 *   ADMIN_EMAIL      — email do admin (default: admin@ecf.local)
 *   ADMIN_PASSWORD   — senha do admin (default: Admin@ECF2026!)
 *   ADMIN_NAME       — nome completo (default: Administrador ECF)
 *
 * O script carrega automaticamente ../../.env (raiz do monorepo) quando
 * DATABASE_URL não está definida no ambiente (ex: execução local sem Docker).
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Auto-load .env from monorepo root when DATABASE_URL is not set
if (!process.env.DATABASE_URL) {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const envPath = resolve(__dirname, '../../.env');
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, 'utf8').split('\n')) {
      const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)$/);
      if (match) {
        const key = match[1]!.trim();
        const val = match[2]!.trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
}

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

// Fail-safe: não permitir credenciais default em produção
if (ADMIN_PASSWORD === 'Admin@ECF2026!' && process.env.NODE_ENV === 'production') {
  console.error(
    '❌ ADMIN_PASSWORD default não é permitido em produção. Defina a variável de ambiente.',
  );
  process.exit(1);
}

import { SCOPES } from './scopes-catalog.js';

// FR-000-C11: Validar todos os scopes contra o VO antes de qualquer DB operation
import { Scope } from '../src/modules/foundation/domain/value-objects/scope.vo.js';

const invalidScopes: string[] = [];
for (const s of SCOPES) {
  try {
    Scope.create(s);
  } catch {
    invalidScopes.push(s);
  }
}
if (invalidScopes.length > 0) {
  console.error(`❌ ${invalidScopes.length} scope(s) inválido(s) no seed:`);
  invalidScopes.forEach((s) => console.error(`   - "${s}"`));
  console.error('Corrija no array SCOPES antes de executar o seed.');
  process.exit(1);
}

async function syncSuperAdminPermissions(db: ReturnType<typeof drizzle>) {
  // Busca role super-admin
  const [superAdminRole] = await db
    .select()
    .from(roles)
    .where(eq(roles.codigo, 'super-admin'))
    .limit(1);

  if (!superAdminRole) {
    // Role não existe — cria role + todas as permissões
    const roleId = randomUUID();
    console.log('Role super-admin não encontrada. Criando...');
    await db.insert(roles).values({
      id: roleId,
      codigo: 'super-admin',
      name: 'Super Administrador',
      description: 'Acesso total a todos os módulos',
      status: 'ACTIVE',
    });

    await db.insert(rolePermissions).values(
      SCOPES.map((scope) => ({
        id: randomUUID(),
        roleId,
        scope,
      })),
    );
    console.log(`Criadas ${SCOPES.length} permissões para role super-admin.`);
    return;
  }

  // Fix scopes com nomes antigos (ex: hífens → underscores) — FR-000-C10
  const RENAMES: Record<string, string> = {
    'mcp:agent:phase2-enable': 'mcp:agent:phase2_enable',
  };

  for (const [oldScope, newScope] of Object.entries(RENAMES)) {
    const [existing] = await db
      .select({ id: rolePermissions.id })
      .from(rolePermissions)
      .where(eq(rolePermissions.scope, oldScope))
      .limit(1);

    if (existing) {
      await db
        .update(rolePermissions)
        .set({ scope: newScope })
        .where(eq(rolePermissions.scope, oldScope));
      console.log(`Scope renomeado: ${oldScope} → ${newScope}`);
    }
  }

  // Role existe — busca permissões atuais e calcula diff
  const existingPerms = await db
    .select({ scope: rolePermissions.scope })
    .from(rolePermissions)
    .where(eq(rolePermissions.roleId, superAdminRole.id));

  const existingScopes = new Set(existingPerms.map((p) => p.scope));
  const missingScopes = SCOPES.filter((s) => !existingScopes.has(s));

  if (missingScopes.length === 0) {
    console.log('Todas as permissões já estão sincronizadas.');
    return;
  }

  await db.insert(rolePermissions).values(
    missingScopes.map((scope) => ({
      id: randomUUID(),
      roleId: superAdminRole.id,
      scope,
    })),
  );
  console.log(
    `Sincronizados ${missingScopes.length} novos scopes para super-admin: ${missingScopes.join(', ')}`,
  );
}

async function seed() {
  const sql = postgres(DATABASE_URL!);
  const db = drizzle(sql);

  // Check if admin already exists
  const existing = await db.select().from(users).where(eq(users.email, ADMIN_EMAIL)).limit(1);
  if (existing.length > 0) {
    console.log(`Admin "${ADMIN_EMAIL}" já existe. Sincronizando permissões...`);
    await syncSuperAdminPermissions(db);
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

  // BR-006: Criar hierarquia completa N1→N2→N3→N4 e vincular tenant ao N4
  console.log('Criando hierarquia organizacional N1→N2→N3→N4...');
  const n1Id = randomUUID();
  const n2Id = randomUUID();
  const n3Id = randomUUID();
  const n4Id = randomUUID();

  await db.insert(orgUnits).values([
    {
      id: n1Id,
      codigo: 'GRUPO-A1',
      nome: 'Grupo A1',
      descricao: 'Grupo corporativo raiz',
      nivel: 1,
      parentId: null,
      status: 'ACTIVE',
      createdBy: adminId,
    },
    {
      id: n2Id,
      codigo: 'UNIDADE-A1',
      nome: 'Unidade A1',
      descricao: 'Unidade regional',
      nivel: 2,
      parentId: n1Id,
      status: 'ACTIVE',
      createdBy: adminId,
    },
    {
      id: n3Id,
      codigo: 'MACRO-A1',
      nome: 'Macroárea A1',
      descricao: 'Macroárea operacional',
      nivel: 3,
      parentId: n2Id,
      status: 'ACTIVE',
      createdBy: adminId,
    },
    {
      id: n4Id,
      codigo: 'SUB-A1',
      nome: 'Subunidade A1',
      descricao: 'Subunidade organizacional',
      nivel: 4,
      parentId: n3Id,
      status: 'ACTIVE',
      createdBy: adminId,
    },
  ]);

  console.log('Vinculando tenant à org unit N4 (BR-006)...');
  await db.insert(orgUnitTenantLinks).values({
    id: randomUUID(),
    orgUnitId: n4Id,
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
  console.log(`  Org Unit: GRUPO-A1 → UNIDADE-A1 → MACRO-A1 → SUB-A1 (N1→N4)`);
  console.log('═══════════════════════════════════════════');
  console.log('');
  console.log('⚠  Troque a senha após o primeiro login!');
}

seed().catch((err) => {
  console.error('Erro no seed:', err);
  process.exit(1);
});
