import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      gcTime: 1000 * 60 * 15, // 15 minutes
      retry: (failureCount, error: unknown) => {
        // Don't retry on 401, 403, 404
        if (typeof error === 'object' && error !== null && 'statusCode' in error) {
          const code = (error as { statusCode: number }).statusCode;
          if (code === 401 || code === 403 || code === 404) return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
