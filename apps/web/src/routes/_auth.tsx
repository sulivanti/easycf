import { createRoute, Outlet, redirect } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { AppShell } from '@modules/backoffice-admin/components/AppShell';

export const Route = createRoute({
  id: '/_auth',
  getParentRoute: () => rootRoute,
  beforeLoad: async ({ context }) => {
    if (!context.auth?.user) {
      throw redirect({ to: '/login' });
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
