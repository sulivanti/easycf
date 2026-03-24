import { createRoute, redirect } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';

export const Route = createRoute({
  path: '/login',
  getParentRoute: () => rootRoute,
  beforeLoad: async ({ context }) => {
    if (context.auth?.user) {
      throw redirect({ to: '/dashboard' });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950">
      <div className="w-full max-w-sm space-y-6 rounded-xl bg-white p-8 shadow-lg dark:bg-neutral-900">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            EasyCode
          </h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Entre com suas credenciais
          </p>
        </div>
        <form className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800"
              placeholder="seu@email.com"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
