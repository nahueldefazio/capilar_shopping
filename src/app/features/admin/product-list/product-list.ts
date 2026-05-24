import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models';
import { CurrencyArPipe } from '../../../shared/pipes/currency-ar.pipe';

@Component({
  selector: 'app-admin-product-list',
  standalone: true,
  imports: [RouterLink, CurrencyArPipe],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class AdminProductListComponent implements OnInit {
  private productService = inject(ProductService);
  products = signal<Product[]>([]);

  ngOnInit(): void {
    this.products.set(this.productService.getAllProductsAdmin());
  }

  toggleStatus(product: Product): void {
    this.productService.toggleProductStatus(product.id);
    this.products.set(this.productService.getAllProductsAdmin());
  }
}
