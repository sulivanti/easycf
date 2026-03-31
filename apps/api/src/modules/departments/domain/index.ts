/**
 * @contract DATA-002, BR-002
 *
 * Departments domain layer — central re-export.
 */

// Entities
export { Department } from './entities/department.entity.js';
export type {
  DepartmentProps,
  DepartmentStatus,
  CreateDepartmentInput,
  UpdateDepartmentInput,
} from './entities/department.entity.js';

// Events
export {
  createDepartmentEvent,
  DEPARTMENT_OPERATION_IDS,
  DEPARTMENT_UI_ACTIONS,
  DEPARTMENT_EVENT_SENSITIVITY,
} from './events/department-events.js';
export type { DepartmentEventType, DepartmentEntityType } from './events/department-events.js';

// Errors
export {
  DuplicateDepartmentCodigoError,
  DepartmentImmutableFieldError,
  DepartmentAlreadyInactiveError,
  DepartmentAlreadyActiveError,
  InvalidCorFormatError,
} from './errors/department-errors.js';
