'use client';

import { PropsWithChildren, ReactNode, createContext, useContext, useMemo, useState } from 'react';
import { IHeaderContext, TBreadcrumb } from './Header.types';

const HeaderContext = createContext<IHeaderContext>({
  breadcrumbs: [],
  pageTitle: '',
  setBreadcrumbs: () => [],
  setPageTitle: () => '',
});

export const HeaderProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [pageTitle, setPageTitle] = useState<ReactNode>('');
  const [breadcrumbs, setBreadcrumbs] = useState<TBreadcrumb>([]);

  const context = useMemo(
    (): IHeaderContext => ({
      setPageTitle,
      setBreadcrumbs,
      pageTitle,
      breadcrumbs,
    }),
    [setPageTitle, setBreadcrumbs, pageTitle, breadcrumbs],
  );

  return <HeaderContext.Provider value={context}>{children}</HeaderContext.Provider>;
};

export function useSetHeaderContent() {
  const context = useContext(HeaderContext);

  return context;
}

export default HeaderProvider;
