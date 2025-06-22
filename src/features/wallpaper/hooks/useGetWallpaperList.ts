import { useQuery } from '@tanstack/react-query';
import WallpaperServices from '../services';
import { TWallpaper, WALLPAPER } from '../data/type';

const useGetWallpaperList = (params = 'page=1&limit=10') => {
  return useQuery<{ data: TWallpaper[]; totalItems: number } | null, Error>({
    queryKey: [WALLPAPER.LIST, params],
    queryFn: () => WallpaperServices.getWallpaperList(params),
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

export default useGetWallpaperList;
