import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Category } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  private _categories = signal<Category[]>([]);
  private _loaded = false;

  readonly categories = this._categories.asReadonly();

  load(): void {
    if (this._loaded) return;
    this._loaded = true;
    this.http.get<Category[]>(`${this.base}/categories`).subscribe({
      next: (cats) => {
        const categories = cats.map((cat) => this.normalizeCategory(cat));
        const particulares = categories.find((cat) => cat.slug === 'particulares');
        this._categories.set(
          categories.map((cat) =>
            cat.slug === 'plasma' && !cat.parentId && particulares
              ? { ...cat, parentId: particulares.id }
              : cat
          )
        );
      },
    });
  }

  getCategories(): Category[] {
    return this._categories();
  }

  private normalizeCategory(category: Category): Category {
    return {
      ...category,
      id: String(category.id),
      parentId: category.parentId ? String(category.parentId) : null,
    };
  }
}
