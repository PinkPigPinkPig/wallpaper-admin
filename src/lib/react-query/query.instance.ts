import { QueryClient } from '@tanstack/react-query';
import { showToast } from '@/lib/error/toast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
    mutations: {
      onError: (error: unknown) => {
        if (error instanceof Error && error.name !== 'AbortError') {
          showToast('server', error.message || 'An error occurred. Please try again.');
        }
      },
    },
  },
});

export default queryClient;
