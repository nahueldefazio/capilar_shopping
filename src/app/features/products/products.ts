import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { Category, SaleType } from '../../core/models';
import { ProductCardComponent } from '../../shared/components/product-card/product-card';
import { LoadingComponent } from '../../shared/components/loading/loading';

type SortOption = 'default' | 'price-asc' | 'price-desc';
type FilterSaleType = SaleType | 'all';

const MAIN_CATEGORY_TO_SALE_TYPE: Record<string, FilterSaleType> = {
  particulares: 'retail',
  peluquerias: 'salon',
  mayorista: 'wholesale',
};

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [FormsModule, ProductCardComponent, LoadingComponent],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class ProductsComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private route = inject(ActivatedRoute);

  categories = this.categoryService.categories;
  mainCategories = computed(() => this.categories().filter((category) => !category.parentId));
  searchQuery = signal('');
  selectedCategory = signal('todos');
  selectedSaleType = signal<FilterSaleType>('all');
  sortBy = signal<SortOption>('default');
  loading = this.productService.loading;

  filteredProducts = computed(() => {
    const saleType = this.selectedSaleType() === 'all' ? undefined : this.selectedSaleType() as SaleType;
    let results = this.productService.searchProducts(
      this.searchQuery(),
      this.selectedCategory() === 'todos' ? undefined : this.selectedCategory(),
      saleType
    );

    if (this.sortBy() === 'price-asc') {
      results = [...results].sort((a, b) => a.price - b.price);
    } else if (this.sortBy() === 'price-desc') {
      results = [...results].sort((a, b) => b.price - a.price);
    }

    return results;
  });

  ngOnInit(): void {
    this.productService.load();
    this.categoryService.load();

    this.route.queryParams.subscribe((params) => {
      if (params['categoria']) {
        this.selectedCategory.set(params['categoria']);
        if (params['categoria'] === 'plasma') this.selectedSaleType.set('retail');
      }
      if (params['tipo']) this.selectedSaleType.set(params['tipo'] as FilterSaleType);
    });
  }

  onSearch(value: string): void {
    this.searchQuery.set(value);
  }

  selectCategory(slug: string): void {
    this.selectedCategory.set(slug);
  }

  selectSaleType(type: FilterSaleType): void {
    this.selectedSaleType.set(type);
    this.selectedCategory.set('todos');
  }

  selectMainCategory(slug: string): void {
    this.selectSaleType(MAIN_CATEGORY_TO_SALE_TYPE[slug] ?? 'all');
  }

  saleTypeForMainCategory(slug: string): FilterSaleType {
    return MAIN_CATEGORY_TO_SALE_TYPE[slug] ?? 'all';
  }

  childCategories(parentId: string): Category[] {
    return this.categories().filter((category) => category.parentId === parentId);
  }

  isMainCategoryExpanded(slug: string): boolean {
    const saleType = this.saleTypeForMainCategory(slug);
    return this.selectedSaleType() === saleType;
  }

  onSortChange(value: string): void {
    this.sortBy.set(value as SortOption);
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedCategory.set('todos');
    this.selectedSaleType.set('all');
    this.sortBy.set('default');
  }

}
