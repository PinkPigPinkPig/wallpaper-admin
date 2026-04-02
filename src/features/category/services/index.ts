import { TListResponse } from "@/data/type";
import API from "@/lib/service";
import { TCategory, TSaveCategoryPayload } from "../data/type";

class CategoryServices {
  private static basePath = "/wallpaper/category";
  static getCategoryList(params: string) {
    const queryParams = new URLSearchParams(params);
    const queryString = queryParams.toString();

    const url = `${CategoryServices.basePath}?${queryString}`;

    return API.get<TListResponse<TCategory[]>>(url);
  }

  static addCategory(payload: TSaveCategoryPayload) {
    return API.post<TCategory>(`${CategoryServices.basePath}`, payload);
  }

  static updateCategory(id: number, payload: TSaveCategoryPayload) {
    return API.put<TCategory>(`${CategoryServices.basePath}/${id}`, payload);
  }

  static getCategoryDetail(id: number) {
    return API.get<TCategory>(`${CategoryServices.basePath}/${id}`);
  }

  static deleteCategory(id: number) {
    return API.delete(`${CategoryServices.basePath}/${id}`);
  }
}

export default CategoryServices;
