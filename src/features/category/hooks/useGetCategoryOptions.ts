import { TListResponse } from '@/data/type';
import { DefaultOptionType } from 'antd/es/select';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { debounce, uniqBy } from 'lodash';
import CategoryServices from '../services';
import { CATEGORY, TCategory } from '../data/type';

type TQuery = Record<string, unknown>;
type TConfig = {
  enabled?: boolean;
};

const useGetCategoryOptions = (query: TQuery, config: TConfig = { enabled: true }) => {
  const [options, setOptions] = useState<DefaultOptionType[]>([]);
  const hasNextPage = useRef(false);
  const search = useRef<null | URLSearchParams>(null);

  const onSuccess = (data: TListResponse<TCategory[]>) => {
    hasNextPage.current = data.data ? data.data.length === 100 : false;

    const options: DefaultOptionType[] = (data.data || []).map((item) => ({
      value: item.id,
      label: item.name,
    }));

    setOptions((prev) => uniqBy(prev.concat(options), 'value'));
  };

  const qs = useMemo(() => {
    if (!search.current && config.enabled) {
      search.current = new URLSearchParams({ ...query, page: '1', limit: '100' });
    }
    return search.current?.toString();
  }, [config.enabled, query]);

  const { data, isLoading, isFetching, isFetched, isSuccess, refetch } = useQuery({
    queryKey: [CATEGORY.LIST, qs],
    queryFn: () => CategoryServices.getCategoryList(qs ?? ''),
    enabled: !!qs && config.enabled,
    staleTime: 0,
  });

  useEffect(() => {
    if (isFetched && isSuccess) onSuccess(data);
  }, [isFetched, isSuccess, data]);

  const loadMore = () => {
    search.current?.set('page', (parseInt(search.current.get('page') ?? '1') + 1).toString());
    refetch();
  };

  const onSearch = debounce((value: string) => {
    search.current?.set('page', '1');
    if (value) {
      search.current?.set('keyword', value);
    } else {
      search.current?.delete('keyword');
    }

    setOptions([]);
    refetch();
  }, 500);

  return {
    search,
    options,
    isLoading: isLoading || isFetching,
    hasNextPage: hasNextPage.current,
    loadMore,
    onSearch,
    refetch,
  };
};

export default useGetCategoryOptions;
