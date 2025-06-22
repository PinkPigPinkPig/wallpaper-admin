import { useQuery } from "@tanstack/react-query";
import { MENU, TMenu } from "../data/type";
import { TListResponse } from "@/data/type";
import MenuServices from "../services";

const useGetMenuList = (params = 'page=1&limit=10') => {
    return useQuery<TListResponse<TMenu[]> | null, Error>({
        queryKey: [MENU.LIST, params],
        queryFn: () => MenuServices.getMenuList(params),
        staleTime: 0,
        select: (data) => {
            if (!data) {
                return null;
            }

            return {
                data: data.data,
                totalItems: data.totalItems,
            }
        },
    })
}

export default useGetMenuList;