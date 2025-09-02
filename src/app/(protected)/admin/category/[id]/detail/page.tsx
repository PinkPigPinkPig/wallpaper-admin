import CategoryDetailClient from "./CategoryDetailClient";

interface PageDetailCategoryProps {
  params: Promise<{ id: string }>;
}

export default async function PageDetailCategory({ params }: PageDetailCategoryProps) {
  const { id } = await params;
  const categoryId = parseInt(id);

  return <CategoryDetailClient categoryId={categoryId} />;
}
