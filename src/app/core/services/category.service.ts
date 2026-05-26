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
      next: (cats) => this._categories.set(cats),
    });
  }

  getCategories(): Category[] {
    return this._categories();
  }
}
