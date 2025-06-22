import { TListResponse } from "@/data/type";
import API from "@/lib/service";
import { TCategory } from "../data/type";

class CategoryServices {
  private static basePath = "/wallpaper/category";
  static getCategoryList(params: string) {
    const queryParams = new URLSearchParams(params);
    const queryString = queryParams.toString();

    const url = `${CategoryServices.basePath}?${queryString}`;

    return API.get<TListResponse<TCategory[]>>(url);
  }
}

export default CategoryServices;
