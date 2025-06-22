import { TListResponse } from "@/data/type";
import { TMenu } from "../data/type";
import API from "@/lib/service";

export class MenuServices {
    private static basePath = "/wallpaper/menu"

    static getMenuList(params: string) {
        const queryParams = new URLSearchParams(params);
        const queryString = queryParams.toString();

        const url = `${MenuServices.basePath}?${queryString}`;

        return API.get<TListResponse<TMenu[]>>(url);
    }
}

export default MenuServices;