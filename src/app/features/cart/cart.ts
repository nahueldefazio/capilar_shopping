import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartStore } from '../../core/services/cart.store';
import { CartItem } from '../../core/models';
import { CurrencyArPipe } from '../../shared/pipes/currency-ar.pipe';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, CurrencyArPipe],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class CartComponent {
  cartStore = inject(CartStore);

  updateQuantity(item: CartItem, quantity: number): void {
    this.cartStore.updateQuantity(item.product.id, quantity);
  }

  removeItem(item: CartItem): void {
    this.cartStore.removeItem(item.product.id);
  }

  trackByProductId(_: number, item: CartItem): string {
    return item.product.id;
  }
}
