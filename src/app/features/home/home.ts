import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartStore } from '../../core/services/cart.store';
import { WhatsAppService } from '../../core/services/whatsapp.service';
import { Product } from '../../core/models';
import { ProductCardComponent } from '../../shared/components/product-card/product-card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, ProductCardComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);
  private cartStore = inject(CartStore);
  private whatsapp = inject(WhatsAppService);

  featuredProducts = signal<Product[]>([]);

  ngOnInit(): void {
    this.featuredProducts.set(this.productService.getFeaturedProducts().slice(0, 4));
  }

  addToCart(product: Product): void {
    this.cartStore.addItem(product, 1);
  }

  openWhatsAppContact(): void {
    this.whatsapp.openWhatsApp(this.whatsapp.buildContactMessage());
  }

  openWhatsAppWholesale(): void {
    this.whatsapp.openWhatsApp(this.whatsapp.buildWholesaleMessage());
  }
}
