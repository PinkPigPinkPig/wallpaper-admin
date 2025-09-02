import { useQuery } from "@tanstack/react-query";
import MenuServices from "../services";
import { MENU } from "../data/type";

const useGetMenuDetail = (id: number) => {
  return useQuery({
    queryKey: [MENU.LIST, id],
    queryFn: () => MenuServices.getMenuDetail(id),
    enabled: !!id,
  });
};

export default useGetMenuDetail;
