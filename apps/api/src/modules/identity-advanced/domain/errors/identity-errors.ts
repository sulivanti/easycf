/**
 * @contract BR-001.2, BR-001.3, BR-001.4, BR-001.5, BR-001.6, BR-001.7,
 *           BR-001.8, BR-001.9, BR-001.10, BR-001.11, BR-001.12
 *
 * Domain errors for the Identity Advanced module (MOD-004).
 * Each error maps to a specific business rule violation.
 *
 * Extends Foundation DomainError for RFC 9457 Problem Details compliance.
 * The global error handler converts DomainError instances into structured
 * responses with `type`, `title`, `status`, `detail`.
 */

import { DomainError } from '../../../foundation/domain/errors/domain-errors.js';

// ---------------------------------------------------------------------------
// user_org_scopes errors
// ---------------------------------------------------------------------------

/** BR-001.2 — User already has an active PRIMARY org scope. */
export class DuplicatePrimaryScopeError extends DomainError {
  readonly type = '/problems/identity/duplicate-primary-scope';
  readonly statusHint = 409;

  constructor(userId: string) {
    super(
      `Usuário ${userId} já possui uma área principal (PRIMARY). Revogue a existente antes de criar outra.`,
    );
  }
}

/** BR-001.3 — org_unit_id points to an N5 node (tenant-linked). */
export class OrgUnitNotN1N4Error extends DomainError {
  readonly type = '/problems/identity/org-unit-not-n1-n4';
  readonly statusHint = 422;

  constructor(orgUnitId: string) {
    super(
      `Vínculos organizacionais só são permitidos em nós N1–N4. O nó ${orgUnitId} é N5 (filial).`,
    );
  }
}

/** BR-001.11 — org_unit does not exist or is INACTIVE. */
export class OrgUnitNotActiveError extends DomainError {
  readonly type = '/problems/identity/org-unit-not-active';
  readonly statusHint = 422;

  constructor(orgUnitId: string) {
    super(`O nó organizacional ${orgUnitId} não existe ou está inativo.`);
  }
}

/** Duplicate user-org_unit combination. */
export class DuplicateOrgScopeError extends DomainError {
  readonly type = '/problems/identity/duplicate-org-scope';
  readonly statusHint = 409;

  constructor(userId: string, orgUnitId: string) {
    super(`Usuário ${userId} já possui vínculo com o nó organizacional ${orgUnitId}.`);
  }
}

// ---------------------------------------------------------------------------
// access_delegations errors
// ---------------------------------------------------------------------------

/** BR-001.4 — Delegation contains prohibited scopes (:approve/:execute/:sign). */
export class ProhibitedDelegationScopeError extends DomainError {
  readonly type = '/problems/identity/prohibited-delegation-scope';
  readonly statusHint = 422;
  readonly prohibitedScopes: string[];

  constructor(prohibitedScopes: string[]) {
    super(
      `Delegações não podem incluir escopos de aprovação, execução ou assinatura: ${prohibitedScopes.join(', ')}.`,
    );
    this.prohibitedScopes = prohibitedScopes;
  }
}

/** BR-001.5 — Delegator does not own all scopes being delegated. */
export class ScopesNotOwnedError extends DomainError {
  readonly type = '/problems/identity/scopes-not-owned';
  readonly statusHint = 422;
  readonly missingScopes: string[];

  constructor(missingScopes: string[]) {
    super(`Não é possível delegar escopos que você não possui: ${missingScopes.join(', ')}.`);
    this.missingScopes = missingScopes;
  }
}

/** BR-001.6 — Attempting to re-delegate scopes obtained via delegation. */
export class ReDelegationNotAllowedError extends DomainError {
  readonly type = '/problems/identity/re-delegation-not-allowed';
  readonly statusHint = 422;

  constructor() {
    super('Escopos obtidos por delegação não podem ser re-delegados.');
  }
}

// ---------------------------------------------------------------------------
// access_shares errors
// ---------------------------------------------------------------------------

/** BR-001.7 — Self-authorization without identity:share:authorize scope. */
export class SelfAuthorizationNotAllowedError extends DomainError {
  readonly type = '/problems/identity/self-authorization-not-allowed';
  readonly statusHint = 422;

  constructor() {
    super("Sem scope 'identity:share:authorize', o autorizador deve ser diferente do solicitante.");
  }
}

/** BR-001.9 — Reason is empty or missing. */
export class ReasonRequiredError extends DomainError {
  readonly type = '/problems/identity/reason-required';
  readonly statusHint = 422;
  readonly entity: 'share' | 'delegation';

  constructor(entity: 'share' | 'delegation') {
    super(
      entity === 'share'
        ? 'O motivo do compartilhamento é obrigatório.'
        : 'O motivo da delegação é obrigatório.',
    );
    this.entity = entity;
  }
}

// ---------------------------------------------------------------------------
// Shared errors
// ---------------------------------------------------------------------------

/** BR-001.10 — valid_until is in the past. */
export class ValidUntilMustBeFutureError extends DomainError {
  readonly type = '/problems/identity/valid-until-must-be-future';
  readonly statusHint = 422;

  constructor() {
    super('A data de expiração deve ser no futuro.');
  }
}

/** BR-001.8 — valid_until is required (shares & delegations). */
export class ValidUntilRequiredError extends DomainError {
  readonly type = '/problems/identity/valid-until-required';
  readonly statusHint = 422;
  readonly entity: 'share' | 'delegation';

  constructor(entity: 'share' | 'delegation') {
    super(
      entity === 'share'
        ? 'A data de expiração é obrigatória para compartilhamentos.'
        : 'A data de expiração é obrigatória para delegações.',
    );
    this.entity = entity;
  }
}

/** BR-001.12 — Target user not found or not in same tenant. */
export class TargetUserNotFoundError extends DomainError {
  readonly type = '/problems/identity/target-user-not-found';
  readonly statusHint = 422;

  constructor() {
    super('O usuário destinatário não foi encontrado ou não pertence ao tenant.');
  }
}

/** Grant/share/delegation is already revoked or expired. */
export class AlreadyRevokedOrExpiredError extends DomainError {
  readonly type = '/problems/identity/already-revoked-or-expired';
  readonly statusHint = 409;

  constructor(entity: string) {
    super(`O registro ${entity} já foi revogado ou expirado.`);
  }
}
