import WallpaperDetailClient from "./WallpaperDetailClient";

interface PageDetailWallpaperProps {
  params: Promise<{ id: string }>;
}

export default async function PageDetailWallpaper({ params }: PageDetailWallpaperProps) {
  const { id } = await params;
  const wallpaperId = parseInt(id);

  return <WallpaperDetailClient wallpaperId={wallpaperId} />;
}
