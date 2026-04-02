import { TListResponse } from "@/data/type";
import { TMenu, TSaveMenuPayload } from "../data/type";
import API from "@/lib/service";

export class MenuServices {
    private static basePath = "/wallpaper/menu"

    static getMenuList(params: string) {
        const queryParams = new URLSearchParams(params);
        const queryString = queryParams.toString();

        const url = `${MenuServices.basePath}?${queryString}`;

        return API.get<TListResponse<TMenu[]>>(url);
    }

    static addMenu(payload: TSaveMenuPayload) {
        return API.post<TMenu>(`${MenuServices.basePath}`, payload);
    }

    static updateMenu(id: number, payload: TSaveMenuPayload) {
        return API.put<TMenu>(`${MenuServices.basePath}/${id}`, payload);
    }

    static getMenuDetail(id: number) {
        return API.get<TMenu>(`${MenuServices.basePath}/${id}`);
    }

    static deleteMenu(id: number) {
        return API.delete(`${MenuServices.basePath}/${id}`);
    }
}

export default MenuServices;