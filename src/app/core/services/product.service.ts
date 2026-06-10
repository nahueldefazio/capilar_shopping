import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Product, SaleType } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  private _products = signal<Product[]>([]);
  private _loading = signal(false);
  private _loaded = false;

  loading = this._loading.asReadonly();
  products = this._products.asReadonly();

  load(): void {
    if (this._loaded) return;
    this._loaded = true;
    this._loading.set(true);
    this.http.get<Product[]>(`${this.base}/products`).subscribe({
      next: (products) => {
        this._products.set(products.map((product) => this.normalizeProduct(product)));
        this._loading.set(false);
      },
      error: () => this._loading.set(false),
    });
  }

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
      const description = p.description ?? '';
      const matchesQuery = !q || p.name.toLowerCase().includes(q) || description.toLowerCase().includes(q);
      const matchesCategory = !categorySlug || categorySlug === 'todos' || p.categorySlug === categorySlug;
      const matchesSaleType = !saleType || p.saleType === saleType;
      return matchesQuery && matchesCategory && matchesSaleType;
    });
  }

  getAllProductsAdmin(): Product[] {
    return this._products();
  }

  createProduct(data: Partial<Product>): void {
    this.http.post<Product>(`${this.base}/products`, data).subscribe((p) => {
      this._products.update((list) => [...list, this.normalizeProduct(p)]);
    });
  }

  updateProduct(id: string, changes: Partial<Product>): void {
    this.http.patch<Product>(`${this.base}/products/${id}`, changes).subscribe((updated) => {
      const product = this.normalizeProduct(updated);
      this._products.update((list) => list.map((p) => (p.id === product.id ? product : p)));
    });
  }

  toggleProductStatus(id: string): void {
    const product = this._products().find((p) => p.id === id);
    if (!product) return;
    this.updateProduct(id, { isActive: !product.isActive });
  }

  updateStock(id: string, stock: number): void {
    this.http.patch<Product>(`${this.base}/products/${id}/stock`, { stock }).subscribe((updated) => {
      const product = this.normalizeProduct(updated);
      this._products.update((list) => list.map((p) => (p.id === product.id ? product : p)));
    });
  }

  reload(): void {
    this._loaded = false;
    this.load();
  }

  private normalizeProduct(product: Product): Product {
    return {
      ...product,
      id: String(product.id),
      price: Number(product.price),
      description: product.description ?? '',
      categoryId: String(product.categoryId ?? product.category?.id ?? ''),
      categoryName: product.categoryName ?? product.category?.name ?? '',
      categorySlug: product.categorySlug ?? product.category?.slug ?? '',
    };
  }
}
