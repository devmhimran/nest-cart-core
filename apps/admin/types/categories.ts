export interface CategoryType {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  _count: {
    products: number;
    subCategories: number;
  };
}

export interface CreateCategoryType {
  name: string;
  slug: string;
  image: string | null;
}
