export type SaleType = 'retail' | 'salon' | 'wholesale';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  categoryName?: string;
  categorySlug?: string;
  saleType: SaleType;
  imageUrl?: string;
  isActive: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}
