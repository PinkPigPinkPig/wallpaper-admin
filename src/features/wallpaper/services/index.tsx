import { TListResponse } from "@/data/type";
import API from "@/lib/service";
import { TWallpaper } from "../data/type";

class WallpaperServices {
  private static basePath = "/admin/wallpaper";
  static getWallpaperList(params: string) {
    const queryParams = new URLSearchParams(params);
    const queryString = queryParams.toString();

    const url = `${WallpaperServices.basePath}?${queryString}`;

    return API.get<TListResponse<TWallpaper[]>>(url);
  }
}

export default WallpaperServices;
