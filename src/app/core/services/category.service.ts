import { Injectable } from '@angular/core';
import { Category } from '../models';
import { MOCK_CATEGORIES } from './mock-data';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  getCategories(): Category[] {
    return MOCK_CATEGORIES;
  }
}
