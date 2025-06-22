import { TLinkHref } from '@/components/ui/Link';
import { debounce } from 'lodash';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export type TFilter = {
  key: string;
  value: string | string[] | boolean;
};

export type TSearchValue = TFilter | string | string[] | boolean | undefined;

const checkShouldDelete = (searchValue: TSearchValue) => {
  const isEmptyString = typeof searchValue === 'string' && searchValue.trim() === '';
  const isEmptyArray = Array.isArray(searchValue) && searchValue.length === 0;
  const isObjHasEmptyValue =
    typeof searchValue === 'object' &&
    !Array.isArray(searchValue) &&
    (Array.isArray(searchValue.value)
      ? !!searchValue.value.length
      : [null, undefined, ''].includes(searchValue.value as string));

  return isEmptyString || isEmptyArray || isObjHasEmptyValue || [undefined, null, ''].includes(searchValue as string);
};

const useTableFilter = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onFilter = (name: string, searchValue: TSearchValue) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set('page', '1');
    current.set('limit', current.get('limit') ?? '10');

    const shouldDelete = checkShouldDelete(searchValue);

    if (shouldDelete) {
      current.delete(name);
    } else {
      const stringValue =
        typeof searchValue === 'object' && !Array.isArray(searchValue)
          ? JSON.stringify(searchValue)
          : (searchValue || '').toString();

      current.set(name, stringValue);
    }

    router.replace(`${pathname}?${current.toString()}` as TLinkHref, { scroll: false });
  };

  const onDebouncedFilter = debounce(onFilter, 500);

  const onClearFilter = () => {
    const current = new URLSearchParams();
    current.set('page', '1');
    router.replace(`${pathname}?${current.toString()}` as TLinkHref, { scroll: false });
  };

  return { onFilter, onDebouncedFilter, onClearFilter };
};

export default useTableFilter;
