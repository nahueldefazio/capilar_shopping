import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { CartStore } from '../../core/services/cart.store';
import { CategoryService } from '../../core/services/category.service';
import { Product, Category, SaleType } from '../../core/models';
import { ProductCardComponent } from '../../shared/components/product-card/product-card';
import { LoadingComponent } from '../../shared/components/loading/loading';

type SortOption = 'default' | 'price-asc' | 'price-desc';
type FilterSaleType = SaleType | 'all';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [FormsModule, ProductCardComponent, LoadingComponent],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class ProductsComponent implements OnInit {
  private productService = inject(ProductService);
  private cartStore = inject(CartStore);
  private categoryService = inject(CategoryService);
  private route = inject(ActivatedRoute);

  categories = signal<Category[]>([]);
  searchQuery = signal('');
  selectedCategory = signal('todos');
  selectedSaleType = signal<FilterSaleType>('all');
  sortBy = signal<SortOption>('default');
  loading = signal(false);

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
    this.categories.set(this.categoryService.getCategories());

    this.route.queryParams.subscribe((params) => {
      if (params['categoria']) this.selectedCategory.set(params['categoria']);
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

  addToCart(product: Product): void {
    this.cartStore.addItem(product, 1);
  }
}
