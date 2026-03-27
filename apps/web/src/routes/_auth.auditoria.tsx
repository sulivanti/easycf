import { createRoute } from '@tanstack/react-router';
import { Route as authRoute } from './_auth';
import { AuditLogPage } from '@modules/audit/pages/AuditLogPage';

export const Route = createRoute({
  path: '/auditoria',
  getParentRoute: () => authRoute,
  component: AuditLogPage,
});
