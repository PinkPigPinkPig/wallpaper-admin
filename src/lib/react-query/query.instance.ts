import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // For one minute
      retry: 1, // Retry only once
    },
  },
});

export default queryClient;
