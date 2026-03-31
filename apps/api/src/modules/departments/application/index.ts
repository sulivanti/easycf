/**
 * @contract FR-007, SEC-001-M01
 *
 * Departments application layer — central re-export.
 */

// Ports
export type {
  DepartmentRepository,
  DepartmentListFilters,
} from './ports/repositories.js';

// Use Cases — CRUD
export { CreateDepartmentUseCase } from './use-cases/create-department.use-case.js';
export type {
  CreateDepartmentInput,
  CreateDepartmentOutput,
} from './use-cases/create-department.use-case.js';

export { UpdateDepartmentUseCase } from './use-cases/update-department.use-case.js';
export type {
  UpdateDepartmentInput,
  UpdateDepartmentOutput,
} from './use-cases/update-department.use-case.js';

export { DeleteDepartmentUseCase } from './use-cases/delete-department.use-case.js';
export type { DeleteDepartmentInput } from './use-cases/delete-department.use-case.js';

export { RestoreDepartmentUseCase } from './use-cases/restore-department.use-case.js';
export type {
  RestoreDepartmentInput,
  RestoreDepartmentOutput,
} from './use-cases/restore-department.use-case.js';

// Use Cases — Query
export { GetDepartmentUseCase } from './use-cases/get-department.use-case.js';
export type {
  GetDepartmentInput,
  GetDepartmentOutput,
} from './use-cases/get-department.use-case.js';

export { ListDepartmentsUseCase } from './use-cases/list-departments.use-case.js';
export type {
  ListDepartmentsInput,
  DepartmentListItem,
  ListDepartmentsOutput,
} from './use-cases/list-departments.use-case.js';
