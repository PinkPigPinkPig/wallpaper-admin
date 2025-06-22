export const MENU = {
    LIST: "menu-list",
}

export interface TMenu {
    id: number;
    filter: string;
    index_in_page: number;
    page: number;
    queryOrder: string;
    updated: string;
    wallpaper_id: number;
    category_id: number;
    wallpaperName: string;
    categoryName: string;
    thumbUrl: string;
}

