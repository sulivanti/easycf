-- Migration: fix_scope_hyphens
-- Ref: DATA-000-C04, spec-fix-scope-hyphen-persistent-regression
-- Purpose: Rename all scopes containing hyphens to use underscores.
-- Idempotent: safe to run multiple times (no-op if no hyphens exist).

UPDATE role_permissions
SET scope = REPLACE(scope, '-', '_')
WHERE scope LIKE '%-%';
