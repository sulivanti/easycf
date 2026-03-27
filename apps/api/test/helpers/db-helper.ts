/**
 * Testcontainers-based PostgreSQL setup for integration tests.
 * Starts an ephemeral Postgres container and pushes the Drizzle schema.
 */

import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { execSync } from 'node:child_process';
import path from 'node:path';

let container: StartedPostgreSqlContainer | null = null;
let connectionString: string | null = null;

/**
 * Starts a PostgreSQL container and pushes the full Drizzle schema.
 * Caches the container for reuse within a single test suite.
 */
export async function setupTestDatabase(): Promise<string> {
  if (connectionString) return connectionString;

  container = await new PostgreSqlContainer('postgres:16-alpine')
    .withDatabase('ecf_test')
    .withUsername('test')
    .withPassword('test')
    .start();

  connectionString = container.getConnectionUri();

  // Push Drizzle schema directly (no migration files needed)
  const apiRoot = path.resolve(import.meta.dirname, '../..');
  execSync('npx drizzle-kit push --force', {
    env: { ...process.env, DATABASE_URL: connectionString },
    cwd: apiRoot,
    stdio: 'pipe',
    timeout: 30_000,
  });

  return connectionString;
}

/**
 * Returns the current connection string. Throws if DB not initialized.
 */
export function getTestDatabaseUrl(): string {
  if (!connectionString)
    throw new Error('Test database not initialized. Call setupTestDatabase() first.');
  return connectionString;
}

/**
 * Stops the PostgreSQL container. Call in afterAll() of the top-level suite.
 */
export async function teardownTestDatabase(): Promise<void> {
  if (container) {
    await container.stop();
    container = null;
    connectionString = null;
  }
}
