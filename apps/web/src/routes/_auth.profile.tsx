import { createRoute } from '@tanstack/react-router';
import { Route as authRoute } from './_auth';
import { ProfilePage } from '@modules/foundation/pages/profile/ProfilePage';

export const Route = createRoute({
  path: '/profile',
  getParentRoute: () => authRoute,
  component: ProfilePage,
});
