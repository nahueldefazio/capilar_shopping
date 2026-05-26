import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartStore } from '../../core/services/cart.store';
import { WhatsAppService } from '../../core/services/whatsapp.service';
import { Product } from '../../core/models';
import { CurrencyArPipe } from '../../shared/pipes/currency-ar.pipe';
import { BadgeComponent } from '../../shared/components/badge/badge';
import { ProductCardComponent } from '../../shared/components/product-card/product-card';
import { LoadingComponent } from '../../shared/components/loading/loading';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink, CurrencyArPipe, BadgeComponent, ProductCardComponent, LoadingComponent],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cartStore = inject(CartStore);
  private whatsapp = inject(WhatsAppService);

  loading = this.productService.loading;
  product = signal<Product | null>(null);
  relatedProducts = signal<Product[]>([]);
  quantity = signal(1);
  notFound = signal(false);
  addedToCart = signal(false);

  private _slug = signal('');

  constructor() {
    effect(() => {
      const slug = this._slug();
      if (!slug) return;
      const found = this.productService.products().find((p) => p.slug === slug && p.isActive);
      if (found) {
        this.product.set(found);
        this.relatedProducts.set(this.productService.getRelatedProducts(found));
        this.notFound.set(false);
      } else if (this.productService.products().length > 0) {
        this.notFound.set(true);
      }
    });
  }

  ngOnInit(): void {
    this.productService.load();
    this.route.params.subscribe(({ slug }) => {
      this._slug.set(slug);
      this.quantity.set(1);
      this.addedToCart.set(false);
    });
  }

  increment(): void {
    const product = this.product();
    if (product && this.quantity() < product.stock) {
      this.quantity.update((q) => q + 1);
    }
  }

  decrement(): void {
    if (this.quantity() > 1) this.quantity.update((q) => q - 1);
  }

  addToCart(): void {
    const product = this.product();
    if (!product || product.stock === 0) return;
    this.cartStore.addItem(product, this.quantity());
    this.addedToCart.set(true);
    setTimeout(() => this.addedToCart.set(false), 2500);
  }

  addRelatedToCart(product: Product): void {
    this.cartStore.addItem(product, 1);
  }

  openWhatsApp(): void {
    const product = this.product();
    if (!product) return;
    this.whatsapp.openWhatsApp(this.whatsapp.buildProductMessage(product));
  }
}
