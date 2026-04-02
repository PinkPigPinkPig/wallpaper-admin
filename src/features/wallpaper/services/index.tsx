import { TListResponse } from "@/data/type";
import API from "@/lib/service";
import { TSaveWallpaperPayload, TWallpaper } from "../data/type";

class WallpaperServices {
  private static basePath = "/admin/wallpaper";
  static getWallpaperList(params: string) {
    const queryParams = new URLSearchParams(params);
    const queryString = queryParams.toString();

    const url = `${WallpaperServices.basePath}?${queryString}`;

    return API.get<TListResponse<TWallpaper[]>>(url);
  }

  static addWallpaper(payload: TSaveWallpaperPayload) {
    return API.post<TWallpaper>(`${WallpaperServices.basePath}`, payload);
  }

  static updateWallpaper(id: number, payload: TSaveWallpaperPayload) {
    return API.put<TWallpaper>(`${WallpaperServices.basePath}/${id}`, payload);
  }

  static getWallpaperDetail(id: number) {
    return API.get<TWallpaper>(`${WallpaperServices.basePath}/find-by/${id}`);
  }
}

export default WallpaperServices;
