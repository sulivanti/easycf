/**
 * Session data factories for tests.
 */

import { faker } from '@faker-js/faker';

export interface SessionFactoryData {
  id: string;
  userId: string;
  isRevoked: boolean;
  deviceFp: string | null;
  rememberMe: boolean;
  expiresAt: Date;
  createdAt: Date;
  revokedAt: Date | null;
}

export function buildSession(overrides: Partial<SessionFactoryData> = {}): SessionFactoryData {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 12 * 60 * 60 * 1000); // 12h TTL

  return {
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    isRevoked: false,
    deviceFp: null,
    rememberMe: false,
    expiresAt,
    createdAt: now,
    revokedAt: null,
    ...overrides,
  };
}
