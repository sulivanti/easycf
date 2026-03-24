import '@testing-library/jest-dom/vitest';

// Mock crypto.randomUUID for test environments
if (!globalThis.crypto?.randomUUID) {
  Object.defineProperty(globalThis, 'crypto', {
    value: {
      ...globalThis.crypto,
      randomUUID: () => '00000000-0000-0000-0000-000000000000',
    },
  });
}
