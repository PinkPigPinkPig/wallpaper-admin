import { BreadcrumbItemType, BreadcrumbSeparatorType } from 'antd/es/breadcrumb/Breadcrumb';
import { Dispatch, ReactNode, SetStateAction } from 'react';

export type TBreadcrumb = Partial<BreadcrumbItemType & BreadcrumbSeparatorType>[];

export interface IHeaderContext {
  setPageTitle: Dispatch<SetStateAction<ReactNode>>;
  setBreadcrumbs: Dispatch<SetStateAction<TBreadcrumb>>;
  pageTitle: ReactNode;
  breadcrumbs: TBreadcrumb;
}
