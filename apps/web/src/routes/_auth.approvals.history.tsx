import { createRoute } from '@tanstack/react-router';
import { Route as authRoute } from './_auth';
import { HistoryPage } from '@modules/movement-approval/pages/history/HistoryPage';

export const Route = createRoute({
  path: '/approvals/history',
  getParentRoute: () => authRoute,
  component: HistoryPage,
});
