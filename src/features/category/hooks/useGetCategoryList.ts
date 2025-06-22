import { useQuery } from "@tanstack/react-query";
import CategoryServices from "../services";
import { TListResponse } from "@/data/type";
import { CATEGORY, TCategory } from "../data/type";

const useGetCategoryList = (params = 'page=1&limit=10') => {
  return useQuery<TListResponse<TCategory[]> | null, Error>({
    queryKey: [CATEGORY.LIST, params],
    queryFn: () => CategoryServices.getCategoryList(params),
    staleTime: 0,
    select: (data) => {
      if (!data) {
        return null;
      }

      return {
        data: data.data,
        totalItems: data.totalItems,
      };
    },
  });
};

export default useGetCategoryList;