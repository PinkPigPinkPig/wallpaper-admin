import { useQuery } from "@tanstack/react-query";
import CategoryServices from "../services";
import { CATEGORY } from "../data/type";

const useGetCategoryDetail = (id: number) => {
  return useQuery({
    queryKey: [CATEGORY.LIST, id],
    queryFn: () => CategoryServices.getCategoryDetail(id),
    enabled: !!id,
  });
};

export default useGetCategoryDetail;
