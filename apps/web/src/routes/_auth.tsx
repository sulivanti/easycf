import { createRoute, Outlet, redirect } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';

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
    <div className="flex h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950">
      {/* Sidebar placeholder — will be populated by module routes */}
      <aside className="hidden w-64 shrink-0 border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 lg:block">
        <div className="flex h-16 items-center border-b border-neutral-200 px-6 dark:border-neutral-800">
          <span className="text-lg font-semibold text-primary-600">EasyCode</span>
        </div>
        <nav className="p-4">{/* Navigation items injected per scope */}</nav>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-6 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="text-sm text-neutral-500">Breadcrumbs</div>
          <div className="flex items-center gap-4">{/* Theme toggle + profile widget */}</div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
