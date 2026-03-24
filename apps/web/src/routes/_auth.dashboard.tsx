import { createRoute } from '@tanstack/react-router';
import { Route as authRoute } from './_auth';

export const Route = createRoute({
  path: '/dashboard',
  getParentRoute: () => authRoute,
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">Dashboard</h1>
      <p className="text-neutral-500 dark:text-neutral-400">
        Bem-vindo ao EasyCode Framework. Selecione um modulo no menu lateral.
      </p>
    </div>
  );
}
