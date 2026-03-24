/**
 * @contract FR-001, BR-002, DATA-003
 *
 * Use Case: Logout
 * Revokes the current session in DB (kill-switch).
 */

import { createFoundationEvent } from '../../../domain/events/foundation-events.js';
import type { SessionRepository, DomainEventRepository } from '../../ports/repositories.js';

export interface LogoutInput {
  readonly sessionId: string;
  readonly userId: string;
  readonly correlationId: string;
}

export class LogoutUseCase {
  constructor(
    private readonly sessionRepo: SessionRepository,
    private readonly eventRepo: DomainEventRepository,
  ) {}

  async execute(input: LogoutInput): Promise<void> {
    await this.sessionRepo.revoke(input.sessionId);

    await this.eventRepo.create(
      createFoundationEvent({
        tenantId: '',
        entityType: 'session',
        entityId: input.sessionId,
        eventType: 'auth.logout',
        payload: { user_id: input.userId, session_id: input.sessionId },
        correlationId: input.correlationId,
        createdBy: input.userId,
      }),
    );
  }
}
