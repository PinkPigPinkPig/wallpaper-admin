import { TMimeType } from "@/data/type";

export const WALLPAPER = {
  LIST: 'WALLPAPER_LIST',
  DETAIL: 'WALLPAPER_DETAIL',
};

export type TWallpaper = {
  id: number;
  downloads: number;
  featured: number;
  mime: TMimeType;
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

export type TSaveWallpaperPayload = {
  name: string;
  categoryId: number;
  tags: string;
  resolution: string;
  size: string;
  mime: TMimeType;
  resourceUrl: string;
  thumbUrl: string;
};