// Schemas MOD-000 — Foundation (DATA-000)
// Ordem respeitada por dependências de FK
export * from './branches.schema.js';      // primeiro: sem FK externas
export * from './users.schema.js';          // FK → branches
export * from './roles.schema.js';          // FK → branches
export * from './permissions.schema.js';    // sem FK externas
export * from './user-sessions.schema.js';  // FK → users
export * from './tenant-users.schema.js';   // FK → users, branches, roles
export * from './password-reset-tokens.schema.js'; // FK → users

// Schema legado (mantido para compatibilidade)
export * from './tenants.schema.js';
