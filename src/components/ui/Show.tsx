import { ReactNode, useRef } from 'react';

interface IShowProps<T> {
  when: T | undefined | null | false;
  fallback?: ReactNode | null;
  children: ReactNode;
  persist?: boolean;
}

export default function Show<T>({ children, fallback = null, when, persist }: IShowProps<T>) {
  const hasRendered = useRef(false);

  if (when || (persist && hasRendered.current)) {
    hasRendered.current = true;
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
