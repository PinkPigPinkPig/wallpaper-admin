export const MENU = {
    LIST: "menu-list",
}

export enum QueryOrder {
    featured = "featured",
    popular = "popular",
    recent = "recent",
    random = "random",
    noel = "noel",
    new = "new",
    live = "live"
}

export enum FilterType {
    both = "both",
    live = "live",
    wallpaper = "wallpaper"
}

export interface TMenu {
    id: number;
    filter: FilterType;
    index_in_page: number;
    page: number;
    queryOrder: QueryOrder;
    updated: string;
    wallpaper_id: number;
    category_id: number;
    wallpaperName: string;
    categoryName: string;
    thumbUrl: string;
}

export type TSaveMenuPayload = {
    filter: FilterType;
    index_in_page: number;
    page: number;
    queryOrder: QueryOrder;
    wallpaper_id: number;
    category_id: number;
};

