import { MediaType } from './media-library';

export type CategoryImageType = Pick<
  MediaType,
  'id' | 'fileUrl' | 'fileName' | 'title'
>;

export interface CategoryType {
  id: number;
  name: string;
  slug: string;
  image: CategoryImageType | null;
  _count: {
    products: number;
    subCategories: number;
  };
}

export interface CreateCategoryType {
  name: string;
  slug: string;
  imageId?: number | null;
}
