export const WALLPAPER = {
  LIST: 'WALLPAPER_LIST',
};

export type WallpaperMime = {
  type: 'WallpaperMime.Static';
  value: string;
};

export type TWallpaper = {
  id: number;
  downloads: number;
  featured: number;
  mime: WallpaperMime;
  name: string;
  resolution: string;
  resourceUrl: string;
  size: string;
  tags: string;
  thumbUrl: string;
  updated: string;
  views: number;
  category_id: number;
  categoryName: string;
  numberOfMe: number;
};