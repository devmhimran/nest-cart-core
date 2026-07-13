export interface CreateSubCategory {
  name: string;
  slug: string;
  categoryId: number;
}

export interface SubCategoryType {
  id: number;
  name: string;
  slug: string;
  category: { id: number; name: string; slug: string } | null;
  _count: {
    products: number;
  };
}
