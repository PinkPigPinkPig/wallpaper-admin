import { useQuery } from '@tanstack/react-query';
import WallpaperServices from '../services';
import { TWallpaper, WALLPAPER } from '../data/type';

const useGetWallpaperDetail = (id: number) => {
  return useQuery<TWallpaper | null, Error>({
    queryKey: [WALLPAPER.DETAIL, id],
    queryFn: () => WallpaperServices.getWallpaperDetail(id),
    enabled: !!id && id > 0, // Only run query if id is valid
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data) => {
      if (!data) {
        return null;
      }
      return data;
    },
  });
};

export default useGetWallpaperDetail;
