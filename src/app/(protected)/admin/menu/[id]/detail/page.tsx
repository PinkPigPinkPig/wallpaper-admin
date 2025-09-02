import MenuDetailClient from "./MenuDetailClient";

interface PageDetailMenuProps {
  params: Promise<{ id: string }>;
}

export default async function PageDetailMenu({ params }: PageDetailMenuProps) {
  const { id } = await params;
  const menuId = parseInt(id);

  return <MenuDetailClient menuId={menuId} />;
}
