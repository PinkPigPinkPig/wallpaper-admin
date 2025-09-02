export const CATEGORY = {
  LIST: 'category-list',
};

export type TCategory = {
  id: number;
  name: string;
  thumbUrl: string;
  totalWallpaper: number;
  updated: string;
};

export type TSaveCategoryPayload = {
  name: string;
  thumbUrl: string;
};