import { Injectable, signal } from '@angular/core';
import { Product, SaleType } from '../models';
import { MOCK_PRODUCTS } from './mock-data';

// Ready to inject HttpClient and replace mock methods with HTTP calls
@Injectable({ providedIn: 'root' })
export class ProductService {
  private _products = signal<Product[]>(MOCK_PRODUCTS);

  getProducts(): Product[] {
    return this._products().filter((p) => p.isActive);
  }

  getFeaturedProducts(): Product[] {
    return this._products().filter((p) => p.isActive && p.featured);
  }

  getProductBySlug(slug: string): Product | undefined {
    return this._products().find((p) => p.slug === slug && p.isActive);
  }

  getRelatedProducts(product: Product): Product[] {
    return this._products()
      .filter(
        (p) =>
          p.isActive &&
          p.id !== product.id &&
          (p.categoryId === product.categoryId || p.saleType === product.saleType)
      )
      .slice(0, 4);
  }

  searchProducts(query: string, categorySlug?: string, saleType?: SaleType): Product[] {
    const q = query.toLowerCase().trim();
    return this._products().filter((p) => {
      if (!p.isActive) return false;
      const matchesQuery = !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      const matchesCategory =
        !categorySlug || categorySlug === 'todos' || p.categoryId === this._getCategoryIdBySlug(categorySlug);
      const matchesSaleType = !saleType || p.saleType === saleType;
      return matchesQuery && matchesCategory && matchesSaleType;
    });
  }

  // Admin operations — will call HTTP PUT/POST when backend is ready
  createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const newProduct: Product = {
      ...product,
      id: `p-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this._products.update((products) => [...products, newProduct]);
    return newProduct;
  }

  updateProduct(id: string, changes: Partial<Product>): void {
    this._products.update((products) =>
      products.map((p) =>
        p.id === id ? { ...p, ...changes, updatedAt: new Date().toISOString() } : p
      )
    );
  }

  updateStock(id: string, stock: number): void {
    this.updateProduct(id, { stock });
  }

  toggleProductStatus(id: string): void {
    this._products.update((products) =>
      products.map((p) =>
        p.id === id ? { ...p, isActive: !p.isActive, updatedAt: new Date().toISOString() } : p
      )
    );
  }

  getAllProductsAdmin(): Product[] {
    return this._products();
  }

  private _getCategoryIdBySlug(slug: string): string {
    const map: Record<string, string> = {
      'cuidado-capilar': 'cat-1',
      'tratamientos': 'cat-2',
      'peluquerias': 'cat-3',
      'mayorista': 'cat-4',
      'combos': 'cat-5',
    };
    return map[slug] ?? '';
  }
}
