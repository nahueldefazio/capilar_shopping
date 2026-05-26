import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models';
import { CurrencyArPipe } from '../../../shared/pipes/currency-ar.pipe';
import { LoadingComponent } from '../../../shared/components/loading/loading';

@Component({
  selector: 'app-admin-product-list',
  standalone: true,
  imports: [RouterLink, FormsModule, CurrencyArPipe, LoadingComponent],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class AdminProductListComponent implements OnInit {
  private productService = inject(ProductService);
  products = computed(() => this.productService.products());
  loading = computed(() => this.productService.loading());

  editingStockId = signal<string | null>(null);
  editingStockValue = 0;

  ngOnInit(): void {
    this.productService.reload();
  }

  toggleStatus(product: Product): void {
    this.productService.toggleProductStatus(product.id);
  }

  startEditStock(product: Product): void {
    this.editingStockId.set(product.id);
    this.editingStockValue = product.stock;
  }

  saveStock(product: Product): void {
    if (this.editingStockValue >= 0 && this.editingStockValue !== product.stock) {
      this.productService.updateStock(product.id, this.editingStockValue);
    }
    this.editingStockId.set(null);
  }

  cancelEditStock(): void {
    this.editingStockId.set(null);
  }
}
