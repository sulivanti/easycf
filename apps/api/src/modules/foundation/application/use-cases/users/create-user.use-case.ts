/**
 * @contract FR-006, BR-004, BR-009, BR-012, DATA-003
 *
 * Use Case: Create User (auto-register or admin-created)
 * Atomic insert into users + content_users via transaction.
 */

import { Email } from '../../../domain/value-objects/email.vo.js';
import { DomainValidationError } from '../../../domain/errors/domain-errors.js';
import { createFoundationEvent } from '../../../domain/events/foundation-events.js';
import type {
  UserRepository,
  DomainEventRepository,
  UnitOfWork,
} from '../../ports/repositories.js';
import type { PasswordHashService, HashUtilService } from '../../ports/services.js';
import type { UserProps, UserProfile } from '../../../domain/entities/user.entity.js';

export interface CreateUserInput {
  readonly email: string;
  readonly password: string;
  readonly fullName: string;
  readonly cpfCnpj?: string;
  readonly correlationId: string;
  readonly createdBy: string | null; // null = auto-register
}

export interface CreateUserOutput {
  readonly id: string;
  readonly email: string;
  readonly codigo: string;
  readonly fullName: string;
  readonly status: string;
}

export class CreateUserUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly hashService: PasswordHashService,
    private readonly hashUtil: HashUtilService,
  ) {}

  async execute(input: CreateUserInput): Promise<CreateUserOutput> {
    const email = Email.create(input.email);

    // Check uniqueness
    const existing = await this.userRepo.findByEmail(email.value);
    if (existing) {
      throw new DomainValidationError('E-mail já cadastrado.');
    }

    const passwordHash = await this.hashService.hash(input.password);
    const id = this.hashUtil.generateUuid();
    const codigo = `usr-${id.substring(0, 8)}`;

    const userProps: UserProps = {
      id,
      codigo,
      email,
      passwordHash,
      mfaSecret: null,
      status: input.createdBy ? 'PENDING' : 'ACTIVE',
      forcePwdReset: false,
      profile: {
        fullName: input.fullName,
        cpfCnpj: input.cpfCnpj ?? null,
        avatarUrl: null,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    const profile: UserProfile = {
      fullName: input.fullName,
      cpfCnpj: input.cpfCnpj ?? null,
      avatarUrl: null,
    };

    const created = await this.uow.transaction(async (tx) => {
      const user = await this.userRepo.create(userProps, profile, tx);

      await this.eventRepo.create(
        createFoundationEvent({
          tenantId: '',
          entityType: 'user',
          entityId: id,
          eventType: 'user.created',
          payload: { codigo, email: email.value },
          correlationId: input.correlationId,
          createdBy: input.createdBy,
        }),
        tx,
      );

      return user;
    });

    return {
      id: created.id,
      email: email.value,
      codigo,
      fullName: input.fullName,
      status: created.status,
    };
  }
}
