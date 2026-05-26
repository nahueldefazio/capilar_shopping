import { Component, Input, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../../core/models';
import { CurrencyArPipe } from '../../pipes/currency-ar.pipe';
import { BadgeComponent } from '../badge/badge';
import { CartStore } from '../../../core/services/cart.store';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, CurrencyArPipe, BadgeComponent],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;

  private cartStore = inject(CartStore);
  qty = signal(1);

  decQty(): void {
    if (this.qty() > 1) this.qty.update((q) => q - 1);
  }

  incQty(): void {
    if (this.qty() < (this.product?.stock ?? 99)) this.qty.update((q) => q + 1);
  }

  onAddToCart(event: Event): void {
    event.preventDefault();
    this.cartStore.addItem(this.product, this.qty());
    this.qty.set(1);
  }
}
