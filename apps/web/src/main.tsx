import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { router } from './router';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
      refetchOnReconnect: true,
    },
  },
});

function getAuthFromStorage(): { user: { id: string; email: string } | null } {
  try {
    const raw = localStorage.getItem('auth_tokens');
    if (!raw) return { user: null };
    const tokens = JSON.parse(raw) as { access_token?: string };
    if (!tokens.access_token) return { user: null };
    // Decode JWT payload (base64url) to extract user info
    const payload = JSON.parse(atob(tokens.access_token.split('.')[1]));
    return { user: { id: payload.sub, email: payload.email ?? '' } };
  } catch {
    return { user: null };
  }
}

function App() {
  const auth = getAuthFromStorage();
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} context={{ queryClient, auth }} />
      </QueryClientProvider>
    </StrictMode>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
