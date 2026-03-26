/**
 * Tenant data factories for tests.
 */

import { faker } from '@faker-js/faker';

export interface TenantFactoryData {
  id: string;
  codigo: string;
  name: string;
  status: 'ACTIVE' | 'BLOCKED' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export function buildTenant(overrides: Partial<TenantFactoryData> = {}): TenantFactoryData {
  const now = new Date();
  return {
    id: faker.string.uuid(),
    codigo: `T-${faker.string.alphanumeric({ length: 4, casing: 'upper' })}`,
    name: faker.company.name(),
    status: 'ACTIVE',
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    ...overrides,
  };
}
