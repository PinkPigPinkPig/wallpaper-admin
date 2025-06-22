'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactNode } from 'react';
import queryClient from './query.instance';

export function RqProvider(props: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {props.children}
      {<ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
