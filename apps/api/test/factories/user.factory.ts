/**
 * User data factories for tests.
 * Returns plain objects matching the DB schema / entity interfaces.
 */

import { faker } from '@faker-js/faker';

export interface UserFactoryData {
  id: string;
  codigo: string;
  email: string;
  passwordHash: string;
  mfaSecret: string | null;
  status: 'ACTIVE' | 'BLOCKED' | 'PENDING' | 'INACTIVE';
  forcePwdReset: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface ContentUserFactoryData {
  userId: string;
  fullName: string;
  cpfCnpj: string | null;
  avatarUrl: string | null;
  createdAt: Date;
  deletedAt: Date | null;
}

/**
 * Pre-hashed password for "Str0ng!Pass" using bcrypt ($2b$12$ rounds).
 * Use this in integration tests to avoid hashing overhead per test.
 */
export const KNOWN_PASSWORD = 'Str0ng!Pass';
export const KNOWN_PASSWORD_HASH = '$2b$12$LJ3m4ys10EEwqIjDhFGkCOkZ/GUxGz3o9yr8u8mLS1D7CiiO1PKIG';

export function buildUser(overrides: Partial<UserFactoryData> = {}): UserFactoryData {
  const now = new Date();
  return {
    id: faker.string.uuid(),
    codigo: faker.string.alphanumeric({ length: 6, casing: 'upper' }),
    email: faker.internet.email().toLowerCase(),
    passwordHash: KNOWN_PASSWORD_HASH,
    mfaSecret: null,
    status: 'ACTIVE',
    forcePwdReset: false,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    ...overrides,
  };
}

export function buildContentUser(
  userId: string,
  overrides: Partial<ContentUserFactoryData> = {},
): ContentUserFactoryData {
  return {
    userId,
    fullName: faker.person.fullName(),
    cpfCnpj: null,
    avatarUrl: null,
    createdAt: new Date(),
    deletedAt: null,
    ...overrides,
  };
}
