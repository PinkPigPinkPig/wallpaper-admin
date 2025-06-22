import { useSearchParams } from 'next/navigation';

const useURLQueries = () => {
  const searchParams = useSearchParams();

  const currentPage = parseInt(searchParams.get('page') || '1');
  const currentPageSize = parseInt(searchParams.get('limit') || '10');
  const sort = JSON.parse(searchParams.get('sort') ?? '[{"orderBy":"","order":""}]')[0];

  return {
    currentPage,
    currentPageSize,
    sort,
  };
};

export default useURLQueries;
