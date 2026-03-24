import { createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree';

export type { AuthContext, RouterContext } from './router-context';

export const router = createRouter({
  routeTree,
  context: {
    queryClient: undefined!,
    auth: { user: null },
  },
  defaultPreload: 'intent',
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
