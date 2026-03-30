/**
 * Fix script — cria org unit N1 raiz e vincula ao tenant existente.
 *
 * Para ambientes onde o seed-admin.ts já rodou sem a org unit.
 * Idempotente: verifica se já existe org unit com nivel=1 antes de criar.
 *
 * Uso:
 *   npx tsx db/fix-seed-org-unit.ts
 *   (ou via Docker: docker compose exec api npx tsx db/fix-seed-org-unit.ts)
 *
 * Variáveis de ambiente:
 *   DATABASE_URL — conexão PostgreSQL (obrigatória)
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { tenants, users, orgUnits, orgUnitTenantLinks } from './schema/index.js';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

async function fix() {
  const sql = postgres(DATABASE_URL!);
  const db = drizzle(sql);

  // Verificar se já existe org unit N1
  const existingN1 = await db
    .select()
    .from(orgUnits)
    .where(eq(orgUnits.nivel, 1))
    .limit(1);

  if (existingN1.length > 0) {
    console.log(`Org unit N1 já existe: "${existingN1[0].nome}" (${existingN1[0].codigo}). Pulando.`);
    await sql.end();
    return;
  }

  // Buscar tenant existente
  const existingTenants = await db.select().from(tenants).limit(1);
  if (existingTenants.length === 0) {
    console.error('Nenhum tenant encontrado. Execute seed-admin.ts primeiro.');
    await sql.end();
    process.exit(1);
  }
  const tenant = existingTenants[0];

  // Buscar admin user (primeiro user ativo) para created_by
  const existingUsers = await db
    .select()
    .from(users)
    .where(eq(users.status, 'ACTIVE'))
    .limit(1);

  if (existingUsers.length === 0) {
    console.error('Nenhum usuário ativo encontrado. Execute seed-admin.ts primeiro.');
    await sql.end();
    process.exit(1);
  }
  const adminUser = existingUsers[0];

  // Criar org unit N1 raiz
  const orgUnitId = randomUUID();
  console.log('Criando org unit N1 raiz...');
  await db.insert(orgUnits).values({
    id: orgUnitId,
    codigo: 'GRUPO-A1',
    nome: 'Grupo A1',
    descricao: 'Unidade organizacional raiz',
    nivel: 1,
    parentId: null,
    status: 'ACTIVE',
    createdBy: adminUser.id,
  });

  // Vincular tenant à org unit
  console.log(`Vinculando tenant "${tenant.name}" à org unit N1...`);
  await db.insert(orgUnitTenantLinks).values({
    id: randomUUID(),
    orgUnitId,
    tenantId: tenant.id,
    createdBy: adminUser.id,
  });

  await sql.end();

  console.log('');
  console.log('Fix concluído com sucesso!');
  console.log(`  Org Unit: Grupo A1 (GRUPO-A1) — N1 raiz`);
  console.log(`  Tenant:   ${tenant.name} (${tenant.codigo})`);
}

fix().catch((err) => {
  console.error('Erro no fix:', err);
  process.exit(1);
});
